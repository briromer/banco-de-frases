// app.js
(function(){
  "use strict";

  // --- Module registry ------------------------------------------------
  // Each module bundles its own categories, items, storage keys, and quiz
  // behavior. To add a THIRD module later: build a CATS_X / DATA_X pair in
  // data.js (same shape as the ones below), then add an entry here and a
  // button in the side-switch markup in index.html.
  var MODULES = {
    frases: {
      key: "frases", label: "Frases", icon: "🎙️", side: "Lado A",
      cats: CATS_FRASES, data: DATA_FRASES,
      progressKey: "banco_progress_v1", mineKey: "banco_mine_v1", quizKey: "banco_quiz_v1",
      quizType: "blank" // fill-in-the-blank against the example sentence
    },
    cognados: {
      key: "cognados", label: "Cognados", icon: "📖", side: "Lado B",
      cats: CATS_COGNADOS, data: DATA_COGNADOS,
      progressKey: "cognados_progress_v1", mineKey: "cognados_mine_v1", quizKey: "cognados_quiz_v1",
      quizType: "translate" // show the word, guess the English meaning
    }
  };

  var activeModuleKey = "frases";
  function mod(){ return MODULES[activeModuleKey]; }

  function catColor(code){ var c = mod().cats.find(function(c){return c.code===code;}); return c ? c.color : "#555"; }
  function catName(code){ var c = mod().cats.find(function(c){return c.code===code;}); return c ? c.name : code; }

  function loadJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch(e){ return fallback; }
  }
  function saveJSON(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){ /* ignore */ }
  }
  function escapeHTML(s){
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  var progress = {};   // reloaded per-module
  var mine = {};       // reloaded per-module, keyed by module key
  var quizStats = {};  // per-module: { items:{id:{r,w,last}}, r, w, best }
  var session = {};    // per-module, in-memory only: { r, w, streak }

  // Shared UI prefs (shuffle / weak-first toggles), per module
  var PREFS_KEY = "banco_prefs_v1";
  var prefs = loadJSON(PREFS_KEY, {});
  function getPref(name){ return !!(prefs[activeModuleKey] && prefs[activeModuleKey][name]); }
  function setPref(name, val){
    prefs[activeModuleKey] = prefs[activeModuleKey] || {};
    prefs[activeModuleKey][name] = val;
    saveJSON(PREFS_KEY, prefs);
  }

  function reloadModuleStorage(){
    progress[activeModuleKey] = loadJSON(mod().progressKey, {});
    mine[activeModuleKey] = loadJSON(mod().mineKey, []);
    quizStats[activeModuleKey] = loadJSON(mod().quizKey, { items:{}, r:0, w:0, best:0 });
    session[activeModuleKey] = session[activeModuleKey] || { r:0, w:0, streak:0 };
  }
  function qs(){ return quizStats[activeModuleKey]; }
  function itemStats(id){ return qs().items[id] || { r:0, w:0 }; }

  function shuffle(arr){
    for (var i = arr.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function getStatus(id){ return (progress[activeModuleKey][id] && progress[activeModuleKey][id].status) || "new"; }
  function setStatus(id, status){
    progress[activeModuleKey][id] = progress[activeModuleKey][id] || {};
    progress[activeModuleKey][id].status = status;
    saveJSON(mod().progressKey, progress[activeModuleKey]);
  }
  function getMine(){ return mine[activeModuleKey]; }
  function setMine(list){ mine[activeModuleKey] = list; saveJSON(mod().mineKey, list); }

  // ---------------- Module switch (cassette side A/B) ----------------
  document.querySelectorAll(".side-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var key = btn.dataset.module;
      if (key === activeModuleKey) return;
      activeModuleKey = key;
      document.querySelectorAll(".side-btn").forEach(function(b){ b.classList.toggle("active", b.dataset.module === key); });
      reloadModuleStorage();
      resetLocalState();
      buildCatRow("cat-row", "browse");
      buildCatRow("cat-row-flash", "flash");
      buildCatRow("cat-row-quiz", "quiz");
      buildMineCatSelect();
      syncToggles();
      renderBrowse();
      refreshFlash();
      nextQuiz();
      renderMine();
    });
  });

  function resetLocalState(){
    activeCat = { browse:null, flash:null, quiz:null };
    searchTerm = "";
    document.getElementById("search-input").value = "";
    flashIdx = 0;
    quizQueue = []; quizQueueSig = "";
  }

  // ---------------- Toggles (shuffle cards / weak-first quiz) ----------
  function syncToggles(){
    document.getElementById("fc-shuffle").setAttribute("aria-pressed", getPref("shuffleFlash") ? "true" : "false");
    document.getElementById("quiz-weak").setAttribute("aria-pressed", getPref("weakFirst") ? "true" : "false");
  }
  document.getElementById("fc-shuffle").addEventListener("click", function(){
    setPref("shuffleFlash", !getPref("shuffleFlash"));
    syncToggles();
    flashIdx = 0;
    refreshFlash();
  });
  document.getElementById("quiz-weak").addEventListener("click", function(){
    setPref("weakFirst", !getPref("weakFirst"));
    syncToggles();
    nextQuiz();
  });

  // ---------------- Top nav (Explorar / Tarjetas / Quiz / Mis...) ----
  var views = ["browse","flash","quiz","mine"];
  document.querySelectorAll("nav.deck button").forEach(function(btn){
    btn.addEventListener("click", function(){
      document.querySelectorAll("nav.deck button").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      views.forEach(function(v){
        document.getElementById("view-"+v).classList.toggle("active", v === btn.dataset.view);
      });
      if (btn.dataset.view === "flash") refreshFlash();
      if (btn.dataset.view === "quiz") nextQuiz();
      if (btn.dataset.view === "mine") renderMine();
    });
  });

  // ---------------- Category chip rows --------------------------------
  var activeCat = { browse:null, flash:null, quiz:null };

  function buildCatRow(containerId, viewKey){
    var el = document.getElementById(containerId);
    el.innerHTML = "";
    var allChip = document.createElement("button");
    allChip.className = "chip";
    allChip.textContent = "todas";
    allChip.dataset.active = activeCat[viewKey] === null ? "true" : "false";
    allChip.addEventListener("click", function(){ setActive(null); });
    el.appendChild(allChip);
    mod().cats.forEach(function(c){
      var chip = document.createElement("button");
      chip.className = "chip";
      chip.innerHTML = c.name + ' <span class="dot">·</span>';
      chip.dataset.code = c.code;
      chip.dataset.active = activeCat[viewKey] === c.code ? "true" : "false";
      chip.addEventListener("click", function(){ setActive(c.code); });
      el.appendChild(chip);
    });
    function setActive(code){
      activeCat[viewKey] = code;
      Array.prototype.forEach.call(el.children, function(ch){
        ch.dataset.active = (ch.dataset.code === code || (!code && ch === allChip)) ? "true" : "false";
      });
      if (viewKey === "browse") renderBrowse();
      if (viewKey === "flash") { flashIdx = 0; refreshFlash(); }
      if (viewKey === "quiz") nextQuiz();
    }
  }

  // ---------------- BROWSE ----------------
  var searchTerm = "";
  document.getElementById("search-input").addEventListener("input", function(e){
    searchTerm = e.target.value.toLowerCase();
    renderBrowse();
  });

  var REG_LABELS = { MX:"México", CO:"Colombia", ES:"España", LATAM:"Latinoamérica" };
  function regChip(d){ return d.reg ? '<span class="reg-chip '+d.reg+'">'+(REG_LABELS[d.reg] || d.reg)+'</span>' : ""; }

  function relLabel(rel){
    if (rel === "media") return "media";
    if (rel === "falso") return "cuidado";
    return "alta";
  }

  function renderBrowse(){
    var list = document.getElementById("browse-list");
    list.innerHTML = "";
    var cat = activeCat.browse;
    var items = mod().data.filter(function(d){
      if (cat && d.cat !== cat) return false;
      if (searchTerm){
        var hay = (d.es + " " + d.en + " " + (d.note||"") + " " + (d.ex||"") + " " + (d.reg ? REG_LABELS[d.reg] || d.reg : "")).toLowerCase();
        if (hay.indexOf(searchTerm) === -1) return false;
      }
      return true;
    });
    if (items.length === 0){
      var empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent = "No hay resultados que coincidan. Probá con otra categoría o búsqueda.";
      list.appendChild(empty);
      return;
    }
    items.forEach(function(d){
      var card = document.createElement("div");
      card.className = "idx-card";
      var relChip = d.rel ? '<span class="rel-chip '+d.rel+'">'+relLabel(d.rel)+'</span>' : "";
      var st = itemStats(d.id);
      var quizChip = (st.r || st.w) ? '<span class="quiz-chip">quiz '+st.r+'✓ '+st.w+'✗</span>' : "";
      relChip += regChip(d) + quizChip;
      card.innerHTML =
        '<div class="status-dot" data-status="'+getStatus(d.id)+'"></div>' +
        '<div class="tag-row"><span class="tag" style="background:'+catColor(d.cat)+'">'+d.cat+'</span>'+relChip+'</div>' +
        '<p class="es">'+d.es+'</p>' +
        '<p class="en">'+d.en+'</p>' +
        '<div class="meta">' +
          (d.note ? '<span><b>Nota:</b> '+d.note+'</span>' : '') +
          (d.ex ? '<span><b>Ejemplo:</b> '+d.ex+'</span>' : '') +
          (d.hint ? '<span><b>Dónde escucharlo:</b> '+d.hint+'</span>' : '') +
        '</div>';
      list.appendChild(card);
    });
  }

  // ---------------- FLASHCARDS ----------------
  var flashIdx = 0;
  var flashItems = [];
  var flashFlipped = false;

  function refreshFlash(){
    var cat = activeCat.flash;
    flashItems = mod().data.filter(function(d){ return !cat || d.cat === cat; });
    if (flashItems.length === 0) flashItems = mod().data.slice();
    if (getPref("shuffleFlash")) shuffle(flashItems);
    if (flashIdx >= flashItems.length) flashIdx = 0;
    flashFlipped = false;
    renderFlash();
  }

  function renderFlash(){
    var d = flashItems[flashIdx];
    document.getElementById("fc-counter").textContent = (flashIdx+1) + " / " + flashItems.length;
    document.getElementById("fc-filter-label").textContent = activeCat.flash ? catName(activeCat.flash) : "todas las categorías";
    document.getElementById("fc-tag").textContent = d.cat;
    document.getElementById("fc-tag").style.background = catColor(d.cat);
    var relEl = document.getElementById("fc-rel");
    if (d.rel){ relEl.style.display = "inline-block"; relEl.textContent = relLabel(d.rel); relEl.className = "rel-chip " + d.rel; }
    else { relEl.style.display = "none"; }
    var regEl = document.getElementById("fc-reg");
    regEl.outerHTML = d.reg ? regChip(d).replace('<span ', '<span id="fc-reg" ') : '<span id="fc-reg" class="reg-chip" style="display:none;"></span>';
    var front = document.getElementById("fc-front");
    var back = document.getElementById("fc-back");
    if (!flashFlipped){
      front.style.display = "block";
      back.style.display = "none";
      front.innerHTML = '<p class="es-big">'+d.es+'</p>';
    } else {
      front.style.display = "none";
      back.style.display = "block";
      back.innerHTML =
        '<p class="en-big">'+d.en+'</p>' +
        (d.note ? '<p class="note-line">'+d.note+'</p>' : '') +
        (d.ex ? '<p class="example">"'+d.ex+'"</p>' : '') +
        (d.hint ? '<p class="hint">'+d.hint+'</p>' : '');
    }
  }

  document.getElementById("flashcard").addEventListener("click", function(){
    flashFlipped = !flashFlipped;
    renderFlash();
  });
  document.getElementById("fc-prev").addEventListener("click", function(){
    flashIdx = (flashIdx - 1 + flashItems.length) % flashItems.length;
    flashFlipped = false;
    renderFlash();
  });
  document.getElementById("fc-next").addEventListener("click", function(){
    flashIdx = (flashIdx + 1) % flashItems.length;
    flashFlipped = false;
    renderFlash();
  });
  document.getElementById("fc-learning").addEventListener("click", function(){
    setStatus(flashItems[flashIdx].id, "learning");
    document.getElementById("fc-next").click();
  });
  document.getElementById("fc-known").addEventListener("click", function(){
    setStatus(flashItems[flashIdx].id, "known");
    document.getElementById("fc-next").click();
  });

  // ---------------- QUIZ ----------------
  var currentQuiz = null;
  var quizQueue = [];     // shuffled deck of ids: no repeats until the pool is used up
  var quizQueueSig = "";  // which module+category the queue was built for
  var lastQuizId = null;

  function pickDistractors(correct, pool, n){
    var answerOf = function(d){ return mod().quizType === "blank" ? d.es : d.en; };
    var others = shuffle(pool.filter(function(d){ return d.id !== correct.id && answerOf(d) !== answerOf(correct); }));
    var picked = [], seen = {};
    for (var i = 0; i < others.length && picked.length < n; i++){
      if (seen[answerOf(others[i])]) continue;
      seen[answerOf(others[i])] = true;
      picked.push(others[i]);
    }
    return picked;
  }

  // Weak-first mode: items you've missed (or never seen) get pulled more often.
  function weakWeight(d){
    var st = itemStats(d.id);
    if (!st.r && !st.w) return 2;           // unseen
    return (1 + st.w * 3) / (1 + st.r);     // misses push it up, hits pull it down
  }
  function pickWeighted(pool){
    var cands = pool.length > 1 ? pool.filter(function(d){ return d.id !== lastQuizId; }) : pool;
    var total = 0, weights = cands.map(function(d){ var w = weakWeight(d); total += w; return w; });
    var r = Math.random() * total;
    for (var i = 0; i < cands.length; i++){ r -= weights[i]; if (r <= 0) return cands[i]; }
    return cands[cands.length - 1];
  }
  function pickFromQueue(pool){
    var sig = activeModuleKey + "|" + (activeCat.quiz || "*") + "|" + pool.length;
    if (sig !== quizQueueSig || quizQueue.length === 0){
      quizQueue = shuffle(pool.map(function(d){ return d.id; }));
      if (quizQueue.length > 1 && quizQueue[quizQueue.length - 1] === lastQuizId) quizQueue.unshift(quizQueue.pop());
      quizQueueSig = sig;
    }
    var id = quizQueue.pop();
    return pool.find(function(d){ return d.id === id; });
  }

  function nextQuiz(){
    var cat = activeCat.quiz;
    var pool = mod().data.filter(function(d){ return !cat || d.cat === cat; });
    if (pool.length < 4) pool = mod().data.slice();
    var correct = getPref("weakFirst") ? pickWeighted(pool) : pickFromQueue(pool);
    lastQuizId = correct.id;
    var distractors = pickDistractors(correct, pool, 3);
    if (distractors.length < 3) distractors = pickDistractors(correct, mod().data, 3);
    var options = shuffle(distractors.concat([correct]));
    currentQuiz = { correct: correct, options: options, answered: false };
    renderQuiz();
  }

  // Pieces of a template like "Si hubiera sabido, habría ___" that can be
  // blanked out of the example sentence. Grammar labels are not pieces.
  function blankPieces(es){
    return es.replace(/\(.*?\)/g, "")
      .split(/___|\.\.\.|…|\/|\+/)
      .map(function(t){ return t.replace(/^[\s,;:¿?¡!.]+|[\s,;:¿?¡!.]+$/g, ""); })
      .filter(function(t){ return t.length >= 2 && !/^(subj|indicativo|condicional|inf|gerundio|tiempo)\b/i.test(t); })
      .sort(function(a,b){ return b.length - a.length; });
  }
  function blankSentence(d){
    if (!d.ex) return null;
    var out = escapeHTML(d.ex), hit = false;
    blankPieces(d.es).forEach(function(piece){
      var re = new RegExp("(^|[^\\wáéíóúñü])(" + escapeRegExp(escapeHTML(piece)) + ")(?![\\wáéíóúñü])", "i");
      if (re.test(out)){ out = out.replace(re, '$1<span class="blank">_____</span>'); hit = true; }
    });
    return hit ? out : null;
  }

  function renderQuiz(){
    var d = currentQuiz.correct;
    var promptEl = document.getElementById("quiz-prompt-text");
    var sentenceEl = document.getElementById("quiz-sentence");
    var optsEl = document.getElementById("quiz-options");
    var blank = mod().quizType === "blank";

    if (blank){
      var sentenceHTML = blankSentence(d);
      if (sentenceHTML){
        promptEl.textContent = "Completa la frase:";
        sentenceEl.innerHTML = sentenceHTML;
      } else {
        // Couldn't cut the phrase out of its example without giving it away —
        // ask from the English meaning instead.
        promptEl.textContent = "¿Qué frase dice esto?";
        sentenceEl.innerHTML = '<span>' + escapeHTML(d.en) + '</span>';
      }
    } else {
      promptEl.textContent = "¿Qué significa esta palabra?";
      sentenceEl.innerHTML = '<span>'+d.es+'</span>';
    }
    optsEl.innerHTML = "";
    currentQuiz.options.forEach(function(opt, i){
      var btn = document.createElement("button");
      btn.className = "quiz-opt";
      btn.dataset.id = opt.id;
      btn.innerHTML = '<span class="key">' + (i + 1) + '</span>' + escapeHTML(blank ? opt.es : opt.en);
      btn.addEventListener("click", function(){ answerQuiz(opt, btn); });
      optsEl.appendChild(btn);
    });
    document.getElementById("quiz-feedback").classList.remove("show");
    renderQuizStats();
  }

  function recordAnswer(id, isCorrect){
    var s = qs(), ses = session[activeModuleKey];
    var it = s.items[id] || { r:0, w:0 };
    if (isCorrect){ it.r++; s.r++; ses.r++; ses.streak++; }
    else { it.w++; s.w++; ses.w++; ses.streak = 0; }
    it.last = isCorrect ? 1 : 0;
    s.items[id] = it;
    if (ses.streak > (s.best || 0)) s.best = ses.streak;
    saveJSON(mod().quizKey, s);
  }

  function answerQuiz(opt, btn){
    if (currentQuiz.answered) return;
    currentQuiz.answered = true;
    var d = currentQuiz.correct;
    var isCorrect = opt.id === d.id;
    document.querySelectorAll(".quiz-opt").forEach(function(b){
      if (b.dataset.id === String(d.id)) b.classList.add("correct");
    });
    if (!isCorrect) btn.classList.add("wrong");
    document.getElementById("quiz-translation").textContent = (mod().quizType === "blank" ? d.es + " = " : "") + d.en + (d.note ? "  —  " + d.note : "");
    document.getElementById("quiz-example").textContent = d.ex ? ('"' + d.ex + '"') : "";
    document.getElementById("quiz-feedback").classList.add("show");
    setStatus(d.id, isCorrect ? "known" : "learning");
    recordAnswer(d.id, isCorrect);
    renderQuizStats();
  }

  function pct(r, w){ return (r + w) ? Math.round(100 * r / (r + w)) : 0; }

  function renderQuizStats(){
    var el = document.getElementById("quiz-stats");
    var s = qs(), ses = session[activeModuleKey];
    var total = s.r + s.w;
    var html =
      '<div class="stat-grid">' +
        '<div class="stat"><span class="num">' + ses.r + '/' + (ses.r + ses.w) + '</span><span class="lbl">esta sesión</span></div>' +
        '<div class="stat"><span class="num">' + ses.streak + '</span><span class="lbl">racha</span></div>' +
        '<div class="stat"><span class="num">' + (total ? pct(s.r, s.w) + '%' : '—') + '</span><span class="lbl">histórico (' + total + ')</span></div>' +
        '<div class="stat"><span class="num">' + (s.best || 0) + '</span><span class="lbl">mejor racha</span></div>' +
      '</div>';

    if (total){
      // Per-category accuracy, weakest first
      var byCat = {};
      mod().data.forEach(function(d){
        var st = s.items[d.id]; if (!st) return;
        var c = byCat[d.cat] = byCat[d.cat] || { r:0, w:0 };
        c.r += st.r; c.w += st.w;
      });
      var cats = mod().cats.filter(function(c){ return byCat[c.code]; })
        .sort(function(a,b){ return pct(byCat[a.code].r, byCat[a.code].w) - pct(byCat[b.code].r, byCat[b.code].w); });
      html += '<h3>Por categoría</h3><div class="cat-acc">';
      cats.forEach(function(c){
        var v = byCat[c.code], p = pct(v.r, v.w);
        html += '<div class="acc-row"><span class="acc-name">' + c.name + '</span>' +
          '<span class="acc-bar"><span style="width:' + p + '%;background:' + c.color + '"></span></span>' +
          '<span class="acc-pct">' + p + '% <small>(' + (v.r + v.w) + ')</small></span></div>';
      });
      html += '</div>';

      // Most-missed items
      var missed = mod().data.filter(function(d){ return s.items[d.id] && s.items[d.id].w > 0; })
        .sort(function(a,b){
          var A = s.items[a.id], B = s.items[b.id];
          return (B.w - B.r) - (A.w - A.r) || B.w - A.w;
        }).slice(0, 6);
      if (missed.length){
        html += '<h3>Las que más fallas</h3><ul class="missed">';
        missed.forEach(function(d){
          var st = s.items[d.id];
          html += '<li><b>' + escapeHTML(d.es) + '</b> — ' + escapeHTML(d.en) + ' <small>' + st.r + '✓ ' + st.w + '✗</small></li>';
        });
        html += '</ul>';
      }
      html += '<button class="reset-btn" id="quiz-reset">borrar historial del quiz</button>';
    }
    el.innerHTML = html;
    var reset = document.getElementById("quiz-reset");
    if (reset) reset.addEventListener("click", function(){
      if (!confirm("¿Borrar todo el historial del quiz de este lado? No se puede deshacer.")) return;
      quizStats[activeModuleKey] = { items:{}, r:0, w:0, best:0 };
      session[activeModuleKey] = { r:0, w:0, streak:0 };
      saveJSON(mod().quizKey, qs());
      renderQuizStats();
    });
  }

  document.getElementById("quiz-next").addEventListener("click", nextQuiz);

  // Keyboard: quiz 1–4 answer, Enter next · cards Space flip, ←/→ move
  document.addEventListener("keydown", function(e){
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return; // let the focused button handle it
    if (document.getElementById("view-quiz").classList.contains("active")){
      var n = parseInt(e.key, 10);
      var opts = document.querySelectorAll(".quiz-opt");
      if (n >= 1 && n <= opts.length){ opts[n - 1].click(); e.preventDefault(); }
      else if (e.key === "Enter" && currentQuiz && currentQuiz.answered){ nextQuiz(); e.preventDefault(); }
    } else if (document.getElementById("view-flash").classList.contains("active")){
      if (e.key === " "){ document.getElementById("flashcard").click(); e.preventDefault(); }
      else if (e.key === "ArrowRight"){ document.getElementById("fc-next").click(); }
      else if (e.key === "ArrowLeft"){ document.getElementById("fc-prev").click(); }
    }
  });

  // ---------------- MINE (Mis frases / Mis palabras) ----------------
  function buildMineCatSelect(){
    var sel = document.getElementById("m-cat");
    sel.innerHTML = "";
    mod().cats.forEach(function(c){
      var opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  document.getElementById("m-submit").addEventListener("click", function(){
    var es = document.getElementById("m-es").value.trim();
    var en = document.getElementById("m-en").value.trim();
    var cat = document.getElementById("m-cat").value;
    var source = document.getElementById("m-source").value.trim();
    var note = document.getElementById("m-note").value.trim();
    if (!es || !en){
      alert("Necesito al menos la frase/palabra en español y qué significa.");
      return;
    }
    var list = getMine();
    list.unshift({
      id: "m" + Date.now(),
      es: es, en: en, cat: cat, source: source, note: note,
      added: new Date().toISOString().slice(0,10)
    });
    setMine(list);
    document.getElementById("m-es").value = "";
    document.getElementById("m-en").value = "";
    document.getElementById("m-source").value = "";
    document.getElementById("m-note").value = "";
    renderMine();
  });

  function renderMine(){
    var list = document.getElementById("mine-list");
    list.innerHTML = "";
    var items = getMine();
    if (items.length === 0){
      var empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent = "Todavía no agregaste nada en este módulo. Metelo ahí arriba en cuanto lo escuches o lo subrayes.";
      list.appendChild(empty);
      return;
    }
    items.forEach(function(m){
      var card = document.createElement("div");
      card.className = "idx-card";
      card.innerHTML =
        '<div class="tag-row"><span class="tag" style="background:'+catColor(m.cat)+'">'+m.cat+'</span></div>' +
        '<p class="es">'+escapeHTML(m.es)+'</p>' +
        '<p class="en">'+escapeHTML(m.en)+'</p>' +
        '<div class="meta">' +
          (m.note ? '<span><b>Nota:</b> '+escapeHTML(m.note)+'</span>' : '') +
          (m.source ? '<span><b>Fuente:</b> '+escapeHTML(m.source)+'</span>' : '') +
          '<span><b>Agregada:</b> '+m.added+'</span>' +
        '</div>' +
        '<button class="del-btn" data-id="'+m.id+'">borrar</button>';
      list.appendChild(card);
    });
    list.querySelectorAll(".del-btn").forEach(function(btn){
      btn.addEventListener("click", function(){
        setMine(getMine().filter(function(m){ return m.id !== btn.dataset.id; }));
        renderMine();
      });
    });
  }

  // ---------------- Init ----------------
  reloadModuleStorage();
  buildCatRow("cat-row", "browse");
  buildCatRow("cat-row-flash", "flash");
  buildCatRow("cat-row-quiz", "quiz");
  buildMineCatSelect();
  syncToggles();
  renderBrowse();
  refreshFlash();
  nextQuiz();
  renderMine();

})();
