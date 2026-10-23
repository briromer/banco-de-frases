// sync.js — cross-device progress sync through a private GitHub Gist.
// Loaded before app.js. Exposes window.BancoSync { init, notifyChange, ... }.
(function(){
  "use strict";

  var TOKEN_KEY = "banco_sync_token_v1";   // local only, never synced
  var META_KEY  = "banco_sync_meta_v1";    // local only: {gistId, localUpdatedAt, lastSyncedAt}
  var FILE_NAME = "banco-de-frases-sync.json";
  var API = "https://api.github.com";
  var SYNC_KEYS = [
    "banco_progress_v1", "banco_mine_v1", "banco_quiz_v1",
    "cognados_progress_v1", "cognados_mine_v1", "cognados_quiz_v1",
    "banco_prefs_v1"
  ];
  var PUSH_DELAY = 2000;
  var PULL_THROTTLE = 30000;

  var state = "off";            // off | ok | syncing | error
  var statusText = "sin conectar";
  var pushTimer = null;
  var busy = false;
  var again = false;
  var lastPullAt = 0;

  // ---- local-only storage (bypasses app.js saveJSON on purpose) ----
  function getToken(){
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch(e){ return ""; }
  }
  function getMeta(){
    try {
      var m = JSON.parse(localStorage.getItem(META_KEY) || "null");
      if (m && typeof m === "object") return m;
    } catch(e){ /* ignore */ }
    return { gistId: null, localUpdatedAt: 0, lastSyncedAt: 0 };
  }
  function setMeta(m){
    try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch(e){ /* ignore */ }
  }

  // ---- status / UI ----
  function ago(ts){
    if (!ts) return "";
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 45) return "hace unos segundos";
    var m = Math.round(s / 60);
    if (m < 60) return "hace " + m + " min";
    var h = Math.round(m / 60);
    if (h < 24) return "hace " + h + " h";
    var d = Math.round(h / 24);
    return "hace " + d + (d === 1 ? " día" : " días");
  }
  function setStatus(st, text){
    state = st;
    statusText = text;
    renderUI();
  }
  function setOk(){
    setStatus("ok", "Sincronizado " + ago(getMeta().lastSyncedAt || Date.now()));
  }
  function el(id){ return document.getElementById(id); }
  function renderUI(){
    try {
      var btn = el("sync-btn");
      if (btn) {
        btn.setAttribute("data-state", state);
        btn.setAttribute("aria-label", "Sincronización entre dispositivos: " + statusText);
        btn.title = statusText;
      }
      var connected = !!getToken();
      var off = el("sync-off"), on = el("sync-on"), line = el("sync-status");
      if (off) off.hidden = connected;
      if (on) on.hidden = !connected;
      if (line) {
        line.textContent = (state === "ok") ? "Sincronizado " + ago(getMeta().lastSyncedAt) : statusText;
        line.setAttribute("data-state", state);
      }
      var now = el("sync-now");
      if (now) now.disabled = (state === "syncing");
    } catch(e){ /* ignore */ }
  }

  // ---- GitHub API ----
  function ghFetch(method, url, body){
    var opts = {
      method: method,
      headers: {
        "Authorization": "Bearer " + getToken(),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts).then(function(res){
      if (res.status === 401 || res.status === 403) {
        var e = new Error("auth"); e.kind = "auth"; throw e;
      }
      if (res.status === 404) {
        var e2 = new Error("notfound"); e2.kind = "notfound"; throw e2;
      }
      if (!res.ok) {
        var e3 = new Error("http " + res.status); e3.kind = "http"; throw e3;
      }
      return res.json();
    });
  }
  function handleError(e){
    if (e && e.kind === "auth") setStatus("error", "token inválido o sin permiso 'gist'");
    else if (e && e.kind === "http") setStatus("error", "error de GitHub, reintentamos luego");
    else setStatus("error", "sin conexión");   // network failure; retried on next change/visibility
  }

  // ---- snapshot ----
  function buildSnapshot(updatedAt){
    var data = {};
    SYNC_KEYS.forEach(function(k){
      var v = null;
      try {
        var raw = localStorage.getItem(k);
        if (raw) v = JSON.parse(raw);
      } catch(e){ v = null; }
      data[k] = v;
    });
    return { app: "banco-de-frases", version: 1, updatedAt: updatedAt, data: data };
  }
  function applySnapshot(remote){
    SYNC_KEYS.forEach(function(k){
      var v = remote.data ? remote.data[k] : null;
      try {
        if (v === null || v === undefined) localStorage.removeItem(k);
        else localStorage.setItem(k, JSON.stringify(v));
      } catch(e){ /* ignore */ }
    });
  }
  function parseGistFile(gist){
    var f = gist && gist.files && gist.files[FILE_NAME];
    if (!f) return Promise.resolve(null);
    var textP;
    if (f.truncated && f.raw_url) {
      textP = fetch(f.raw_url).then(function(r){
        if (!r.ok) { var e = new Error("http"); e.kind = "http"; throw e; }
        return r.text();
      });
    } else {
      textP = Promise.resolve(f.content);
    }
    return textP.then(function(t){
      try {
        var o = JSON.parse(t);
        if (o && o.app === "banco-de-frases" && o.data && typeof o.data === "object") return o;
      } catch(e){ /* ignore */ }
      return null;
    });
  }

  // ---- push ----
  function push(meta){
    var updatedAt = meta.localUpdatedAt || Date.now();
    var snap = buildSnapshot(updatedAt);
    var files = {}; files[FILE_NAME] = { content: JSON.stringify(snap) };
    return ghFetch("PATCH", API + "/gists/" + meta.gistId, { files: files }).then(function(){
      var m = getMeta();
      m.localUpdatedAt = Math.max(m.localUpdatedAt || 0, updatedAt);
      m.lastSyncedAt = Date.now();
      setMeta(m);
    });
  }
  function createGist(){
    var meta = getMeta();
    var updatedAt = meta.localUpdatedAt || Date.now();
    var files = {}; files[FILE_NAME] = { content: JSON.stringify(buildSnapshot(updatedAt)) };
    return ghFetch("POST", API + "/gists", {
      description: "Banco de Frases — progreso (sync)",
      "public": false,
      files: files
    }).then(function(g){
      var m = getMeta();
      m.gistId = g.id; m.localUpdatedAt = updatedAt; m.lastSyncedAt = Date.now();
      setMeta(m);
    });
  }
  function findGist(page){
    return ghFetch("GET", API + "/gists?per_page=100&page=" + page).then(function(list){
      for (var i = 0; i < list.length; i++) {
        if (list[i].files && list[i].files[FILE_NAME]) return list[i];
      }
      if (list.length === 100 && page < 5) return findGist(page + 1);
      return null;
    });
  }

  // ---- core sync: compare with remote, then pull / push / nothing ----
  function syncCore(){
    var meta = getMeta();
    if (!meta.gistId) {
      return findGist(1).then(function(found){
        if (!found) return createGist();
        var m = getMeta(); m.gistId = found.id; setMeta(m);
        return syncCore();
      });
    }
    return ghFetch("GET", API + "/gists/" + meta.gistId).then(parseGistFile).then(function(remote){
      var m = getMeta();
      var remoteTs = remote ? (Number(remote.updatedAt) || 0) : 0;
      var localTs = m.localUpdatedAt || 0;
      if (remote && remoteTs > localTs) {
        applySnapshot(remote);
        m.localUpdatedAt = remoteTs;
        m.lastSyncedAt = Date.now();
        setMeta(m);
        // After this, localUpdatedAt === remote.updatedAt, so the next pull is a no-op.
        location.reload();
        return;
      }
      if (!remote || localTs > remoteTs) return push(m);
      m.lastSyncedAt = Date.now();   // equal: nothing to do
      setMeta(m);
    }, function(e){
      if (e && e.kind === "notfound") {   // gist was deleted: start over
        var m = getMeta(); m.gistId = null; setMeta(m);
        return syncCore();
      }
      throw e;
    });
  }

  function sync(){
    if (!getToken()) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    busy = true;
    setStatus("syncing", "sincronizando…");
    return syncCore().then(function(){
      busy = false;
      setOk();
    }, function(e){
      busy = false;
      handleError(e);
    }).then(function(){
      if (again) { again = false; return sync(); }
    });
  }

  // ---- public API ----
  function notifyChange(){
    try {
      if (!getToken()) return;
      var m = getMeta();
      m.localUpdatedAt = Date.now();
      setMeta(m);
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(function(){ pushTimer = null; sync(); }, PUSH_DELAY);
    } catch(e){ /* never throw */ }
  }

  function connect(token){
    token = (token || "").replace(/\s+/g, "");
    if (!token) return;
    try { localStorage.setItem(TOKEN_KEY, token); } catch(e){ return; }
    var m = getMeta(); m.gistId = null; setMeta(m);   // first connect: look for existing gist; remote wins
    renderUI();
    sync();
  }
  function disconnect(){
    if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(META_KEY);
    } catch(e){ /* ignore */ }
    setStatus("off", "sin conectar");
  }

  function wireUI(){
    var btn = el("sync-btn"), dlg = el("sync-dialog");
    if (!btn || !dlg) return;
    btn.addEventListener("click", function(){
      renderUI();
      if (dlg.showModal) { if (!dlg.open) dlg.showModal(); }
      else dlg.setAttribute("open", "");
    });
    function close(){ if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
    el("sync-close").addEventListener("click", close);
    dlg.addEventListener("click", function(ev){ if (ev.target === dlg) close(); });
    var input = el("sync-token");
    el("sync-connect").addEventListener("click", function(){
      connect(input.value);
      input.value = "";
    });
    input.addEventListener("keydown", function(ev){
      if (ev.key === "Enter") { connect(input.value); input.value = ""; }
    });
    el("sync-now").addEventListener("click", function(){ lastPullAt = Date.now(); sync(); });
    el("sync-disconnect").addEventListener("click", disconnect);
  }

  function init(){
    try {
      wireUI();
      // Registered regardless of token so a device connected mid-session still pulls on return.
      document.addEventListener("visibilitychange", function(){
        if (document.visibilityState !== "visible" || !getToken()) return;
        var now = Date.now();
        if (now - lastPullAt < PULL_THROTTLE) { renderUI(); return; }
        lastPullAt = now;
        sync();
      });
      if (!getToken()) { setStatus("off", "sin conectar"); return; }
      setStatus("ok", "conectado");
      lastPullAt = Date.now();
      sync();
    } catch(e){ /* never break the app */ }
  }

  window.BancoSync = { init: init, notifyChange: notifyChange, syncNow: sync, connect: connect, disconnect: disconnect };
  init();
})();
