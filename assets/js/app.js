/* CSAPP 中文生词本 · 交互逻辑（纯前端，localStorage 持久化） */
(function () {
  "use strict";

  var D = window.CSAPP_DATA;
  var STORAGE_KEY = "csapp_vocab_v1";
  var state = {
    entries: {}, selected: null, result: null, preview: null,
    filter: "all", sort: "score", group: true, q: ""
  };
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function now() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  var toastTimer = null;
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  /* ---------- 存储 ---------- */
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries: state.entries }));
    } catch (e) {
      toast("浏览器存储不可用，请用「导出备份」保存词库");
    }
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.entries && Object.keys(o.entries).length) {
          state.entries = o.entries;
          return;
        }
      }
    } catch (e) { /* 忽略损坏的本地数据，回退到示例 */ }
    seed();
  }

  /* ---------- 单词归一化与自动去重 ---------- */
  function normalizeWord(raw) {
    var w = String(raw || "").trim().toLowerCase().replace(/\s+/g, " ");
    w = w.replace(/^[^\w%+#]+|[^\w%+#]+$/g, "");
    return w.trim();
  }
  function lemmaCandidates(w) {
    var out = [w];
    if (w.length > 4) {
      if (/ies$/.test(w)) out.push(w.slice(0, -3) + "y");
      if (/(ches|shes|xes|sses)$/.test(w)) out.push(w.slice(0, -2));
      if (/s$/.test(w) && !/ss$/.test(w)) out.push(w.slice(0, -1));
      if (/ing$/.test(w)) { out.push(w.slice(0, -3)); out.push(w.slice(0, -3) + "e"); }
      if (/ed$/.test(w)) { out.push(w.slice(0, -2)); out.push(w.slice(0, -1)); }
    }
    return out.filter(function (v, i, a) { return v && a.indexOf(v) === i; });
  }
  /* 返回该词应归并到的词条键；命中已有词条或教材术语表时才做词形归并 */
  function targetWord(w) {
    var cands = lemmaCandidates(w);
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (D.TERM_MAP[c] || state.entries[c]) {
        return { key: c, lemma: i > 0 ? c : null };
      }
    }
    return { key: w, lemma: null };
  }
  function generalLookup(w) {
    if (D.GENERAL_DICT[w]) return D.GENERAL_DICT[w];
    var cands = lemmaCandidates(w);
    for (var i = 1; i < cands.length; i++) if (D.GENERAL_DICT[cands[i]]) return D.GENERAL_DICT[cands[i]];
    return null;
  }
  function cleanTermFromDef(def, word) {
    if (!/[\u4e00-\u9fa5]/.test(def)) return "（待补中文译法）";
    var t = String(def).split(/[：，。；、;,.\n（(]/)[0].trim();
    t = t.replace(/^(表示|指|用于|把|即)/, "").trim();
    if (t.length > 14) t = t.slice(0, 14);
    return t || "（待补中文译法）";
  }

  /* ---------- 在线通用翻译（仅词表未收录时使用，失败可离线） ---------- */
  async function translateOnline(word) {
    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 4000);
      var res = await fetch(
        "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(word) + "&langpair=en%7Czh-CN",
        { signal: ctrl.signal }
      );
      clearTimeout(timer);
      if (!res.ok) return null;
      var j = await res.json();
      var txt = j && j.responseData && j.responseData.translatedText;
      if (!txt) return null;
      txt = String(txt).replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').trim();
      if (!/[\u4e00-\u9fa5]/.test(txt)) return null;
      if (/MYMEMORY|WARNING|QUERY LENGTH|INVALID|Please select/i.test(txt)) return null;
      if (txt.toLowerCase() === word.toLowerCase() || txt.length > 60) return null;
      return txt;
    } catch (e) { return null; }
  }

  /* ---------- 中文拓展自动生成 ---------- */
  function snippet(word, sentence) {
    var s = String(sentence || "").trim();
    if (!s) return "";
    var i = s.toLowerCase().indexOf(word.toLowerCase());
    if (i < 0) return s.length > 88 ? s.slice(0, 88) + "…" : s;
    var a = Math.max(0, i - 28), b = Math.min(s.length, i + word.length + 52);
    return (a > 0 ? "…" : "") + s.slice(a, b) + (b < s.length ? "…" : "");
  }
  function buildExtension(word, term, def, core, chapter, sentence) {
    var detail = D.DETAILS[word] || {};
    var chapterTerms = D.termsOfChapter(chapter).filter(function (x) { return x !== word; });

    // 相关术语：优先用精编词条，其次取同章核心概念，统一中文在前、英文括注
    var related = detail.rel ? detail.rel.slice() : [];
    if (related.length < 4) {
      var picks = chapterTerms.filter(function (x) { return D.TERM_MAP[x].core; });
      if (picks.length < 4) picks = chapterTerms;
      if (picks.length < 4) {
        picks = Object.keys(D.TERM_MAP).filter(function (x) { return D.TERM_MAP[x].core; }).slice(0, 10);
      }
      picks.slice(0, 8).forEach(function (x) {
        var s = D.termZh(x) + "（" + x + "）";
        if (x !== word && related.indexOf(s) < 0) related.push(s);
      });
    }
    related = related.slice(0, 5);

    // 常见搭配：全部使用中文表述
    var col = detail.col ? detail.col.slice() : [];
    if (!col.length) {
      col = [
        "「操作 + " + term + "」：如 访问 / 分配 / 释放 / 保存" + term,
        "「修饰语 + " + term + "」：如 局部 / 全局 / 虚拟 / 物理 " + term,
        "英文结构 " + word + " of ...：教材常用它说明该" + term + "的归属或范围",
        "固定短语建议整体记忆，不要逐词硬译"
      ];
    }
    var sn = snippet(word, sentence);
    if (sn) col.push("教材原句片段：「" + sn + "」——结合原句判断此处具体含义");
    col = col.slice(0, 6);

    // 易混概念：给出相近术语的中文释义，帮助区分
    var conf = detail.conf ? detail.conf.slice() : [];
    if (!conf.length) {
      var sims = D.similarTerms(word);
      if (!sims.length) sims = chapterTerms.filter(function (x) { return D.TERM_MAP[x].core; }).slice(0, 2);
      sims.slice(0, 3).forEach(function (x) {
        conf.push("「" + D.termZh(x) + "（" + x + "）」：" + D.termDef(x) + " —— 与「" + term + "」容易混淆，注意区分。");
      });
      if (!conf.length) conf.push("暂无内置易混词条，建议把同章相近概念记在一起对照。");
    }
    conf = conf.slice(0, 4);

    // 教材语境说明
    var ctx = detail.ctx || "";
    if (!ctx) {
      ctx = D.chapterHint(chapter) +
        " 在本章语境中，" + word + " 通常译作「" + term + "」" +
        (core ? "，属于需要优先掌握的核心概念。" : "，属于辅助理解教材的一般术语。");
      if (sentence) ctx += " 你录入的原句可作为判断该词具体所指的依据。";
    }

    var links = D.buildLinks(word, term, chapter);
    return { related: related, collocations: col, confusions: conf, contextNote: ctx, links: links };
  }

  /* ---------- 词条构造与合并 ---------- */
  function addOccurrence(e, chapter, sentence) {
    var cid = Number(chapter) || 0;
    e.occurrences = e.occurrences || [];
    e.occurrences.push({
      chapter: cid,
      chapterLabel: D.chapterName(cid),
      date: now(),
      sentence: String(sentence || "").trim()
    });
    e.updatedAt = now();
  }
  async function buildNewEntry(word, chapter, sentence) {
    var t = D.TERM_MAP[word];
    var def, term, core = false, source, phonetic = "", termNote = "";
    if (t) {
      def = t.def; term = t.term; core = t.core; source = "教材术语表";
      phonetic = (D.DETAILS[word] || {}).p || "";
      termNote = "依据《深入理解计算机系统》中文版常用译法，阅读教材时优先按此术语理解。";
    } else {
      var g = generalLookup(word);
      if (g) { def = g; source = "内置通用词典"; }
      else {
        def = await translateOnline(word);
        source = def ? "在线通用翻译" : "待手动补写";
      }
      if (!def) def = "（暂未获取到自动释义）请在「词条详情」中补写中文释义。";
      term = cleanTermFromDef(def, word);
      termNote = "该词未收录为教材标准术语，此处给出通用中文译法；可在详情里改成教材语境译法。";
    }
    var ext = buildExtension(word, term, def, core, chapter, sentence);
    var e = {
      word: word, phonetic: phonetic, def: def, term: term, termNote: termNote,
      source: source, core: core,
      related: ext.related, collocations: ext.collocations, confusions: ext.confusions,
      contextNote: ext.contextNote, links: ext.links,
      mastery: "unknown", adjust: 0, note: "",
      occurrences: [], createdAt: now(), updatedAt: now(), demo: false
    };
    addOccurrence(e, chapter, sentence);
    return e;
  }

  /* ---------- 重要程度 ---------- */
  function scoreParts(e) {
    var occ = (e.occurrences || []).length;
    var freq = Math.min(occ, 12) * 5;
    var core = e.core ? 28 : 0;
    var mastery = e.mastery === "mastered" ? -28 : (e.mastery === "fuzzy" ? 4 : 12);
    var adjust = (Number(e.adjust) || 0) * 6;
    var total = Math.max(0, Math.min(100, Math.round(38 + core + freq + mastery + adjust)));
    return { base: 38, core: core, freq: freq, mastery: mastery, adjust: adjust, total: total };
  }
  function groupOf(s) {
    return s >= 72 ? { k: "g1", name: "重点攻克" } :
           s >= 48 ? { k: "g2", name: "常复习" } :
                     { k: "g3", name: "已巩固" };
  }
  var GROUP_STYLE = {
    g1: "background:var(--accent-soft);color:var(--accent)",
    g2: "background:var(--amber-soft);color:var(--amber)",
    g3: "background:var(--green-soft);color:var(--green)"
  };
  var MASTERY = {
    unknown: { name: "未掌握", cls: "m-unknown" },
    fuzzy: { name: "模糊", cls: "m-fuzzy" },
    mastered: { name: "已掌握", cls: "m-mastered" }
  };
  function adjustLabel(v) {
    v = Number(v) || 0;
    return v === 0 ? "不调整（0）" : (v > 0 ? "+" : "−") + Math.abs(v * 6) + " 分";
  }

  /* ---------- 录入 / 查询 ---------- */
  function loadingHtml() {
    return '<div class="loading-box"><div class="spin"></div>正在查询中文释义并生成中文拓展…<br><span style="font-size:12px">若网络不可用，仍会生成完整词条框架，可手动补写释义</span></div>';
  }
  async function handleSubmit(doSave) {
    var w = normalizeWord($("wordInput").value);
    if (!w) { toast("请先输入英文生词"); return; }
    var chapter = Number($("chapterSelect").value) || 0;
    var sentence = $("sentenceInput").value.trim();
    var tg = targetWord(w);
    var existing = state.entries[tg.key] || null;
    if (!doSave && !existing) $("resultBody").innerHTML = loadingHtml();

    var finalEntry;
    if (existing) {
      finalEntry = clone(existing);
      addOccurrence(finalEntry, chapter, sentence); // 只补充出现记录，不覆盖用户已编辑的内容
      if (doSave) state.entries[tg.key] = finalEntry;
    } else {
      finalEntry = await buildNewEntry(tg.key, chapter, sentence);
      if (doSave) state.entries[tg.key] = finalEntry;
    }

    state.result = {
      entry: finalEntry, key: tg.key, chapter: chapter,
      isNew: !existing, merged: !!existing, saved: doSave, lemma: tg.lemma
    };
    state.preview = doSave ? null : {
      entry: finalEntry, key: tg.key, chapter: chapter, sentence: sentence, merged: !!existing
    };

    if (doSave) {
      state.selected = tg.key;
      persist();
      $("wordInput").value = "";
      $("sentenceInput").value = "";
      $("wordInput").focus();
      toast(existing ? "「" + finalEntry.word + "」已存在，本次记录已合并到原词条" : "已保存「" + finalEntry.word + "」并生成中文拓展");
    } else {
      toast(existing ? "该词已在词库中，预览显示合并后的结果" : "预览完成，确认后请点「保存到词库」");
    }
    renderAll();
  }
  function commitPreview() {
    var p = state.preview;
    if (!p) return;
    if (state.entries[p.key]) {
      var e = clone(state.entries[p.key]);
      addOccurrence(e, p.chapter, p.sentence);
      state.entries[p.key] = e;
    } else {
      state.entries[p.key] = clone(p.entry);
    }
    state.selected = p.key;
    state.preview = null;
    if (state.result) state.result.saved = true;
    persist();
    renderAll();
    toast("已保存到词库：" + p.key);
  }

  /* ---------- 渲染：即时结果 ---------- */
  function listHtml(arr) {
    if (!arr || !arr.length) return '<p style="font-size:12.6px;color:var(--ink-3)">暂无内容</p>';
    return '<ul class="mini-list">' + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }
  function renderResult() {
    var r = state.result;
    if (!r) {
      $("resultBody").innerHTML =
        '<div class="empty-state"><div class="empty-icon">译</div>' +
        '<h3>还没有查询结果</h3>' +
        '<p>在左侧输入阅读时遇到的生词，例如 <b>cache</b>、<b>two\'s complement</b>、<b>page fault</b>，这里会立刻显示中文释义与教材语境译法。</p></div>';
      return;
    }
    var e = r.entry, p = scoreParts(e), g = groupOf(p.total);
    var badges = [];
    if (r.saved) {
      badges.push(r.merged
        ? '<span class="status-badge merged">已存在 · 自动合并</span>'
        : '<span class="status-badge new">新词条已保存</span>');
    } else {
      badges.push('<span class="status-badge preview">预览 · 尚未保存</span>');
    }
    badges.push('<span class="status-badge chapter">' + esc(D.chapterName(r.chapter)) + '</span>');
    if (e.core) badges.push('<span class="status-badge new">教材核心概念</span>');
    if (r.lemma) badges.push('<span class="status-badge merged">已按 ' + esc(r.lemma) + ' 归并</span>');

    var html = '<div class="result-head"><div>' +
      '<div class="word-line"><span class="big-word">' + esc(e.word) + '</span>' +
      (e.phonetic ? '<span class="phon">' + esc(e.phonetic) + '</span>' : "") + '</div>' +
      '<div class="result-meta">' + badges.join("") + '</div></div>' +
      '<div class="score-badge" style="' + GROUP_STYLE[g.k] + '">重要程度 ' + p.total + ' 分 · ' + g.name + '</div></div>';

    if (r.merged) {
      html += '<div class="merged-note">词库里已有「' + esc(e.word) + '」：本次' +
        esc(D.chapterName(r.chapter)) + '的阅读记录已补进原词条（累计 ' + (e.occurrences || []).length +
        ' 次遇到），中文释义、译法与你手动修改过的内容都保持不变。</div>';
    }
    if (e.def.indexOf("暂未获取到自动释义") >= 0) {
      html += '<div class="warn-note">未能在内置词表或网络上取到该词的中文释义。请到「词条详情」手动补写；下方中文拓展与链接已正常生成。</div>';
    }

    html += '<div class="def-grid">' +
      '<div class="def-card"><div class="lbl">中文释义</div><div class="val">' + esc(e.def) + '</div>' +
      '<div class="sub">来源：' + esc(e.source || "内置词表") + ' · 可在详情中修改</div></div>' +
      '<div class="def-card term"><div class="lbl">教材语境推荐译法（优先使用）</div><div class="val">' + esc(e.term) + '</div>' +
      '<div class="sub">' + esc(e.termNote || "统一采用中文计算机术语表述") + '</div></div></div>';

    html += '<div class="section-title">自动生成的中文拓展</div><div class="ext-grid">' +
      '<div class="ext-card"><h4>相关术语</h4>' + listHtml(e.related) + '</div>' +
      '<div class="ext-card"><h4>常见搭配</h4>' + listHtml(e.collocations) + '</div>' +
      '<div class="ext-card"><h4>易混概念</h4>' + listHtml(e.confusions) + '</div>' +
      '<div class="ext-card"><h4>教材语境说明</h4><p>' + esc(e.contextNote) + '</p></div></div>';

    html += '<div class="section-title">中文拓展资料（优先中国网站）</div><div class="links-box">' +
      (e.links || []).map(function (l) {
        return '<a class="link-item" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.name) + '</a>';
      }).join("") + '</div>';

    html += '<div class="result-actions">';
    if (!r.saved) html += '<button type="button" class="btn primary" data-act="savePreview">保存到词库</button>';
    else html += '<button type="button" class="btn primary" data-act="openDetail">查看 / 编辑词条详情</button>' +
                '<button type="button" class="btn" data-act="mastered">标记已掌握</button>' +
                '<button type="button" class="btn ghost" data-act="nextWord">继续录下一个词</button>';
    html += '</div>';
    $("resultBody").innerHTML = html;
  }

  /* ---------- 渲染：词库列表 ---------- */
  var FILTERS = [
    { k: "all", n: "全部" }, { k: "core", n: "核心概念" }, { k: "high", n: "重点攻克" },
    { k: "unknown", n: "未掌握" }, { k: "fuzzy", n: "模糊" }, { k: "mastered", n: "已掌握" }
  ];
  function renderFilters() {
    $("filterChips").innerHTML = FILTERS.map(function (f) {
      return '<button type="button" class="filter-chip' + (state.filter === f.k ? " active" : "") +
        '" data-filter="' + f.k + '">' + f.n + '</button>';
    }).join("");
  }
  function chapterTags(e) {
    var ids = (e.occurrences || []).map(function (o) { return Number(o.chapter) || 0; })
      .filter(function (x) { return x > 0; });
    ids = ids.filter(function (x, i, a) { return a.indexOf(x) === i; }).sort(function (a, b) { return a - b; });
    if (!ids.length) return "未指定章节";
    return ids.slice(0, 4).map(function (x) { return "第 " + x + " 章"; }).join("、") + (ids.length > 4 ? " 等" : "");
  }
  function listItem(e) {
    var p = scoreParts(e), g = groupOf(p.total), m = MASTERY[e.mastery] || MASTERY.unknown;
    return '<button type="button" class="word-item' + (state.selected === e.word ? " selected" : "") +
      '" data-word="' + esc(e.word) + '">' +
      '<div class="wi-top"><span class="wi-word">' + esc(e.word) + '</span>' +
      '<span class="score-pill ' + g.k + '">' + p.total + " 分 · " + g.name + '</span></div>' +
      '<div class="wi-term">' + esc(e.term) + '</div>' +
      '<div class="wi-def">' + esc(e.def) + '</div>' +
      '<div class="wi-foot"><span class="mini-chip">遇到 ' + (e.occurrences || []).length + ' 次</span>' +
      '<span>' + esc(chapterTags(e)) + '</span>' +
      '<span><span class="mastery-dot ' + m.cls + '"></span>' + m.name + '</span>' +
      (e.core ? '<span class="mini-chip" style="color:var(--accent)">核心</span>' : "") +
      '</div></button>';
  }
  function renderList() {
    var all = Object.keys(state.entries).map(function (k) { return state.entries[k]; });
    var coreCount = all.filter(function (e) { return e.core; }).length;
    var occCount = all.reduce(function (s, e) { return s + (e.occurrences || []).length; }, 0);
    var masteredCount = all.filter(function (e) { return e.mastery === "mastered"; }).length;
    $("stats").innerHTML =
      '<div class="stat"><b>' + all.length + '</b><span>词条总数</span></div>' +
      '<div class="stat"><b>' + coreCount + '</b><span>核心概念</span></div>' +
      '<div class="stat"><b>' + occCount + '</b><span>累计遇到</span></div>' +
      '<div class="stat"><b>' + masteredCount + '</b><span>已掌握</span></div>';

    var q = state.q.trim().toLowerCase();
    var arr = all.filter(function (e) {
      if (state.filter === "core" && !e.core) return false;
      if (state.filter === "high" && scoreParts(e).total < 72) return false;
      if (["unknown", "fuzzy", "mastered"].indexOf(state.filter) >= 0 && e.mastery !== state.filter) return false;
      if (!q) return true;
      var hay = [e.word, e.term, e.def, e.contextNote, e.note, (e.related || []).join(" "),
        (e.occurrences || []).map(function (o) { return o.sentence; }).join(" ")].join(" ").toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    arr.sort(function (a, b) {
      if (state.sort === "freq") return (b.occurrences || []).length - (a.occurrences || []).length || scoreParts(b).total - scoreParts(a).total;
      if (state.sort === "recent") return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
      if (state.sort === "alpha") return a.word.localeCompare(b.word);
      return scoreParts(b).total - scoreParts(a).total || a.word.localeCompare(b.word);
    });

    var html = "";
    if (!arr.length) {
      html = '<div class="list-empty">没有符合条件的词条。<br>换个筛选条件，或在上方录入第一个生词。</div>';
    } else if (state.group) {
      [{ k: "g1", name: "重点攻克（≥72 分）" }, { k: "g2", name: "常复习（48–71 分）" }, { k: "g3", name: "已巩固（<48 分）" }].forEach(function (g) {
        var sub = arr.filter(function (e) { return groupOf(scoreParts(e).total).k === g.k; });
        if (!sub.length) return;
        html += '<div class="group-head">' + g.name + ' <span class="gcount">' + sub.length + ' 条</span></div>';
        html += sub.map(listItem).join("");
      });
    } else {
      html = arr.map(listItem).join("");
    }
    $("listBody").innerHTML = html;
  }

  /* ---------- 渲染：词条详情 ---------- */
  function renderDetail() {
    var e = state.entries[state.selected];
    if (!e) {
      $("detailBody").innerHTML =
        '<div class="empty-state"><div class="empty-icon">词</div>' +
        '<h3>还没有选中词条</h3>' +
        '<p>点击左侧词库中的任意词条，这里会显示完整中文拓展、出现记录，并允许你修改译法、手动调整重要程度与掌握情况。</p></div>';
      return;
    }
    var p = scoreParts(e), g = groupOf(p.total), m = MASTERY[e.mastery] || MASTERY.unknown;
    var html = '<div class="detail-top"><div>' +
      '<div class="detail-word">' + esc(e.word) + (e.phonetic ? ' <span class="phon">' + esc(e.phonetic) + '</span>' : "") + '</div>' +
      '<div class="detail-sub">推荐译法：' + esc(e.term) + ' · 创建于 ' + esc(e.createdAt) + ' · 最近补充 ' + esc(e.updatedAt) + '</div>' +
      '<div class="detail-badges"><span class="score-pill ' + g.k + '">' + p.total + ' 分 · ' + g.name + '</span>' +
      (e.core ? '<span class="tag core">教材核心概念</span>' : '<span class="tag">一般术语</span>') +
      '<span class="tag">来源：' + esc(e.source || "内置词表") + '</span>' +
      '<span class="tag"><span class="mastery-dot ' + m.cls + '"></span>' + m.name + '</span></div></div></div>';

    html += '<div class="section-title">重要程度构成</div><div class="score-detail">' +
      '基础 <b>38</b> + 核心概念 <b>' + p.core + '</b> + 出现次数 <b>' + p.freq + '</b> + 掌握情况 <b>' +
      (p.mastery > 0 ? "+" : "") + p.mastery + '</b> + 手动调整 <b>' + (p.adjust > 0 ? "+" : "") + p.adjust +
      '</b> = <b>' + p.total + ' 分</b>（' + g.name + '）。标记「已掌握」会自动降低优先级。' +
      '<div class="range-row"><span>手动调整</span><input type="range" id="adjustRange" min="-5" max="5" step="1" value="' +
      (Number(e.adjust) || 0) + '"><span class="range-val" id="adjustVal">' + adjustLabel(e.adjust) + '</span></div></div>';

    html += '<div class="section-title">编辑词条内容（全部用中文填写）</div><div class="detail-grid">' +
      '<div class="edit-box"><label for="editDef">中文释义</label><textarea class="input" id="editDef">' + esc(e.def) + '</textarea></div>' +
      '<div class="edit-box"><label for="editTerm">计算机术语译法（教材语境优先）</label><input class="input" id="editTerm" value="' + esc(e.term) + '"></div>' +
      '<div class="edit-box"><label for="editRelated">相关术语（每行一条）</label><textarea class="input" id="editRelated">' + esc((e.related || []).join("\n")) + '</textarea></div>' +
      '<div class="edit-box"><label for="editCollocations">常见搭配（每行一条）</label><textarea class="input" id="editCollocations">' + esc((e.collocations || []).join("\n")) + '</textarea></div>' +
      '<div class="edit-box"><label for="editConfusions">易混概念（每行一条）</label><textarea class="input" id="editConfusions">' + esc((e.confusions || []).join("\n")) + '</textarea></div>' +
      '<div class="edit-box"><label for="editCtx">教材语境说明</label><textarea class="input" id="editCtx">' + esc(e.contextNote) + '</textarea></div>' +
      '<div class="edit-box"><label for="editMastery">掌握情况</label><select class="input" id="editMastery">' +
      ["unknown", "fuzzy", "mastered"].map(function (k) {
        return '<option value="' + k + '"' + (e.mastery === k ? " selected" : "") + '>' + MASTERY[k].name + '</option>';
      }).join("") + '</select></div>' +
      '<div class="edit-box"><label for="editNote">自己的笔记（选填）</label><textarea class="input" id="editNote" placeholder="例如：第 6 章练习题里又遇到，注意和 TLB 区分">' + esc(e.note || "") + '</textarea></div>' +
      '</div>';

    html += '<div class="detail-actions">' +
      '<button type="button" class="btn primary" data-act="saveDetail">保存修改</button>' +
      '<button type="button" class="btn" data-act="mastered">标记为已掌握</button>' +
      '<button type="button" class="btn" data-act="regen">按当前译法重生成拓展</button>' +
      '<button type="button" class="btn danger" data-act="delete">删除词条</button></div>';

    html += '<div class="section-title">出现记录（同一词只补充记录，不新增词条）</div>';
    var occs = (e.occurrences || []).slice().reverse();
    html += occs.length ? occs.map(function (o) {
      return '<div class="occ-item"><b>' + esc(o.chapterLabel || D.chapterName(o.chapter)) + '</b> · ' + esc(o.date) +
        (o.sentence ? '<div class="occ-sentence">原句：' + esc(o.sentence) + '</div>' : "") + '</div>';
    }).join("") : '<p style="font-size:12.6px;color:var(--ink-3)">暂无出现记录</p>';

    html += '<div class="section-title">中文拓展资料链接</div><div class="detail-links">' +
      (e.links || []).map(function (l) {
        return '<a class="link-item" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.name) + '</a>';
      }).join("") + '</div>' +
      '<div class="custom-link-row"><input class="input" id="linkName" placeholder="链接名称（中文）">' +
      '<input class="input" id="linkUrl" placeholder="https:// 中国网站地址">' +
      '<button type="button" class="btn tiny" data-act="addLink">添加</button></div>';

    $("detailBody").innerHTML = html;
  }
  function renderAll() { renderResult(); renderList(); renderDetail(); }

  /* ---------- 词条编辑操作 ---------- */
  function splitLines(v) {
    return String(v || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function currentDetail() { return state.entries[state.selected]; }
  /* 详情修改后同步刷新即时结果区，避免两处显示不一致 */
  function syncResultEntry(e) {
    if (state.result && state.result.key === e.word) state.result.entry = clone(e);
  }
  function saveDetail() {
    var e = currentDetail(); if (!e) return;
    e.def = $("editDef").value.trim() || e.def;
    e.term = $("editTerm").value.trim() || e.term;
    e.related = splitLines($("editRelated").value);
    e.collocations = splitLines($("editCollocations").value);
    e.confusions = splitLines($("editConfusions").value);
    e.contextNote = $("editCtx").value.trim();
    e.mastery = $("editMastery").value;
    e.note = $("editNote").value.trim();
    e.adjust = Number($("adjustRange").value) || 0;
    e.updatedAt = now();
    syncResultEntry(e);
    persist(); renderAll(); toast("已保存「" + e.word + "」的修改");
  }
  function regenDetail() {
    var e = currentDetail(); if (!e) return;
    var cid = ((e.occurrences || [])[0] || {}).chapter || 0;
    var sen = ((e.occurrences || []).slice(-1)[0] || {}).sentence || "";
    var ext = buildExtension(e.word, e.term, e.def, e.core, cid, sen);
    e.related = ext.related; e.collocations = ext.collocations; e.confusions = ext.confusions;
    e.contextNote = ext.contextNote; e.links = ext.links;
    e.updatedAt = now();
    syncResultEntry(e);
    persist(); renderAll(); toast("已按当前译法重新生成中文拓展与链接");
  }
  function markMastered() {
    var e = currentDetail(); if (!e) return;
    e.mastery = "mastered"; e.updatedAt = now();
    syncResultEntry(e);
    persist(); renderAll(); toast("「" + e.word + "」已标记为已掌握，重要程度自动下调");
  }
  function deleteEntry() {
    var e = currentDetail(); if (!e) return;
    if (!window.confirm("确定删除词条「" + e.word + "」吗？此操作不可撤销，建议先导出备份。")) return;
    delete state.entries[e.word];
    state.selected = null;
    if (state.result && state.result.key === e.word) state.result = null;
    persist(); renderAll(); toast("已删除词条");
  }
  function addLink() {
    var e = currentDetail(); if (!e) return;
    var name = $("linkName").value.trim(), url = $("linkUrl").value.trim();
    if (!name || !/^https?:\/\//i.test(url)) { toast("请填写中文名称与以 https:// 开头的网址"); return; }
    e.links = e.links || [];
    e.links.push({ name: name, url: url });
    e.updatedAt = now();
    persist(); renderDetail(); toast("已添加拓展链接");
  }

  /* ---------- 示例数据 / 导入导出 ---------- */
  var SEED = [
    ["cache", [1, 6, 6]], ["two's complement", [2]], ["stack frame", [3]],
    ["pipeline", [4]], ["loop unrolling", [5]], ["cache miss", [6]],
    ["relocation", [7]], ["signal", [8]], ["page fault", [9]],
    ["file descriptor", [10]], ["socket", [11]], ["deadlock", [12]],
    ["word size", [1, 2]], ["throughput", [5]], ["seek time", [6]]
  ];
  function seed() {
    var added = 0;
    SEED.forEach(function (pair) {
      var w = pair[0];
      if (state.entries[w]) return;
      var t = D.TERM_MAP[w]; if (!t) return;
      var det = D.DETAILS[w] || {};
      var ext = buildExtension(w, t.term, t.def, t.core, pair[1][0], "");
      var e = {
        word: w, phonetic: det.p || "", def: t.def, term: t.term,
        termNote: "依据《深入理解计算机系统》中文版常用译法，阅读教材时优先按此术语理解。",
        source: "教材术语表", core: t.core,
        related: ext.related, collocations: ext.collocations, confusions: ext.confusions,
        contextNote: ext.contextNote, links: ext.links,
        mastery: "unknown", adjust: 0, note: "",
        occurrences: [], createdAt: now(), updatedAt: now(), demo: true
      };
      pair[1].forEach(function (c) { addOccurrence(e, c, ""); });
      state.entries[w] = e;
      added++;
    });
    if (state.entries["cache"]) state.entries["cache"].mastery = "fuzzy";
    if (state.entries["signal"]) state.entries["signal"].mastery = "mastered";
    if (added) persist();
    return added;
  }
  function exportData() {
    var payload = { version: 1, exportedAt: now(), entries: state.entries };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "csapp-词库-" + now().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
    toast("已导出 " + Object.keys(state.entries).length + " 个词条");
  }
  function normalizeEntry(e) {
    if (!e || !e.word) return null;
    e.word = normalizeWord(e.word);
    if (!e.word) return null;
    e.def = e.def || "（暂无中文释义，可在详情中补写）";
    e.term = e.term || cleanTermFromDef(e.def, e.word);
    e.phonetic = e.phonetic || "";
    e.termNote = e.termNote || "";
    e.source = e.source || "导入备份";
    e.core = !!e.core;
    ["related", "collocations", "confusions", "links", "occurrences"].forEach(function (k) {
      if (!Array.isArray(e[k])) e[k] = [];
    });
    e.contextNote = e.contextNote || "";
    e.note = e.note || "";
    e.mastery = MASTERY[e.mastery] ? e.mastery : "unknown";
    e.adjust = Number(e.adjust) || 0;
    e.createdAt = e.createdAt || now();
    e.updatedAt = e.updatedAt || now();
    e.demo = !!e.demo;
    return e;
  }
  function importData(text) {
    try {
      var o = JSON.parse(text);
      var raw = o && o.entries ? o.entries : (Array.isArray(o) ? o : null);
      if (!raw) throw new Error("格式不对");
      var arr = Array.isArray(raw) ? raw : Object.keys(raw).map(function (k) { return raw[k]; });
      var n = 0;
      arr.forEach(function (item) {
        var e = normalizeEntry(clone(item)); if (!e) return;
        var old = state.entries[e.word];
        if (old) {
          // 合并出现记录，保留本机已编辑内容
          var seen = {};
          (old.occurrences || []).forEach(function (x) { seen[x.date + "|" + x.chapter + "|" + x.sentence] = 1; });
          (e.occurrences || []).forEach(function (x) {
            var k = x.date + "|" + x.chapter + "|" + x.sentence;
            if (!seen[k]) { old.occurrences.push(x); seen[k] = 1; }
          });
          old.updatedAt = now();
        } else {
          state.entries[e.word] = e; n++;
        }
      });
      persist(); renderAll();
      toast("导入完成，新增 " + n + " 个词条，其余已合并");
    } catch (err) {
      toast("导入失败：文件不是本网站导出的词库 JSON");
    }
  }

  /* ---------- 初始化与事件绑定 ---------- */
  function init() {
    // 章节下拉
    D.CHAPTERS.forEach(function (c) {
      var op = document.createElement("option");
      op.value = c.id; op.textContent = "第 " + c.id + " 章 · " + c.name;
      $("chapterSelect").appendChild(op);
    });
    // 快速试词
    ["cache", "two's complement", "stack frame", "page fault", "socket", "deadlock"].forEach(function (w) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip-btn"; b.textContent = w; b.dataset.quick = w;
      $("quickWords").appendChild(b);
    });
    load();
    renderFilters();
    renderAll();

    $("entryForm").addEventListener("submit", function (ev) { ev.preventDefault(); handleSubmit(true); });
    $("btnPreview").addEventListener("click", function () { handleSubmit(false); });
    $("quickWords").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-quick]");
      if (!b) return;
      $("wordInput").value = b.dataset.quick;
      $("wordInput").focus();
    });
    $("searchInput").addEventListener("input", function () { state.q = this.value; renderList(); });
    $("filterChips").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-filter]"); if (!b) return;
      state.filter = b.dataset.filter; renderFilters(); renderList();
    });
    $("sortSelect").addEventListener("change", function () { state.sort = this.value; renderList(); });
    $("groupToggle").addEventListener("change", function () { state.group = this.checked; renderList(); });
    $("listBody").addEventListener("click", function (ev) {
      var it = ev.target.closest("[data-word]"); if (!it) return;
      state.selected = it.dataset.word;
      renderList(); renderDetail();
      if (window.innerWidth < 1080) $("secDetail").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("resultBody").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-act]"); if (!b) return;
      var act = b.dataset.act;
      if (act === "savePreview") commitPreview();
      else if (act === "openDetail") {
        state.selected = state.result.key; renderList(); renderDetail();
        if (window.innerWidth < 1080) $("secDetail").scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (act === "mastered") {
        var e = state.entries[state.result.key];
        if (e) { e.mastery = "mastered"; e.updatedAt = now(); persist(); state.result.entry = clone(e); renderAll(); toast("已标记为已掌握"); }
      } else if (act === "nextWord") { $("wordInput").focus(); }
    });

    $("detailBody").addEventListener("input", function (ev) {
      if (ev.target.id === "adjustRange") $("adjustVal").textContent = adjustLabel(ev.target.value);
    });
    $("detailBody").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-act]"); if (!b) return;
      var act = b.dataset.act;
      if (act === "saveDetail") saveDetail();
      else if (act === "mastered") markMastered();
      else if (act === "regen") regenDetail();
      else if (act === "delete") deleteEntry();
      else if (act === "addLink") addLink();
    });

    $("btnHelp").addEventListener("click", function () { $("helpModal").hidden = false; });
    $("helpClose").addEventListener("click", function () { $("helpModal").hidden = true; });
    $("helpModal").addEventListener("click", function (ev) { if (ev.target === this) this.hidden = true; });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") $("helpModal").hidden = true; });

    $("btnExport").addEventListener("click", exportData);
    $("btnImport").addEventListener("click", function () { $("fileImport").click(); });
    $("fileImport").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () { importData(String(reader.result)); };
      reader.readAsText(f, "utf-8");
      this.value = "";
    });
    $("btnSeed").addEventListener("click", function () {
      var n = seed(); renderAll();
      toast(n ? "已载入 " + n + " 个示例词条（已有词条不会被覆盖）" : "示例词条都已存在，可点词条体验合并功能");
    });
    $("btnClear").addEventListener("click", function () {
      if (!window.confirm("确定清空整个词库吗？建议先点「导出备份」。此操作不可撤销。")) return;
      state.entries = {}; state.selected = null; state.result = null; state.preview = null;
      persist(); renderAll(); toast("词库已清空，可重新录入或载入示例");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
