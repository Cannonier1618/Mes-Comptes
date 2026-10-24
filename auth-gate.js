// Authentification Supabase par lien e-mail et ajout automatique du propriétaire aux écritures.
(() => {
  const client = window.supabase.createClient(
    "https://fbefapylkbzvbncowjmf.supabase.co",
    "sb_publishable_a8tU5B_VVCpOOdX6ekyTdA_WcK72wxi"
  );

  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  let activeUser = null;

  const panel = document.createElement("section");
  panel.id = "authGate";
  panel.innerHTML = `
    <div class="authCard">
      <h1>Mes Comptes</h1>
      <p id="authMessage">Connecte-toi avec le lien envoyé par e-mail pour accéder à tes données.</p>
      <form id="authForm">
        <label for="authEmail">Adresse e-mail</label>
        <input id="authEmail" type="email" autocomplete="email" required>
        <button id="authSubmit" type="submit">Recevoir mon lien de connexion</button>
      </form>
      <p id="authError" role="alert"></p>
    </div>`;
  document.head.insertAdjacentHTML("beforeend", `<style>
    #authGate{position:fixed;inset:0;z-index:99999;background:#f4f6fa;display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif}
    #authGate .authCard{width:min(100%,420px);background:white;border-radius:18px;padding:32px;box-shadow:0 12px 40px #15233b22}
    #authGate h1{margin:0 0 12px} #authGate p{line-height:1.5}
    #authGate label{display:block;margin:18px 0 6px}
    #authGate input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #bbc4d1;border-radius:8px;font:inherit}
    #authGate button{width:100%;margin-top:14px;padding:12px;border:0;border-radius:8px;background:#3b82f6;color:#fff;font:inherit;font-weight:600;cursor:pointer}
    #authError{color:#b42318}
  </style>`);
  document.body.appendChild(panel);

  const form = panel.querySelector("#authForm");
  const message = panel.querySelector("#authMessage");
  const errorBox = panel.querySelector("#authError");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = panel.querySelector("#authSubmit");
    button.disabled = true;
    errorBox.textContent = "";
    const { error } = await client.auth.signInWithOtp({
      email: panel.querySelector("#authEmail").value.trim(),
      options: { emailRedirectTo: window.location.href.split("#")[0] }
    });
    button.disabled = false;
    if (error) {
      errorBox.textContent = error.message;
      return;
    }
    message.textContent = "Lien envoyé. Ouvre l’e-mail sur cet appareil et clique sur le lien pour te connecter.";
  });

  client.auth.onAuthStateChange((_event, session) => {
    activeUser = session?.user || null;
    if (activeUser) {
      panel.remove();
      resolveReady();
    } else {
      panel.style.display = "grid";
    }
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) errorBox.textContent = error.message;
    if (data.session?.user) {
      activeUser = data.session.user;
      panel.remove();
      resolveReady();
    }
  }).catch(error => { errorBox.textContent = error.message; });

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith("https://fbefapylkbzvbncowjmf.supabase.co/rest/v1/")) {
      return originalFetch(input, init);
    }
    await ready;
    const { data } = await client.auth.getSession();
    const session = data.session;
    if (!session || !activeUser) throw new Error("Connexion Supabase requise.");

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    headers.set("Authorization", `Bearer ${session.access_token}`);
    const method = (init.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    const table = new URL(url).pathname.split("/").pop();
    let body = init.body;
    if (body && (method === "POST" || method === "PATCH") && ["expenses", "settings"].includes(table)) {
      try {
        const payload = JSON.parse(body);
        if (Array.isArray(payload)) body = JSON.stringify(payload.map(row => ({ ...row, user_id: activeUser.id })));
        else body = JSON.stringify({ ...payload, user_id: activeUser.id });
      } catch (_) {}
    }
    return originalFetch(input, { ...init, method, headers, body });
  };
})();