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
  // The people this wallet talks to, and what was said with one of them.
  const minutes = 60;
  const contacts = [
    { id: "c-ana", name: "Ana Torres", alias: null, theirName: "Ana Torres", fingerprint: "7F3A 91C2 0B4E", pending: false, since: now - 30 * day, unread: 2, last: { content: lang === "es" ? "¿Nos vemos a las diez?" : "See you at ten?", at: now - 4 * minutes, mine: false }, cleared: false },
    { id: "c-marco", name: "Marco Rossi", alias: null, theirName: "Marco Rossi", fingerprint: "C21D 5E08 A9F7", pending: false, since: now - 12 * day, unread: 0, last: { content: lang === "es" ? "Gracias, ¡recibido!" : "Thanks, got it!", at: now - day, mine: true }, cleared: false },
    { id: "c-new", name: "4B9E 22D1 07AC", alias: null, theirName: null, fingerprint: "4B9E 22D1 07AC", pending: true, since: now - 2 * minutes, unread: 0, last: null, cleared: false },
  ];
  const said = {
    en: [
      [false, "Hi Lucía! Did your degree arrive in the wallet?", 40],
      [true, "Yes, this morning. It took a minute.", 35],
      [false, "Great. Bring it to the office tomorrow.", 6],
      [false, "See you at ten?", 4],
    ],
    es: [
      [false, "¡Hola, Lucía! ¿Te llegó el título al wallet?", 40],
      [true, "Sí, esta mañana. Tardó un minuto.", 35],
      [false, "Genial. Tráelo mañana a la oficina.", 6],
      [false, "¿Nos vemos a las diez?", 4],
    ],
  }[lang].map(([mine, content, ago], index) => ({ id: `m${index}`, mine, content, at: now - ago * minutes, failed: false }));
  const mediated = scene.mediator !== "none";
  // Who listens to which event, so a scene can make one happen.
  const listeners = new Map();
  let open = scene.vault === "open";

  const vault = () =>
    scene.vault === "new"
      ? { exists: false, problem: null, pin: false, digits: null, deviceLock: false, deviceKey: false, deviceUnlock: false, attemptsLeft: 10, home: null, version: null }
      : { exists: true, problem: null, pin: true, digits: 6, deviceLock: false, deviceKey: false, deviceUnlock: false, attemptsLeft: 10, home: "keystore", version: 2 };

  const answers = {
    platform_info: () => ({ kind: scene.platform ?? "mobile", barcodeScanner: true }),
    vault_status: vault,
    vault_open: () => ((open = true), identity),
    vault_open_with_device: () => ((open = true), identity),
    vault_create: () => ((open = true), vault()),
    identity_draft: () => words[lang].split(" "),
    identity_create: () => identity,
    credentials_list: () => held,
    credentials_check: () => held,
    contacts_list: () => contacts,
    messages_sync: () => ({ changed: 0, contacts }),
    conversation_read: ({ id }) => ({ contact: contacts.find((c) => c.id === id) ?? contacts[0], entries: id === "c-ana" ? said : [] }),
    invitation_show: () => ({ url: "almena://invite?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiJ9" }),
    mediator_status: () =>
      mediated
        ? { mediator: "did:web:mediator.almena.id", inbox: "did:peer:2.Ez6LSdemo" }
        : { mediator: null, inbox: null },
    mediator_check: () => ({ messageCount: 0 }),
    profile_read: () => ({ name: "Lucía García" }),
    profile_photo_read: () => null,
    invitation_kind: () => scene.kind ?? "registry",
    registry_request: () => scene.request,
    link_details: () => scene.details ?? { kind: "registry" },
    "plugin:deep-link|get_current": () => (scene.link ? [scene.link] : null),
    "plugin:event|listen": ({ event, handler }) => {
      listeners.set(event, [...(listeners.get(event) ?? []), handler]);
      return handler;
    },
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
  // Makes `event` happen, as the Rust side would emit it.
  window.__MOCK_EMIT__ = (event, payload) => {
    for (const id of listeners.get(event) ?? []) callbacks.get(id)?.({ event, id, payload });
  };
})();
