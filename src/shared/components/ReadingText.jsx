import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isVowel } from '../utils/orthography';
import { splitToWarehouses } from '../utils/syllableSplit';

/**
 * ReadingText — текст, разбитый на «склады», плюс «ползунок» для чтения пальчиком.
 *
 * Обычный режим: просто рисует слово или предложение по складам (гласные красные,
 * согласные синие, между складами дефис) — как это было в приложениях раньше.
 *
 * Режим `tracking` (как в reading.com): ребёнок ведёт пальцем по строке, буква под
 * пальцем подсвечивается «таблеткой», весь склад — мягкой подложкой, а под буквой
 * едет ползунок. Палец можно вести и под строкой: берётся ближайшая строка, потом
 * ближайшая буква в ней. Когда палец заходит в новый склад, вызывается `onSyllable`
 * (приложение озвучивает склад, если звук включён).
 *
 * @param {string} text — слово или предложение (слова через пробел)
 * @param {string} lang — 'ru' | 'be' | 'uk', нужен для разбивки и цвета букв
 * @param {string} fontSize — CSS-размер шрифта для всего текста
 * @param {string} className — классы раскладки для строки текста (flex, leading, …)
 * @param {boolean} tracking — включён ли ползунок
 * @param {Function} onSyllable — (syllable) => void, палец вошёл в новый склад
 * @param {Function} onInteract — вызывается в начале и в конце ведения пальцем,
 *   чтобы приложение не приняло это движение за клик «следующее слово»
 */
const ReadingText = ({
  text,
  lang,
  isDark = false,
  isUpperCase = false,
  showDashes = true,
  fontSize,
  className = '',
  tracking = false,
  onSyllable = null,
  onInteract = null,
}) => {
  const boxRef = useRef(null);
  const charRefs = useRef([]);
  const rectsRef = useRef([]);     // прямоугольники букв относительно бокса
  const staleRef = useRef(true);   // размеры устарели (сменился текст / шрифт)
  const activeRef = useRef(-1);    // то же, что active, но без задержки рендера
  const syllableRef = useRef(null);
  const [active, setActive] = useState(-1);

  // Плоская модель: слова → склады → буквы. У каждой буквы сквозной индекс,
  // по нему находятся и DOM-узел, и прямоугольник.
  const model = useMemo(() => {
    const items = [];
    const words = text.split(' ').filter(Boolean).map((word, wi) => ({
      parts: splitToWarehouses(word, lang).map((syllable, si) => {
        const key = `${wi}:${si}`;
        return {
          key,
          syllable,
          chars: syllable.split('').map((ch) => {
            const item = { ch, key, syllable, index: items.length };
            items.push(item);
            return item;
          }),
        };
      }),
    }));
    return { words, items };
  }, [text, lang]);

  // Замер положения каждой буквы. Координаты — относительно бокса, чтобы
  // подсветку можно было рисовать абсолютным позиционированием.
  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const base = box.getBoundingClientRect();
    rectsRef.current = model.items.map((item, i) => {
      const el = charRefs.current[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        index: i,
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
        x: r.left - base.left,
        y: r.top - base.top,
        w: r.width,
        h: r.height,
      };
    });
    staleRef.current = false;
  }, [model]);

  // Сменился текст или оформление — старые размеры больше не годятся.
  // Пересчёт с задержкой: карточка в этот момент ещё анимируется (scale),
  // а во время трансформации getBoundingClientRect() врёт.
  useEffect(() => {
    staleRef.current = true;
    setActive(-1);
    activeRef.current = -1;
    syllableRef.current = null;
    const id = setTimeout(() => { if (tracking) measure(); }, 220);
    const onResize = () => { staleRef.current = true; };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', onResize);
    };
  }, [text, fontSize, isUpperCase, showDashes, tracking, measure]);

  // Буква под пальцем: сначала ближайшая строка (палец может вести и под текстом),
  // потом ближайшая буква внутри этой строки.
  const pick = (x, y) => {
    const rects = rectsRef.current;
    let lineTop = null;
    let bestDy = Infinity;
    for (const r of rects) {
      if (!r) continue;
      const dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
      if (dy < bestDy - 0.5) { bestDy = dy; lineTop = r.top; }
    }
    if (lineTop === null) return -1;

    let best = -1;
    let bestDx = Infinity;
    for (const r of rects) {
      if (!r || Math.abs(r.top - lineTop) > Math.max(4, r.h * 0.5)) continue;
      const dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      if (dx < bestDx) { bestDx = dx; best = r.index; }
    }
    return best;
  };

  const track = (e) => {
    if (!tracking) return;
    if (staleRef.current || !rectsRef.current.length) measure();
    const index = pick(e.clientX, e.clientY);
    if (index === activeRef.current) return;
    activeRef.current = index;
    setActive(index);

    const item = index >= 0 ? model.items[index] : null;
    const key = item ? item.key : null;
    if (key !== syllableRef.current) {
      syllableRef.current = key;
      if (item && onSyllable) onSyllable(item.syllable, item);
    }
  };

  const clear = () => {
    activeRef.current = -1;
    syllableRef.current = null;
    setActive(-1);
  };

  const handleDown = (e) => {
    if (!tracking) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (onInteract) onInteract();
    measure();
    track(e);
  };

  const handleUp = (e) => {
    if (!tracking) return;
    // Палец мог уехать с карточки — сообщаем приложению, что это было ведение,
    // а не клик «следующее слово» (браузер шлёт click общему предку).
    if (onInteract) onInteract();
    // Мышь просто «водит» без нажатия — подсветку снимает уход курсора.
    if (e.pointerType !== 'mouse') clear();
  };

  const handleCancel = () => {
    if (onInteract) onInteract();
    clear();
  };

  const charColor = (ch) => (isVowel(ch, lang)
    ? (isDark ? 'text-red-400' : 'text-red-600')
    : (isDark ? 'text-blue-400' : 'text-blue-600'));
  const fmt = (s) => (isUpperCase ? s.toUpperCase() : s);

  // Подсветка: таблетка под буквой и мягкая подложка под всем складом.
  const letterRect = active >= 0 ? rectsRef.current[active] : null;
  const activeItem = active >= 0 ? model.items[active] : null;
  const syllableRect = activeItem && letterRect
    ? model.items.reduce((acc, it) => {
      if (it.key !== activeItem.key) return acc;
      const r = rectsRef.current[it.index];
      if (!r) return acc;
      if (!acc) return { x: r.x, y: r.y, w: r.w, h: r.h };
      const right = Math.max(acc.x + acc.w, r.x + r.w);
      const bottom = Math.max(acc.y + acc.h, r.y + r.h);
      const x = Math.min(acc.x, r.x);
      const y = Math.min(acc.y, r.y);
      return { x, y, w: right - x, h: bottom - y };
    }, null)
    : null;

  const pad = (r, px, py) => ({
    left: r.x - px,
    top: r.y - py,
    width: r.w + px * 2,
    height: r.h + py * 2,
  });

  return (
    <div
      ref={boxRef}
      className={`relative ${tracking ? 'finger-track cursor-pointer pb-8 md:pb-10' : ''}`}
      onPointerDown={handleDown}
      onPointerMove={track}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      onPointerLeave={clear}
      onClick={tracking ? (e) => e.stopPropagation() : undefined}
    >
      {/* Подложка текущего склада */}
      {tracking && syllableRect && (
        <div
          className={`absolute rounded-2xl transition-all duration-75 ease-out pointer-events-none ${
            isDark ? 'bg-yellow-300/10' : 'bg-yellow-200/50'
          }`}
          style={pad(syllableRect, syllableRect.h * 0.08, syllableRect.h * 0.06)}
        />
      )}

      {/* Таблетка текущей буквы */}
      {tracking && letterRect && (
        <div
          className={`absolute rounded-xl transition-all duration-75 ease-out pointer-events-none ${
            isDark ? 'bg-yellow-300/30 ring-2 ring-yellow-300/60' : 'bg-yellow-300/80 ring-2 ring-yellow-500/50'
          }`}
          style={pad(letterRect, letterRect.h * 0.06, letterRect.h * 0.04)}
        />
      )}

      <div className={`relative font-bold select-none ${className}`} style={{ fontSize }}>
        {model.words.map((word, wi) => (
          <span key={wi} className="inline-flex items-baseline">
            {word.parts.map((part, si) => (
              <span key={si} className="inline-flex items-baseline">
                {si > 0 && showDashes && (
                  <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'} text-[0.7em] -mx-[0.02em]`}>-</span>
                )}
                {part.chars.map((item) => (
                  <span
                    key={item.index}
                    ref={(el) => { charRefs.current[item.index] = el; }}
                    className={`inline-block transition-transform duration-75 ${charColor(item.ch)} ${
                      active === item.index ? 'scale-110' : ''
                    }`}
                  >
                    {fmt(item.ch)}
                  </span>
                ))}
              </span>
            ))}
          </span>
        ))}
      </div>

      {/* Ползунок — едет под текущей буквой */}
      {tracking && letterRect && (
        <div
          className={`absolute rounded-full transition-all duration-75 ease-out pointer-events-none ${
            isDark ? 'bg-purple-300' : 'bg-purple-600'
          }`}
          style={{
            left: letterRect.x - letterRect.w * 0.15,
            top: letterRect.y + letterRect.h + Math.max(4, letterRect.h * 0.06),
            width: letterRect.w * 1.3,
            height: Math.max(5, letterRect.h * 0.07),
          }}
        />
      )}
    </div>
  );
};

export default ReadingText;
