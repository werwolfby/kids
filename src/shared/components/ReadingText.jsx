import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { isVowel } from '../utils/orthography';
import { splitToWarehouses } from '../utils/syllableSplit';

/** Отступ ползунка от низа своей строки и его высота (px, без учёта scale). */
const SLIDER_GAP = 6;
const SLIDER_H = 44;
/** Короткую строку («и», «вот») всё равно тянем за полоску удобной длины. */
const SLIDER_MIN_W = 200;
/** Сколько места оставить под строкой, чтобы ползунок туда поместился. */
const LINE_SPACE = '4.25rem';

/**
 * ReadingText — текст, разбитый на «склады», плюс «ползунки» для чтения.
 *
 * Обычный режим: просто рисует слово или предложение по складам (гласные красные,
 * согласные синие, между складами дефис).
 *
 * Режим `tracking`: под КАЖДОЙ строкой появляется свой ползунок — полоска с
 * бегунком по ширине этой строки. Ребёнок тянет бегунок снизу, поэтому палец не
 * закрывает буквы; дочитав строку, он берётся за ползунок следующей. Полоска
 * поделена на равные кусочки по числу букв в строке. Текущая буква подсвечена
 * «таблеткой», её склад — мягкой подложкой, а всё прочитанное слева (включая
 * строки выше) становится серым. Когда бегунок заходит в новый склад,
 * вызывается `onSyllable` — приложение озвучивает склад, если звук включён.
 *
 * Строки не задаются вручную: после отрисовки компонент замеряет каждую букву и
 * группирует их по вертикали — как реально лёг перенос.
 *
 * @param {string} text — слово или предложение (слова через пробел)
 * @param {string} lang — 'ru' | 'be' | 'uk', нужен для разбивки и цвета букв
 * @param {string} fontSize — CSS-размер шрифта для всего текста
 * @param {string} className — классы раскладки для строки текста (flex, leading, …)
 * @param {boolean} tracking — показывать ли ползунки
 * @param {Function} onSyllable — (syllable) => void, бегунок вошёл в новый склад
 * @param {Function} onInteract — вызывается в начале и в конце перетаскивания,
 *   чтобы приложение не приняло его за клик «следующая карточка»
 * @param {string} sliderLabel — подпись ползунка для скринридера
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
  sliderLabel = '',
}) => {
  const boxRef = useRef(null);
  const charRefs = useRef([]);
  const rectsRef = useRef([]);     // прямоугольники букв относительно бокса
  const activeRef = useRef(-1);    // то же, что active, но без задержки рендера
  const syllableRef = useRef(null);
  const draggingRef = useRef(false);
  const [active, setActive] = useState(-1);
  const [lines, setLines] = useState([]);

  // Плоская модель: слова → склады → буквы. У каждой буквы сквозной индекс,
  // по нему находятся и DOM-узел, и прямоугольник, и место на ползунке.
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

  // Замер букв и сборка строк. Карточка в момент смены слова ещё анимируется
  // (scale), поэтому делим на масштаб: получаются честные координаты вёрстки,
  // и ползунки не прыгают, когда анимация закончится.
  const measure = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    const base = box.getBoundingClientRect();
    const k = box.offsetWidth ? (base.width / box.offsetWidth) || 1 : 1;

    const rects = model.items.map((item, i) => {
      const el = charRefs.current[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        index: i,
        x: (r.left - base.left) / k,
        y: (r.top - base.top) / k,
        w: r.width / k,
        h: r.height / k,
      };
    });
    rectsRef.current = rects;

    // Буквы одного размера, поэтому строка = одинаковая вертикаль.
    const groups = [];
    for (const r of rects) {
      if (!r) continue;
      const line = groups.find(g => Math.abs(g.top - r.y) <= Math.max(2, r.h * 0.5));
      if (line) {
        line.bottom = Math.max(line.bottom, r.y + r.h);
        line.left = Math.min(line.left, r.x);
        line.right = Math.max(line.right, r.x + r.w);
        line.indices.push(r.index);
      } else {
        groups.push({ top: r.y, bottom: r.y + r.h, left: r.x, right: r.x + r.w, indices: [r.index] });
      }
    }
    groups.sort((a, b) => a.top - b.top);
    groups.forEach(g => g.indices.sort((a, b) => a - b));
    setLines(groups);
  }, [model]);

  // Сменился текст или оформление — ползунки в начало, строки пересобрать.
  useLayoutEffect(() => {
    activeRef.current = -1;
    syllableRef.current = null;
    setActive(-1);
    if (!tracking) { setLines([]); return; }

    measure();
    // Шрифт мог догрузиться уже после первой отрисовки.
    const id = setTimeout(measure, 250);
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', onResize);
    };
  }, [text, fontSize, isUpperCase, showDashes, tracking, measure]);

  // Положение пальца на полоске строки → буква этой строки. Полоска поделена
  // на равные кусочки: сколько букв в строке, столько кусочков.
  const moveTo = useCallback((clientX, line, railRect) => {
    const n = line.indices.length;
    if (!n || !railRect.width) return;
    const ratio = (clientX - railRect.left) / railRect.width;
    const pos = Math.max(0, Math.min(n - 1, Math.floor(ratio * n)));
    const index = line.indices[pos];
    if (index === activeRef.current) return;

    activeRef.current = index;
    setActive(index);

    const item = model.items[index];
    if (item.key !== syllableRef.current) {
      syllableRef.current = item.key;
      if (onSyllable) onSyllable(item.syllable, item);
    }
  }, [model, onSyllable]);

  const handleDown = (line) => (e) => {
    e.stopPropagation();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (onInteract) onInteract();
    moveTo(e.clientX, line, e.currentTarget.getBoundingClientRect());
  };

  const handleMove = (line) => (e) => {
    if (draggingRef.current) moveTo(e.clientX, line, e.currentTarget.getBoundingClientRect());
  };

  const handleUp = () => {
    // Бегунок остаётся там, где его отпустили: это ползунок, а не подсветка
    // под пальцем. Приложению сообщаем, что это было перетаскивание.
    draggingRef.current = false;
    if (onInteract) onInteract();
  };

  const fmt = (s) => (isUpperCase ? s.toUpperCase() : s);
  const charColor = (item) => {
    if (active >= 0 && item.index < active) {
      return isDark ? 'text-gray-600' : 'text-gray-400';   // уже прочитано
    }
    return isVowel(item.ch, lang)
      ? (isDark ? 'text-red-400' : 'text-red-600')
      : (isDark ? 'text-blue-400' : 'text-blue-600');
  };

  // Подсветка: таблетка под текущей буквой и подложка под всем её складом.
  const letterRect = active >= 0 ? rectsRef.current[active] : null;
  const activeItem = active >= 0 ? model.items[active] : null;
  const syllableRect = activeItem && letterRect
    ? model.items.reduce((acc, it) => {
      if (it.key !== activeItem.key) return acc;
      const r = rectsRef.current[it.index];
      if (!r) return acc;
      if (!acc) return { x: r.x, y: r.y, w: r.w, h: r.h };
      const x = Math.min(acc.x, r.x);
      const y = Math.min(acc.y, r.y);
      return {
        x,
        y,
        w: Math.max(acc.x + acc.w, r.x + r.w) - x,
        h: Math.max(acc.y + acc.h, r.y + r.h) - y,
      };
    }, null)
    : null;

  const pad = (r, px, py) => ({
    left: r.x - px,
    top: r.y - py,
    width: r.w + px * 2,
    height: r.h + py * 2,
  });

  // Где стоит бегунок этой строки: строка дочитана — в конце, ещё не начата —
  // в начале, текущая — в середине «своего» кусочка.
  const linePct = (line) => {
    const n = line.indices.length;
    if (active < 0 || !n) return 0;
    const pos = line.indices.indexOf(active);
    if (pos >= 0) return ((pos + 0.5) / n) * 100;
    return active > line.indices[n - 1] ? 100 : 0;
  };

  return (
    <div ref={boxRef} className={`relative ${tracking ? 'pb-14' : ''}`}>
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

      {/* Сам текст: по нему не водят, поэтому он не перехватывает касания.
          В режиме ползунков строки раздвинуты — под каждой живёт свой ползунок. */}
      <div
        className={`relative font-bold select-none pointer-events-none ${className}`}
        style={{ fontSize, rowGap: tracking ? LINE_SPACE : undefined }}
      >
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
                    className={`inline-block transition-all duration-75 ${charColor(item)} ${
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

      {/* По ползунку на строку — каждый по ширине своей строки */}
      {tracking && lines.map((line, li) => {
        const width = Math.max(line.right - line.left, SLIDER_MIN_W);
        const left = (line.left + line.right) / 2 - width / 2;
        const pct = linePct(line);
        return (
          <div
            key={li}
            className="finger-track absolute flex items-center cursor-pointer"
            style={{ left, top: line.bottom + SLIDER_GAP, width, height: SLIDER_H }}
            onPointerDown={handleDown(line)}
            onPointerMove={handleMove(line)}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            onClick={(e) => e.stopPropagation()}
            role="slider"
            aria-label={sliderLabel}
            aria-valuemin={1}
            aria-valuemax={line.indices.length}
            aria-valuenow={Math.max(1, line.indices.indexOf(active) + 1)}
          >
            <div className={`relative w-full h-3 rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-200'}`}>
              {/* Пройденная часть строки */}
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-75 ease-out ${
                  isDark ? 'bg-purple-400' : 'bg-purple-500'
                }`}
                style={{ width: `${pct}%` }}
              />
              {/* Бегунок */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full shadow-lg transition-all duration-75 ease-out w-10 h-10 md:w-12 md:h-12 text-lg md:text-xl border-4 ${
                  isDark ? 'bg-gray-900 border-purple-300' : 'bg-white border-purple-500'
                }`}
                style={{ left: `${pct}%` }}
              >
                👆
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReadingText;
