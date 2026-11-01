"""The real API on a throwaway SQLite database, filled with a demo account,
for taking the documentation's screenshots (`task screenshots`).

Run from ../api's environment: `uv run --project ../api python scripts/demo_api.py <dir>`,
with ../api on PYTHONPATH (the test helpers sign in and sign for it). It
writes `<dir>/anchor.token` and `<dir>/demo.token` — the sessions of the
trust anchor and of the demo account — then serves on 127.0.0.1:8766.
"""

import asyncio
import os
import random
import sys
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse

import uvicorn
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from registry_api.broker import get_broker
from registry_api.broker.memory import MemoryBroker
from registry_api.db import get_session
from registry_api.mail import get_mailer
from registry_api.main import app
from registry_api.models import Application, Base, Verification
from registry_api.root import create_root
from registry_api.trust_anchor import ANCHOR_NAME
from tests.conftest import Outbox
from tests.fake_wallet import FakeWallet
from tests.signing import publish, ready, sign
from tests.test_applications import _ask, _sign_submission
from tests.test_directory import _sign_in

OUT = Path(sys.argv[1]).resolve()
PORT = 8766


def token(headers: dict[str, str]) -> str:
    return headers["Authorization"].split(" ", 1)[1]


async def build(sessions: async_sessionmaker) -> None:  # type: ignore[type-arg]
    async with sessions() as db:
        await create_root(db, ANCHOR_NAME, "anchor@example.net")
    outbox = Outbox()
    app.dependency_overrides[get_mailer] = lambda: outbox
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers, tenant = await _sign_in(client, outbox, "ada@nova.example")
        base = f"/api/v1/tenants/{tenant}"
        await client.patch(
            base, json={"name": "Nova University", "languages": ["en", "es"]}, headers=headers
        )
        wallet = await ready(client, headers, tenant)
        form = (
            await client.post(
                f"{base}/forms",
                json={
                    "name": {"en": "Application", "es": "Solicitud"},
                    "description": {
                        "en": "Tell us who you are.",
                        "es": "Cuéntanos quién eres.",
                    },
                    "fields": [{"ref": "given_name"}, {"ref": "family_name"}, {"ref": "email"}],
                },
                headers=headers,
            )
        ).json()
        issuers = {}
        for name, types, about in (
            (
                "Nova Academic Office",
                ["academic_degree", "membership"],
                ("Degrees and student cards.", "Títulos y carnés de estudiante."),
            ),
            ("Nova Staff Office", ["employment"], ("Proof of employment.", "Certificados de empleo.")),
        ):
            created = (
                await client.post(
                    f"{base}/issuers",
                    json={"name": name, "description": {"en": about[0], "es": about[1]}},
                    headers=headers,
                )
            ).json()
            saved = await client.put(
                f"{base}/issuers/{created['id']}/credential-types",
                json={"types": types, "forms": {t: form["id"] for t in types}},
                headers=headers,
            )
            assert saved.status_code == 200, saved.text
            await sign(client, headers, tenant, created["identity"]["id"], wallet)
            await publish(client, headers, tenant, "issuers", created["id"])
            issuers[name] = created
        verifier = (
            await client.post(f"{base}/verifiers", json={"name": "Campus Access"}, headers=headers)
        ).json()
        await client.post(f"{base}/verifiers", json={"name": "Library"}, headers=headers)
        anchor, _ = await _sign_in(client, outbox, "anchor@example.net")

        # A few people apply as a holder would, from a wallet: these are the
        # applications the screenshots open, signed and with their answers.
        slug = next(
            item["slug"]
            for item in (await client.get("/api/v1/catalog/issuers")).json()["items"]
            if item["name"] == "Nova Academic Office"
        )
        for given, family, email in (
            ("Amina", "Haddad", "amina@example.org"),
            ("Daniel", "Ruiz", "daniel@example.org"),
            ("Lucía", "García", "lucia@example.org"),
        ):
            started = (
                await client.post(
                    "/api/v1/applications", json={"issuer": slug, "type": "academic_degree"}
                )
            ).json()
            at = f"/api/v1/applications/{started['id']}"
            secret = {"X-Application-Secret": started["secret"]}
            holder = FakeWallet()
            pairing = await _ask(client, at, secret, "pair")
            await client.post(
                urlparse(pairing["response_uri"]).path, data={"id_token": holder.id_token(pairing)}
            )
            answers = {"given_name": given, "family_name": family, "email": email}
            saved = await client.put(f"{at}/answers", json={"answers": answers}, headers=secret)
            assert saved.status_code == 200, saved.text
            submit = await _ask(client, at, secret, "submit")
            sent = await client.post(
                urlparse(submit["response_uri"]).path,
                json={"signature": _sign_submission(holder, submit)},
            )
            assert sent.status_code < 300, sent.text
        real = started["id"]

    # Some weeks of activity, the same every time.
    now = datetime.now(UTC)
    rnd = random.Random(7)
    issuer_id = uuid.UUID(issuers["Nova Academic Office"]["id"])
    async with sessions() as db:
        for back in range(45):
            day = now - timedelta(days=back, hours=rnd.randint(0, 6))
            for _ in range(rnd.randint(0, 6) + (3 if back < 10 else 0)):
                fate = rnd.random()
                status = (
                    "submitted"
                    if back < 3 and fate < 0.4
                    else "rejected"
                    if fate < 0.15
                    else "accepted"
                    if fate < 0.3
                    else "issued"
                )
                db.add(
                    Application(
                        tenant_id=uuid.UUID(tenant),
                        issuer_id=issuer_id,
                        form_id=uuid.UUID(form["id"]),
                        credential_type="academic_degree",
                        status=status,
                        secret_hash=os.urandom(32),
                        expires_at=now + timedelta(days=1),
                        submitted_at=day,
                        decided_at=day + timedelta(hours=2) if status != "submitted" else None,
                        issued_at=day + timedelta(hours=3) if status == "issued" else None,
                        credential_status=(
                            "revoked"
                            if rnd.random() < 0.08
                            else "suspended"
                            if rnd.random() < 0.06
                            else None
                        )
                        if status == "issued"
                        else None,
                    )
                )
            for _ in range(rnd.randint(0, 5)):
                db.add(
                    Verification(
                        tenant_id=uuid.UUID(tenant),
                        verifier_id=uuid.UUID(verifier["id"]),
                        form_id=uuid.UUID(form["id"]),
                        nonce=uuid.uuid4().hex,
                        expires_at=day + timedelta(minutes=5),
                        answered_at=day,
                        verified=rnd.random() > 0.12,
                    )
                )
        await db.commit()
    (OUT / "demo.token").write_text(token(headers))
    (OUT / "anchor.token").write_text(token(anchor))
    (OUT / "application.id").write_text(real)


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    engine = create_async_engine(f"sqlite+aiosqlite:///{OUT / 'demo.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def session():  # type: ignore[no-untyped-def]
        async with sessions() as db:
            yield db

    app.dependency_overrides[get_session] = session
    broker = MemoryBroker()
    app.dependency_overrides[get_broker] = lambda: broker
    await build(sessions)
    print(f"demo API on http://127.0.0.1:{PORT}", flush=True)
    await uvicorn.Server(
        uvicorn.Config(app, host="127.0.0.1", port=PORT, log_level="warning")
    ).serve()


asyncio.run(main())
