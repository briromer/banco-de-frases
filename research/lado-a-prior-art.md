# Lado A — prior art map and Mexico check

Research pass, 2026-09-30. Goal: stop generating "glue phrases" from an LLM's
intuition, see what already exists, and test the current deck against real
Mexican speech.

## Bottom line

1. **The function list is a solved problem; the Mexican exponents are not.**
   The Instituto Cervantes *Plan Curricular* (PCIC) already lists concrete
   phrases per communicative function and CEFR level — but its reference norm
   is north-central peninsular Spanish. Nobody free and systematic has done
   "PCIC functions, Mexican exponents."
2. **The best Mexican evidence is free:** the *Corpus Sociolingüístico de la
   Ciudad de México* (CSCM, El Colegio de México), ~1.44M words of Mexico City
   interviews. Counting the whole deck against it explains your friend's
   reaction: most items are there, but a cluster of textbook/peninsular forms
   have Mexican replacements that outnumber them 10–100×.
3. **Learner resources cover fillers and slang well; everyday non-slang glue is
   under-covered.** Fillers (*este, o sea, pues*) and slang (*no manches,
   órale, ¿neta?*) are everywhere. Narrative glue, hedges, topic management,
   *se me*-accidents and *me cae*-verbs taught as chunks are thin — that is
   the gap this deck can fill, **if the exponents are corpus-checked.**
4. **High-frequency Mexican glue is missing from the deck:** *ahorita, no pues
   / pues sí, ¿a poco?, haz de cuenta, órale, ándale, híjole, ya ves que, igual
   y, nomás, luego luego, de plano, ¿verdad?, qué padre, ¿cómo ves?, tantito*.

---

## 1. Map of prior art

### Inventories (what functions/categories exist, with exponents)

| Source | What it gives us | Mexico | Access | How to use it |
|---|---|---|---|---|
| **PCIC — Funciones (§5), Tácticas y estrategias pragmáticas (§6)** · [index](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/indice.htm) · [Funciones B1–B2](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/05_funciones_inventario_b1-b2.htm) | Concrete exponents per function and level: surprise (*¿De verdad?, ¿En serio?, ¡No me digas!*), agreement, resignation, *ojalá*, *no creo que*, reformulators, contact checks (*¿sabes?, ¿ves?*). | Partial — [peninsular norm](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/norma.htm); a few items tagged *[Hispanoamérica]*. | Free HTML | **Category skeleton + level grading.** Take the function names; re-source the exponents from Mexican data. |
| **Martín Zorraquino & Portolés, "Los marcadores del discurso"** (*Gramática descriptiva*, 1999) · [Dialnet](https://dialnet.unirioja.es/servlet/articulo?codigo=2152618) | The standard taxonomy: structurers, connectors, reformulators, argumentative operators, conversational markers. | No | Paid print | Names for our NEXO/MULE/CONTR split. |
| **DPDE — Diccionario de partículas discursivas** · [dpde.es](http://www.dpde.es) | Definitions, prosody, position, translations for markers (*bueno, o sea, pues*). | No (American extension only planned) | Free | Notes/definitions for shared markers only. |
| Fuentes Rodríguez, *Diccionario de conectores y operadores* (2009); Santos Río, *Diccionario de partículas* (2003) | Broadest printed particle inventories. | Unverified | Paid print | Completeness check, low priority. |
| Keenan, *Breaking Out of Beginner's Spanish* · [UT Press](https://utpress.utexas.edu/9780292761933/) | Set phrases, fillers, politeness, false friends — Latin American, Mexico-leaning; author long-time Mexico City resident (non-native). | Leaning | Paid | Cross-check list + chapter scheme. |

### Evidence (is this actually said in Mexico, and how often?)

| Source | Mexico data | Access | Phrase search + Mexico filter |
|---|---|---|---|
| **CSCM** · [lef.colmex.mx](https://lef.colmex.mx/corpus_sociolinguistico.html) | 108 Mexico City interviews, stratified by education/sex/age; recorded ~1997–2007, published 2011–12. | Free download. **CC BY-NC-ND 4.0, stated for academic linguistics research.** | Yes, offline grep. Used for §3 below. |
| **CORPES XXI (RAE)** · [rae.es/corpes](https://www.rae.es/corpes/) | Country filter + oral medium (radio/TV/YouTube). | Free web app, no API | Yes — per-million by country, TSV export. **Best free MX vs ES vs CO comparison.** Not queried yet (JS app). |
| **Corpus del Español — Web/Dialects** · [corpusdelespanol.org](https://www.corpusdelespanol.org/web-dial/) | ~260M words from Mexico (web + blogs). | Free 20 searches/day; $30/yr for 200. | Yes, per-country chart. Written web text. |
| **PRESEEA** · [preseea.uah.es](https://preseea.uah.es/corpus-preseea) | CDMX, Guadalajara, Monterrey, Puebla, Tijuana, Mexicali. | Free, research use | Search interface (features unverified). |
| **Ameresco** (Val.Es.Co) | Spontaneous conversation incl. Monterrey, CDMX, Querétaro — closest genre to "glue". | Site unreachable; unverified | — |
| Val.Es.Co corpus (Valencia) | None — Spain | — | Contrast set: phrase only here ⇒ peninsular. |
| Google Books Ngram | Pooled, no country split; written | Free | Weak sanity check only. |
| OpenSubtitles/OPUS, SUBTLEX-ESP, EsPal | No country labels (subtitles often neutral dubbing Spanish) | Free | **Not usable for regional checks.** |

### Mexican reference dictionaries

| Source | Access | Useful for |
|---|---|---|
| **DEM — Diccionario del Español de México** (COLMEX) · [dem.colmex.mx](https://dem.colmex.mx) | Free | Locuciones inside headwords: *ni modo* (under *modo*), *me late* (under *latir*, Popular), *hacer el oso*. |
| **Diccionario de americanismos (ASALE)** · [asale.org/damer](https://www.asale.org/damer/) | Free; search the headword, not the phrase | Country marks: *¡qué oso!* Mx only; *ni modo* Mx + CA/Caribe/Andes; *latirle* Mx+; *me da pena con usted* Mx, CA, Co. |
| *Diccionario de mexicanismos* (AML) | Print only | — |

### Learner-facing, native Mexican authors (best cross-checks)

| Source | What | Access |
|---|---|---|
| **How To Spanish** (Ana & David, Querétaro) — ebook *In Mexico We Don't Say* · [gumroad](https://howtospanish.gumroad.com/l/inmexicowedontsayebook) | **Closest thing to a "textbook vs. real Mexico" list.** Contents not inspected. | Paid |
| **Tell Me In Spanish** (Daniela Sánchez) · [ni modo](https://www.tellmeinspanish.com/mexico/mexican-slang/ni-modo/) | One article per expression, real-use examples, near-synonyms (*ya qué, no queda de otra*). | Free |
| **Spanish and Go** (May, Mexican) · [muletillas](https://spanishandgo.com/podcast/filler-words-in-spanish/) · [15 very Mexican phrases](https://spanishandgo.com/podcast/15-very-mexican-phrases/) | Fillers, reactions, politeness routines. | Audio free, transcripts paid |
| **SpanishDict filler guide** · [link](https://www.spanishdict.com/guide/filler-words-in-spanish) | Tags *este* = LatAm, *vale / en plan / esto* = Spain — handy negative filter. | Free |
| Butterfly Spanish, Dreaming Spanish (Mexican guides), *Español a la mexicana* podcast | Grammar-leaning / comprehensible input; thin on glue lists. | Free |
| Glossika Mexican track; Pimsleur LatAm | Native-recorded but drill/polite register. | Paid |

### Sentence data

| Source | Notes |
|---|---|
| **Tatoeba** · [downloads](https://tatoeba.org/en/downloads) | CC BY 2.0 FR, ~445k Spanish sentences, owner skill levels, bans AI sentences. **No country field** — can't isolate Mexican speakers. Good for pulling authentic example sentences, not for regional validation. Clozemaster reuses it. |
| Anki shared decks ("Mexican slang", "100 Most Common Spoken Spanish Phrases") | Quality unknown; cross-check at most. |

### Academic studies on specific Mexican markers (sources for notes/hints)

*este* ([Soler & Serrano, UNAM](https://www.iifilologicas.unam.mx/elhablamexico/uploads/images/Marcador%20este%20-%20Soler%20y%20Serrano.pdf)) ·
*haz de cuenta* ([Guillén Escamilla 2022](https://www.scielo.org.mx/scielo.php?pid=S2007-736X2022000100108&script=sci_arttext&tlng=es)) ·
*ándale / ándele / órale* ([Flores, Monterrey](https://www.researchgate.net/publication/311642642_Andale_andele_y_orale_Sus_funciones_en_El_Habla_de_Monterrey_PRESEEA)) ·
*mira / fíjate* ([CDMX](https://www.scielo.org.mx/pdf/allf/v11n1/2448-8224-allf-11-01-103.pdf)) ·
*o sea* ([Guadalajara](https://boletinfilologia.uchile.cl/index.php/BDF/article/view/82015)) ·
*(ya) ves que* ([Dialnet](https://dialnet.unirioja.es/servlet/articulo?codigo=8253099)) ·
*ya te/le digo* ([Redalyc](https://www.redalyc.org/journal/219/21982897003/movil/)) ·
Mexican politeness in ELE ([e-JournALL](https://e-journall.org/index.php/ejall/article/download/2376905x-4-62/2188/7149)).

---

## 2. Coverage: where prior art is strong vs. thin

| Area | Prior art | Implication for us |
|---|---|---|
| Function taxonomy (agree, doubt, surprise, advise…) | **Strong** (PCIC) | Stop inventing categories; align ours to PCIC function names. |
| Formal connectors (*si bien, ahora bien, no obstante*) | **Strong**, Spain-leaning | Low value for a spoken-glue deck; keep few. |
| Fillers (*este, o sea, pues, bueno*) | **Strong**, incl. Mexican | Cross-check, don't expand. |
| Mexican slang (*no manches, órale, ¿neta?, qué padre*) | **Strong** (many creators) | A few high-frequency ones belong here; the rest are covered elsewhere. |
| Subjunctive triggers | Strong (grammar sites) | Keep; the deck's value is the example sentences. |
| Narrative glue (*en eso, al rato, de repente, haz de cuenta*) | **Thin** | Genuine gap — and corpus-strong. |
| Everyday Mexican hedges/softeners (*a lo mejor, igual y, tantito, se me hace que*) | **Thin** | Gap. |
| Topic management (*oye, bueno pues, ya ves que, por cierto*) | Thin | Gap. |
| *Se me* accidents and *me cae / me toca* verbs as chunks | Thin | Gap — already in the deck. |
| Systematic native "we don't say that" list for Mexico | **Essentially absent** (one paid ebook) | This is the most valuable thing the deck could become. |

---

## 3. The deck vs. Mexico City speech (CSCM)

All 162 Lado A items counted in the CSCM text (1.44M words), accent- and
punctuation-insensitive, with hand-written patterns for conjugated items and
for the Mexican alternative next to each textbook form. **Caveats:** interview
genre (the informant narrates; little advice, apology, or second-person
banter), recorded ~1997–2007 (youth slang under-represented), and very common
words inflate some counts (*este, tipo, medio, como*). Zero = "not in this
corpus", not "never said". Zero is strong evidence only **when a Mexican
alternative shows up heavily in its place.**

### A. Swap for the Mexican form (strongest finding)

| In deck | Hits | Mexican form | Hits |
|---|---:|---|---:|
| *Si hubiera sabido, **habría** ___* / *Yo no **habría** dicho eso* | *habría* + *-ido* participle: 1 | *hubiera* + *-ido* participle (*si hubiera sabido, no **hubiera** ido*) | 123 |
| *Debe (de) ser que ___* | 19 / 0 | ***Ha de ser*** / ***ha de haber*** | 40 / 33 |
| *Serían las ___ cuando* | 1 | *Eran **como** las ___* | 9 |
| *Tendría unos ___ años* | 2 | *Tenía **como** ___ años* / *tendría como* | 20 / 10 |
| *Me da la impresión de que* | 0 | ***Se me hace que*** | 14 |
| *Me alegra que ___* | 0 | ***Qué bueno que*** / *me da gusto que* | 56 / 4 |
| *A mi modo de ver* | 0 | *Para mí* | 317 |
| *Qué rabia* | 0 | *Qué coraje* | 3 |
| *Me da igual* | 1 | *Me vale* (informal, a bit rude) / *me da lo mismo* | 10 / 2 |
| *Tampoco es para tanto* | 0 | *No es para tanto* | 2 |
| *Qué le vamos a hacer* | 4 | *Ni modo* (already in deck) / *ni hablar* | 138 / 5 |
| *Ni de broma / ni loco* | 0 | *Ni de chiste* | 1 (weak) |

The *habría → hubiera* pattern touches items 21, 23 and the conditional
templates in DESEO/HIPOT, and is
almost certainly part of what your friend heard as "not native."

### B. Regional — not Mexican

| Item | CSCM | Other evidence | Action |
|---|---:|---|---|
| *Qué pesar* | 0 (only "pesar cincuenta") | Colombian | Tag CO or drop |
| *¿Cómo así?* | 0 as a question | Colombian | Tag CO or drop |
| *Qué pena contigo* | 0 | Colombian (DAMER: *me da pena con usted* is Mx-compatible) | Replace with *qué pena* / *me da pena* or tag CO |
| *Por lo visto* | 1 | Peninsular-leaning | Low priority / tag ES |
| *De haber sabido* | 1 | Written-register | Keep as "formal" or drop |
| *¿Sabes?* as a tag | 5 (vs **¿no?** 10,227, **¿verdad?** 471) | — | Keep *¿no?*, add *¿verdad?*, demote *¿sabes?* |

### C. Absent, no Mexican counterpart found — verify with a native or drop

*Ni se te ocurra pensar que* (0) · *Más te vale que* (0) · *Te sugiero que* (0) ·
*No fue que no…, sino que* (0) · *Cuentan que* (0) · *Dicho esto* (1; English
calque "that said") · *Te entiendo perfectamente* (0) · *Eso mismo me pasó a
mí* (0; *me pasó lo mismo* 2) · *No sabes cuánto lo siento* (1) · *¡Qué alivio!*
(0) · *Si no es mucha molestia* (0) · *Justo cuando* (0) · *Volviendo a lo de* (0) ·
*No habrá sido tan* (0) · *Ojalá hubiera* (0) · *Si yo fuera tú* (0).

Genre caveat applies hardest here: advice, apologies and sympathy are rare in
interviews. *Más te vale*, *si yo fuera tú*, *qué alivio* and *no te
preocupes*-type items are plausible Mexican speech — ideal first questions
for your friend or HiNative.

**Also 0 but confirmed Mexican elsewhere:** *¡qué oso!* (DAMER: Mx only; young
slang, post-dates much of the corpus) and *se me hizo tarde* (everyday; genre
gap). Keep both.

### D. Confirmed strong (≥20 hits) — keep

*o sea* 6,224 · *es que* 2,567 · *como que* 1,698 · *a lo mejor* 636 · *la
verdad* 423 · *eso sí* 434 · *de repente* 294 · *no es que* 273 · *fíjate que*
229 · *como si* 225 · *darse cuenta* 210 · *lo que pasa es que* 150 · *en eso*
139 · *ni modo* 138 · *acabar de* 118 · *en serio* 111 · *lo que sea* 108 ·
*un montón* 104 · *al final* 102 · *para nada* 90 · *al rato* 81 · *en fin* 72 ·
*total que* 71 · *no creo que* 71 · *no te preocupes* 55 · *de todos modos* 52
· *resulta que* 50 · *por cierto* 50 · *antes de que* 48 · *hablando de* 47 ·
*qué barbaridad* 46 · *claro que sí* 45 · *dizque* 36 · *me queda* 32 · *digamos
que* 30 · *me toca* 26 · *no me digas* 24 · *me cuesta* 23 · *se me olvidó* 21.

Everything else (1–19 hits) is attested but less frequent — fine to keep;
could get a "menos común" marker.

### E. High-frequency Mexican glue the deck is missing

| Phrase | CSCM hits | Fits category |
|---|---:|---|
| *ahorita* | 1,667 | NARR / tiempo (with its famous vagueness) |
| *no pues* / *pues sí* / *pues no* | 2,075 / 1,457 / 570 | MULE / ACUER |
| *¿verdad?* (tag) | 471 as tag | MULE |
| *órale* | 552 | REACC / ACUER |
| *o sea que* | 608 | CAUSA |
| *nomás* | 598 | INTENS |
| *bueno pues* | 428 | TEMA (closing / transitioning) |
| *sepa / quién sabe / sabe Dios* | 432 | RESIG / duda |
| *¿a poco?* | 326 as question | REACC |
| *haz de cuenta (que)* | 254 | NARR / MULE |
| *ándale* | 214 | ACUER / CORTE |
| *híjole* | 215 | EMOC |
| *o algo así* | 152 | MULE (vagueness) |
| *qué padre* | 149 | EMOC |
| *luego luego* | 148 | NARR |
| *ya ves que* | 143 | TEMA / REACC |
| *igual y* | 123 | SUBJ-adjacent hedge (indicativo) |
| *de plano* | 107 | INTENS |
| *qué onda* | 83 | TEMA / greeting |
| *chance* (*a lo mejor/hay chance*) | 72 | CONJ |
| *¿cómo ves?* | 66 | OPIN |
| *tantito* | 61 | INTENS |
| *¿mande?* | 55 as question | CORTE |
| *ya te digo* | 22 | ACUER |

---

## 4. Recommendations

> **Status 2026-09-30:** 1–3 applied to `js/data.js` — §3A swaps (ids 18,
> 21–23, 36–37, 39–40, 67, 72–73, 79, 82–83, 118, 127), `reg` field with
> MX/CO/ES/LATAM tags shown as a chip in the app, and 23 new items (ids
> 163–185) from §3E. 4–7 still open.

1. **Swap now** (low risk, data-backed): §3A forms, especially *hubiera* for
   *habría* in spoken hypotheticals, *ha de ser*, *se me hace que*, *qué bueno
   que*, *para mí*, *eran como las*, *tenía como*.
2. **Add a `region` field** to Lado A items (`MX`, `CO`, `ES`, `gen`) and tag
   §3B instead of deleting — useful if you ever talk to Colombians, and it
   stops them polluting a Mexico-first deck.
3. **Add §3E** — ~20 items, all corpus-attested, several with academic
   write-ups usable for notes (*este, haz de cuenta, ándale/órale, fíjate, ya
   ves que, ya te digo*).
4. **Send §3C to your friend** (or HiNative, targeted at Spanish – Mexico) as
   a yes/no list. It's 16 items; the answers settle keep vs. drop.
5. **Align categories to PCIC functions** (keep our Mexican exponents). This
   also gives each item a CEFR level for free.
6. **Use CORPES XXI (México vs España, oral)** as the second check for
   anything the CSCM genre can't judge (advice, apologies, sympathy).
7. **Consider buying *In Mexico We Don't Say*** — it's the only native-authored
   list of exactly the failure mode your friend spotted.

## Licensing note

CSCM is CC BY-NC-ND and described as for academic linguistics research. It
was downloaded to the session scratchpad only (not the repo) and used solely
to count phrases; no corpus text appears in this file or in `data.js`. Example
sentences in the deck remain original.
