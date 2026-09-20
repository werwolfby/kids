import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isVowel } from '../utils/orthography';
import { splitToWarehouses } from '../utils/syllableSplit';

/**
 * ReadingText — текст, разбитый на «склады», плюс «ползунок» для чтения.
 *
 * Обычный режим: просто рисует слово или предложение по складам (гласные красные,
 * согласные синие, между складами дефис).
 *
 * Режим `tracking`: под текстом появляется ползунок — полоска с бегунком, как у
 * прогресс-бара. Ребёнок тянет бегунок пальцем СНИЗУ, поэтому палец не закрывает
 * буквы. Полоска поделена на равные кусочки по числу букв, так что бегунок идёт
 * по тексту слева направо (в предложениях — и по строкам). Текущая буква
 * подсвечена «таблеткой», её склад — мягкой подложкой, а всё прочитанное слева
 * становится серым. Когда бегунок заходит в новый склад, вызывается `onSyllable`
 * (приложение озвучивает склад, если звук включён).
 *
 * @param {string} text — слово или предложение (слова через пробел)
 * @param {string} lang — 'ru' | 'be' | 'uk', нужен для разбивки и цвета букв
 * @param {string} fontSize — CSS-размер шрифта для всего текста
 * @param {string} className — классы раскладки для строки текста (flex, leading, …)
 * @param {boolean} tracking — показывать ли ползунок
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
  const railRef = useRef(null);
  const charRefs = useRef([]);
  const rectsRef = useRef([]);     // прямоугольники букв относительно бокса
  const staleRef = useRef(true);   // размеры устарели (сменился текст / шрифт)
  const activeRef = useRef(-1);    // то же, что active, но без задержки рендера
  const syllableRef = useRef(null);
  const draggingRef = useRef(false);
  const [active, setActive] = useState(-1);
  const [, setTick] = useState(0); // перерисовка после нового замера

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

  const total = model.items.length;

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
      return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
    });
    staleRef.current = false;
    setTick(v => v + 1);
  }, [model]);

  // Сменился текст или оформление — ползунок в начало, размеры пересчитать.
  // С задержкой: карточка в этот момент ещё анимируется (scale), а во время
  // трансформации getBoundingClientRect() врёт.
  useEffect(() => {
    staleRef.current = true;
    activeRef.current = -1;
    syllableRef.current = null;
    setActive(-1);
    const id = setTimeout(() => { if (tracking) measure(); }, 220);
    const onResize = () => { staleRef.current = true; measure(); };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', onResize);
    };
  }, [text, fontSize, isUpperCase, showDashes, tracking, measure]);

  // Положение пальца на полоске → номер буквы. Полоска поделена на равные
  // кусочки: сколько букв, столько кусочков.
  const moveTo = useCallback((clientX) => {
    const rail = railRef.current;
    if (!rail || !total) return;
    const r = rail.getBoundingClientRect();
    const ratio = (clientX - r.left) / (r.width || 1);
    const i = Math.max(0, Math.min(total - 1, Math.floor(ratio * total)));
    if (i === activeRef.current) return;

    if (staleRef.current) measure();
    activeRef.current = i;
    setActive(i);

    const item = model.items[i];
    if (item.key !== syllableRef.current) {
      syllableRef.current = item.key;
      if (onSyllable) onSyllable(item.syllable, item);
    }
  }, [total, model, measure, onSyllable]);

  const handleDown = (e) => {
    e.stopPropagation();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (onInteract) onInteract();
    moveTo(e.clientX);
  };

  const handleMove = (e) => {
    if (draggingRef.current) moveTo(e.clientX);
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

  // Бегунок стоит в середине «своего» кусочка полоски; до первого касания — слева.
  const pct = active < 0 || !total ? 0 : ((active + 0.5) / total) * 100;

  return (
    <div ref={boxRef} className="relative">
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

      {/* Сам текст: по нему не водят, поэтому он не перехватывает касания */}
      <div className={`relative font-bold select-none pointer-events-none ${className}`} style={{ fontSize }}>
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

      {/* Ползунок под текстом: тянем бегунок пальцем, палец не закрывает буквы */}
      {tracking && (
        <div
          className="finger-track mt-5 md:mt-8 px-6 py-3 mx-auto w-[min(72vw,560px)] max-w-full cursor-pointer"
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onClick={(e) => e.stopPropagation()}
          role="slider"
          aria-label={sliderLabel}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={active + 1}
        >
          <div
            ref={railRef}
            className={`relative h-3 md:h-4 rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-200'}`}
          >
            {/* Пройденная часть */}
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-75 ease-out ${
                isDark ? 'bg-purple-400' : 'bg-purple-500'
              }`}
              style={{ width: `${pct}%` }}
            />
            {/* Бегунок */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full shadow-lg transition-all duration-75 ease-out w-11 h-11 md:w-14 md:h-14 text-xl md:text-2xl border-4 ${
                isDark ? 'bg-gray-900 border-purple-300' : 'bg-white border-purple-500'
              }`}
              style={{ left: `${pct}%` }}
            >
              👆
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingText;
