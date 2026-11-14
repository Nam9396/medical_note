/*
 * citations.js — hiển thị trích dẫn APA (tác giả, năm) gọn và có liên kết
 *
 * - Không cần sửa file .md: vẫn viết (Kaplan & Kim, 2025), Kim et al. (2021)...
 * - Trích dẫn trong ngoặc: chữ nhỏ, màu xám; mỗi nguồn là link tới mục
 *   "Tài liệu tham khảo" ở cuối trang.
 * - Trích dẫn trong câu (Kim et al. (2021)): giữ màu chữ, thêm link.
 * - Khi chạy `mkdocs serve` (localhost), trích dẫn không khớp danh mục
 *   được gạch chân màu cam để dễ phát hiện lỗi.
 * - Rê chuột (hoặc Tab bàn phím) lên trích dẫn → tooltip hiện đầy đủ tài liệu.
 * - Chạy hoàn toàn trên trình duyệt → dùng được cả với Zensical.
 */

(function () {
  "use strict";

  var REF_HEADING = /tài liệu tham khảo|references/i;
  var SKIP_TAGS = /^(A|CODE|PRE|SCRIPT|STYLE|H1|H2|H3|H4|H5|H6|BUTTON|SVG)$/;

  // Tên tác giả: một hoặc nhiều từ viết hoa, cho phép gạch nối và dấu nháy
  // Cho phép tiền tố viết thường: "de Jonge", "van de Beek", "Ciofi degli Atti"
  var PARTICLE = "(?:(?:de|van|von|der|den|di|da|del|della|degli|dos|du|la|le|ten|ter)\\s+)*";
  var NAME = PARTICLE + "\\p{Lu}[\\p{L}'’\\-]+(?:\\s" + PARTICLE + "\\p{Lu}[\\p{L}'’\\-]+)*";
  // "et al." | "và cộng sự" | "và cs."
  var ETAL = "(?:et al\\.?|và cộng sự|và cs\\.?)";
  var YEAR = "(\\d{4}[a-z]?)";
  // Tên viết tắt của tổ chức trong ngoặc vuông: "World Health Organization [WHO], 2026"
  var ABBR = "(?:\\s*\\[[^\\]]+\\])?";
  // Trong ngoặc: "Kaplan & Kim, 2025" | "Tunkel et al., 2004" | "WHO, 2026" | "World Health Organization [WHO], 2026"
  var RE_PAREN_ITEM = new RegExp(
    "(" + NAME + ")(?:\\s+" + ETAL + "|\\s*(?:&|và)\\s*" + NAME + ")?" + ABBR + ",\\s*" + YEAR,
    "gu"
  );
  // Trong câu: "Kim et al. (2021)" | "Kaplan và Kim (2025)" | "WHO (2026)"
  var RE_NARRATIVE = new RegExp(
    "(" + NAME + ")(?:\\s+" + ETAL + "|\\s+(?:&|và)\\s+" + NAME + ")?" + ABBR + "\\s+\\(" + YEAR + "\\)",
    "gu"
  );
  var RE_PAREN_GROUP = /\(([^()]*\d{4}[a-z]?)\)/g;
  // Bản không cờ "g" để lấy tên tác giả đầu tiên
  var RE_PAREN_ITEM_ONE = new RegExp(RE_PAREN_ITEM.source, "u");

  function norm(s) {
    return s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  }

  function acronym(s) {
    var words = s.split(/\s+/).filter(function (w) { return /^\p{Lu}/u.test(w); });
    return words.length > 1 ? words.map(function (w) { return w[0]; }).join("") : "";
  }

  /* ---------- 1. Đọc danh mục tài liệu tham khảo ---------- */
  function buildIndex(root) {
    // Đọc TẤT CẢ các mục "References"/"Tài liệu tham khảo" trong trang (không chỉ mục đầu)
    var headings = Array.prototype.filter.call(
      root.querySelectorAll("h2, h3"),
      function (h) { return REF_HEADING.test(h.textContent); }
    );
    if (!headings.length) return null;
    var heading = headings[0];

    var index = {};
    var entries = [];
    headings.forEach(function (hd) {
      var el = hd.nextElementSibling;
      var level = hd.tagName;
      while (el && !(/^H[1-6]$/.test(el.tagName) && el.tagName <= level)) {
        var items = el.tagName === "UL" || el.tagName === "OL"
          ? el.querySelectorAll("li")
          : el.tagName === "P" ? [el] : [];
        Array.prototype.forEach.call(items, function (item) { entries.push(item); });
        el = el.nextElementSibling;
      }
    });

    entries.forEach(function (item) {
      var text = item.textContent.trim();
      var yearMatch = text.match(/\((\d{4}[a-z]?)[,)]/);
      if (!yearMatch) return;
      var head = text.slice(0, yearMatch.index);
      var author = head.split(/,|\s\(/)[0].replace(/\.\s*$/, "").trim();
      var year = yearMatch[1];
      var id = "ref-" + norm(author) + "-" + year;
      if (document.getElementById(id)) id += "-" + entries.indexOf(item);
      item.id = id;
      item.classList.add("ref-entry");

      var keys = [norm(author) + year];
      var lastWord = author.split(/\s+/).pop();          // "de Jonge" → "Jonge"
      if (lastWord && lastWord !== author) keys.push(norm(lastWord) + year);
      var ac = acronym(author);
      if (ac) keys.push(norm(ac) + year);
      keys.forEach(function (k) { if (!index[k]) index[k] = id; });

      // Phân biệt các tài liệu cùng tác giả đầu + cùng năm nhưng khác đồng tác giả
      // (vd. "Bonadio & Smith, 1990" và "Bonadio et al., 1990")
      var surnames = authorSurnames(head);
      var firstKeys = [norm(author)];
      if (lastWord && lastWord !== author) firstKeys.push(norm(lastWord));
      firstKeys.forEach(function (f) {
        var k = null;
        if (surnames.length === 2) k = f + "+" + norm(surnames[1].split(/\s+/).pop()) + year;
        else if (surnames.length >= 3) k = f + "+etal" + year;
        if (k && !index[k]) index[k] = id;
      });
    });
    return { index: index, heading: heading, entries: entries };
  }

  /* ---------- 2. Duyệt các đoạn chữ trong nội dung ---------- */
  function textNodes(root, refs) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!/\d{4}/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        for (var p = node.parentNode; p && p !== root; p = p.parentNode) {
          if (SKIP_TAGS.test(p.nodeName.toUpperCase())) return NodeFilter.FILTER_REJECT;
          if (p.classList && (p.classList.contains("cite") || p.classList.contains("ref-entry")))
            return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) out.push(walker.currentNode);
    return out;
  }

  function link(text, id, cls) {
    var a = document.createElement("a");
    a.className = cls;
    a.href = "#" + id;
    a.textContent = text;
    return a;
  }

  function unresolved(text) {
    var s = document.createElement("span");
    s.className = "cite-unresolved";
    s.title = "Không tìm thấy trong Tài liệu tham khảo";
    s.textContent = text;
    return s;
  }

  // Họ của các tác giả trong phần đầu mục tham khảo: "Bonadio, W. A., & Smith, D. " → ["Bonadio", "Smith"]
  function authorSurnames(head) {
    var out = [];
    var re = /([\p{L}'’\-]+(?:\s[\p{L}'’\-]+)*),\s+\p{Lu}\./gu;
    var m;
    while ((m = re.exec(head))) out.push(m[1].replace(/^&\s*/, ""));
    if (/\.\s\.\s\./.test(head)) out.push("…");   // danh sách rút gọn kiểu APA (≥ 21 tác giả)
    return out;
  }

  // full: nguyên văn trích dẫn, dùng để biết dạng "X & Y" hay "X et al." khi có
  // nhiều tài liệu cùng tác giả đầu và cùng năm
  function lookup(index, author, year, full) {
    var a = norm(author);
    if (full) {
      if (/et al|và cộng sự|và cs/.test(full)) {
        if (index[a + "+etal" + year]) return index[a + "+etal" + year];
      } else {
        var m2 = full.match(/(?:&|\svà\s)\s*([^,(\[]+)/);
        if (m2) {
          var k2 = a + "+" + norm(m2[1].trim().split(/\s+/).pop()) + year;
          if (index[k2]) return index[k2];
        }
      }
    }
    return index[a + year];
  }

  // Thay một text node bằng danh sách node mới dựa trên các đoạn khớp regex
  function replaceMatches(node, re, build) {
    var text = node.nodeValue;
    var frag = document.createDocumentFragment();
    var last = 0;
    var changed = false;
    re.lastIndex = 0;
    var m;
    while ((m = re.exec(text))) {
      var out = build(m);
      if (!out) continue;
      frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      frag.appendChild(out);
      last = m.index + m[0].length;
      changed = true;
    }
    if (!changed) return;
    frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function processParenthetical(nodes, index) {
    nodes.forEach(function (node) {
      replaceMatches(node, RE_PAREN_GROUP, function (m) {
        var inner = m[1];
        var items = [];
        var resolvedAny = false;
        RE_PAREN_ITEM.lastIndex = 0;
        var it;
        while ((it = RE_PAREN_ITEM.exec(inner))) {
          var id = lookup(index, it[1], it[2], it[0]);
          if (id) resolvedAny = true;
          items.push({ start: it.index, end: it.index + it[0].length, text: it[0], id: id });
        }
        if (!resolvedAny) return null; // "(2000–2008)", "(Mỹ, 1998)"... giữ nguyên

        var span = document.createElement("span");
        span.className = "cite";
        // Dùng cho chế độ gọn: chip "Kaplan +1", tooltip gộp tất cả nguồn
        var ids = items.filter(function (x) { return x.id; }).map(function (x) { return x.id; });
        var firstAuthor = (items[0].text.match(RE_PAREN_ITEM_ONE) || [])[1] || items[0].text;
        span.setAttribute("data-short", items.length > 1 ? firstAuthor + " +" + (items.length - 1) : firstAuthor);
        span.setAttribute("data-refs", ids.join(" "));
        span.tabIndex = 0;
        span.appendChild(document.createTextNode("("));
        var pos = 0;
        items.forEach(function (x) {
          span.appendChild(document.createTextNode(inner.slice(pos, x.start)));
          span.appendChild(x.id ? link(x.text, x.id, "cite-link") : unresolved(x.text));
          pos = x.end;
        });
        span.appendChild(document.createTextNode(inner.slice(pos) + ")"));
        return span;
      });
    });
  }

  function processNarrative(nodes, index) {
    nodes.forEach(function (node) {
      if (!node.parentNode) return;
      replaceMatches(node, RE_NARRATIVE, function (m) {
        // Thử bỏ dần các từ viết hoa đứng trước tên tác giả: "Theo WHO (2026)" → "WHO (2026)"
        var words = m[1].split(/\s+/);
        for (var i = 0; i < words.length; i++) {
          var author = words.slice(i).join(" ");
          var id = lookup(index, author, m[2], m[0].slice(m[0].indexOf(author)));
          if (!id) continue;
          var cut = m[0].indexOf(author);
          var frag = document.createDocumentFragment();
          if (cut > 0) frag.appendChild(document.createTextNode(m[0].slice(0, cut)));
          frag.appendChild(link(m[0].slice(cut), id, "cite-narrative"));
          return frag;
        }
        return null;
      });
    });
  }

  // Ô bảng chỉ chứa một trích dẫn không ngoặc: "Ahmed et al., 2022"
  function processTableCells(nodes, index) {
    var whole = new RegExp("^\\s*" + RE_PAREN_ITEM.source + "\\s*$", "u");
    nodes.forEach(function (node) {
      if (!node.parentNode || !/^(TD|TH)$/.test(node.parentNode.nodeName.toUpperCase())) return;
      var m = node.nodeValue.match(whole);
      if (!m) return;
      var id = lookup(index, m[1], m[2], m[0]);
      if (!id) return;
      var span = document.createElement("span");
      span.className = "cite cite-cell";
      span.appendChild(link(node.nodeValue.trim(), id, "cite-link"));
      node.parentNode.replaceChild(span, node);
    });
  }

  /* ---------- 3. Tooltip hiện đầy đủ tài liệu ---------- */
  
  var tip = null;
  var hideTimer = null;
  var showTimer = null;

  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement("div");
    tip.className = "cite-tooltip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    tip.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    tip.addEventListener("mouseleave", scheduleHide);
    document.body.appendChild(tip);
    return tip;
  }

  function isCompact() {
    return document.documentElement.getAttribute("data-cite") === "compact";
  }

  function citeFrom(target) {
    if (!target || !target.closest) return null;
    if (isCompact()) {
      var chip = target.closest("span.cite[data-refs]:not(.cite-cell)");
      if (chip && chip.getAttribute("data-refs")) return chip;
    }
    return target.closest("a.cite-link, a.cite-narrative");
  }

  function position(anchor) {
    var r = anchor.getBoundingClientRect();
    var gap = 8;
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var w = tip.offsetWidth;
    var h = tip.offsetHeight;
    var left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 12), vw - w - 12);
    var top = r.top - h - gap;                    // ưu tiên hiện phía trên
    var below = top < 72;                         // không đủ chỗ (header) → hiện phía dưới
    if (below) top = Math.min(r.bottom + gap, vh - h - 12);
    tip.style.left = left + "px";
    tip.style.top = top + "px";
    tip.classList.toggle("is-below", below);
  }

  function show(anchor) {
    var ids = anchor.hasAttribute("data-refs")
      ? anchor.getAttribute("data-refs").split(" ")
      : [anchor.getAttribute("href").slice(1)];
    var html = ids
      .map(function (id) { var e = document.getElementById(id); return e ? e.innerHTML : ""; })
      .filter(Boolean);
    if (!html.length) return;
    ensureTip();
    clearTimeout(hideTimer);
    tip.innerHTML = html.join('<hr class="cite-tooltip-sep">');
    tip.hidden = false;
    position(anchor);
    tip.classList.add("is-visible");
    anchor.setAttribute("aria-describedby", "cite-tooltip");
    tip.id = "cite-tooltip";
  }

  function hide() {
    if (!tip) return;
    tip.classList.remove("is-visible");
    tip.hidden = true;
  }

  function scheduleHide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 150);            // đủ thời gian rê chuột vào tooltip để bấm DOI
  }

  function bindTooltip() {
    if (document.documentElement.dataset.citeTooltip) return;
    document.documentElement.dataset.citeTooltip = "on";
    var canHover = !window.matchMedia || window.matchMedia("(hover: hover)").matches;

    if (canHover) {
      document.addEventListener("mouseover", function (e) {
        var a = citeFrom(e.target);
        if (!a) return;
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
        showTimer = setTimeout(function () { show(a); }, 120);
      });
      document.addEventListener("mouseout", function (e) {
        if (citeFrom(e.target) && !citeFrom(e.relatedTarget)) scheduleHide();
      });
    }
    document.addEventListener("focusin", function (e) {
      var a = citeFrom(e.target);
      if (a) show(a);
    });
    document.addEventListener("focusout", function (e) {
      if (citeFrom(e.target)) scheduleHide();
    });
    window.addEventListener("scroll", hide, { passive: true });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  }

  /* ---------- 4. Chế độ gọn / đầy đủ ---------- */
  var MODE_KEY = "cite-mode";

  function getMode() {
    try { return localStorage.getItem(MODE_KEY) || "compact"; } catch (e) { return "compact"; }
  }

  function setMode(mode) {
    document.documentElement.setAttribute("data-cite", mode);
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
    var b = document.getElementById("cite-toggle");
    if (b) {
      b.textContent = mode === "compact" ? "Hiện trích dẫn" : "Thu gọn trích dẫn";
      b.setAttribute("aria-pressed", mode === "full" ? "true" : "false");
    }
    hide();
  }

  function setupToggle(root) {
    var has = root.querySelector("span.cite[data-refs]");
    var b = document.getElementById("cite-toggle");
    if (!has) { if (b) b.hidden = true; return; }
    if (!b) {
      b = document.createElement("button");
      b.id = "cite-toggle";
      b.type = "button";
      b.addEventListener("click", function () {
        setMode(isCompact() ? "full" : "compact");
      });
      document.body.appendChild(b);
    }
    b.hidden = false;
    setMode(getMode());
  }

  /* ---------- 5. Chạy ---------- */
  function run() {
    var root = document.querySelector(".md-content article") ||
               document.querySelector(".md-typeset");
    if (!root || root.dataset.citations === "done") return;
    root.dataset.citations = "done";

    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      document.body.classList.add("cite-debug");
    }

    var refs = buildIndex(root);
    if (!refs) return;

    processParenthetical(textNodes(root), refs.index);
    processNarrative(textNodes(root), refs.index);
    processTableCells(textNodes(root), refs.index);
    hide();
    bindTooltip();
    setupToggle(root);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(run); // tương thích chế độ navigation.instant của Material
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
