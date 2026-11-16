/* API page: language tabs and the Copy menu. */
(function () {
  /* language tabs: one choice applies to every example on the page */
  const pick = (lang) => {
    document.querySelectorAll('.ap-tabs').forEach((box) => {
      box.querySelectorAll('.langs button').forEach((b) => {
        const on = b.dataset.lang === lang;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on);
      });
      box.querySelectorAll('pre[data-lang]').forEach((p) => { p.hidden = p.dataset.lang !== lang; });
    });
    try { localStorage.setItem('cohen-lang', lang); } catch (e) {}
  };
  document.querySelectorAll('.langs button').forEach((b) => b.addEventListener('click', () => pick(b.dataset.lang)));
  try { const saved = localStorage.getItem('cohen-lang'); if (saved) pick(saved); } catch (e) {}

  /* Copy */
  const main = document.getElementById('cpMain'), more = document.getElementById('cpMore'), menu = document.getElementById('cpMenu');
  if (!main || !more || !menu) return;
  const label = main.querySelector('span');
  const flash = (btn, text) => {
    const el = btn.querySelector('span') && btn === main ? label : btn.querySelector('b');
    const was = el.textContent;
    el.textContent = text;
    setTimeout(() => { el.textContent = was; }, 1600);
  };
  const write = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const t = document.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      const ok = document.execCommand('copy'); t.remove(); return ok;
    }
  };
  const markdown = async () => (await fetch('api.md', { cache: 'no-cache' })).text();
  const endpoints = () => [...document.querySelectorAll('.sig')].map((s) => {
    const v = s.querySelector('.verb').textContent.trim();
    const p = s.querySelector('code').textContent.trim();
    const tags = [...s.querySelectorAll('.tag, .st')].map((t) => t.textContent.trim()).join(', ');
    return `${v} ${p}  (${tags})`;
  }).join('\n');
  const close = () => { menu.hidden = true; more.setAttribute('aria-expanded', 'false'); };

  main.addEventListener('click', async () => {
    try { flash(main, (await write(await markdown())) ? 'Copied' : 'Copy failed'); }
    catch (e) { flash(main, 'Copy failed'); }
  });
  more.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    more.setAttribute('aria-expanded', String(!menu.hidden));
  });
  menu.querySelectorAll('button[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try {
      const text = b.dataset.copy === 'md' ? await markdown() : 'Base URL: https://api.snappyfeet.org\n\n' + endpoints();
      flash(b, (await write(text)) ? 'Copied' : 'Copy failed');
    } catch (e) { flash(b, 'Copy failed'); }
    setTimeout(close, 900);
  }));
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('#cp')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
