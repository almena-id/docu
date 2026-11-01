// What the wallet's Rust side would answer, for taking the documentation's
// screenshots of its interface in a browser (scripts/wallet-screenshots.mjs).
// Run in the page before the app: it stands in for Tauri's IPC
// (`window.__TAURI_INTERNALS__`) with a demo identity and its credentials. The
// scenario — `new`, `locked`, or a link to open — comes in `window.__SCENE__`.
(() => {
  const scene = window.__SCENE__ ?? { vault: "locked" };
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  const did = "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";
  const identity = { did, publicKey: did.slice(8), document: { id: did } };
  const nova = "did:webvh:QmWx8cVb2:almena.id:nova-university:iss_8qkg3vbiikpo";
  const staff = "did:webvh:QmTn4pLe7:almena.id:nova-university:iss_byso2cpm1pov";
  const scope = (issuer) => `https://almena.id ${issuer}`;
  const held = [
    {
      id: "cred-degree",
      format: "dc+sd-jwt",
      issuerDid: nova,
      issuerName: "Nova Academic Office",
      typeId: "academic_degree",
      typeLabels: { en: "Academic qualification", es: "Título académico" },
      claims: {
        given_name: "Lucía",
        family_name: "García",
        degree_name: "Bachelor of Laws",
        education_level: "Bachelor",
        awarded_on: "2026-06-30",
      },
      issuedAt: now - 3 * day,
      validUntil: now + 3650 * day,
      receivedAt: now - 3 * day,
      scope: scope(nova),
      checked: { status: "valid", at: now - 60, problem: null },
    },
    {
      id: "cred-membership",
      format: "dc+sd-jwt",
      issuerDid: nova,
      issuerName: "Nova Academic Office",
      typeId: "membership",
      typeLabels: { en: "Membership", es: "Afiliación" },
      claims: { given_name: "Lucía", family_name: "García", member_number: "NU-20418" },
      issuedAt: now - 40 * day,
      validUntil: now + 325 * day,
      receivedAt: now - 40 * day,
      scope: scope(nova),
      checked: { status: "valid", at: now - 60, problem: null },
    },
    {
      id: "cred-employment",
      format: "dc+sd-jwt",
      issuerDid: staff,
      issuerName: "Nova Staff Office",
      typeId: "employment",
      typeLabels: { en: "Employment relationship", es: "Relación laboral" },
      claims: { given_name: "Lucía", family_name: "García", job_title: "Teaching assistant" },
      issuedAt: now - 200 * day,
      validUntil: now + 165 * day,
      receivedAt: now - 200 * day,
      scope: scope(staff),
      checked: { status: "suspended", at: now - 60, problem: null },
    },
  ];
  const words = {
    en: "orbit valley harbor silent maple engine gentle prism lunar canyon velvet ripple",
    es: "órbita valle puerto silencio arce motor suave prisma luna cañón terciopelo onda",
  };
  const lang = navigator.language.startsWith("es") ? "es" : "en";
  let open = scene.vault === "open";

  const vault = () =>
    scene.vault === "new"
      ? { exists: false, problem: null, pin: false, digits: null, deviceLock: false, deviceKey: false, deviceUnlock: false, attemptsLeft: 10, home: null, version: null }
      : { exists: true, problem: null, pin: true, digits: 6, deviceLock: false, deviceKey: false, deviceUnlock: false, attemptsLeft: 10, home: "keystore", version: 2 };

  const answers = {
    platform_info: () => ({ kind: "mobile", barcodeScanner: true }),
    vault_status: vault,
    vault_open: () => ((open = true), identity),
    vault_open_with_device: () => ((open = true), identity),
    vault_create: () => ((open = true), vault()),
    identity_draft: () => words[lang].split(" "),
    identity_create: () => identity,
    credentials_list: () => held,
    credentials_check: () => held,
    contacts_list: () => [],
    messages_sync: () => ({ changed: false, received: 0 }),
    mediator_status: () => ({ mediator: "did:web:mediator.almena.id", inbox: "did:peer:2.Ez6LSdemo" }),
    mediator_check: () => ({ messageCount: 0 }),
    profile_read: () => ({ name: "Lucía García" }),
    profile_photo_read: () => null,
    invitation_kind: () => "registry",
    registry_request: () => scene.request,
    link_details: () => ({ kind: "registry" }),
    "plugin:deep-link|get_current": () => (scene.link ? [scene.link] : null),
    "plugin:event|listen": () => Math.floor(Math.random() * 1e6),
    "plugin:event|unlisten": () => null,
    "plugin:app|version": () => "2026.11.1",
  };

  const callbacks = new Map();
  let next = 1;
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: "main" }, currentWebview: { windowLabel: "main", label: "main" } },
    transformCallback(callback) {
      const id = next++;
      callbacks.set(id, callback);
      return id;
    },
    unregisterCallback(id) {
      callbacks.delete(id);
    },
    convertFileSrc: (path) => path,
    async invoke(command, args) {
      const answer = answers[command];
      if (answer) return answer(args);
      // Anything else: done, with nothing to say.
      return null;
    },
  };
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
  window.__MOCK_OPEN__ = () => open;
})();
