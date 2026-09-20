/**
 * Все надписи интерфейса на трёх языках.
 *
 * Ключи одинаковые для всех языков, поэтому компонент просто берёт
 * getUI(lang) и обращается к нужной ветке. Плейсхолдеры вида {n}
 * подставляются функцией fill().
 */

import { DEFAULT_LANGUAGE } from './languages.js';

export const UI = {
  ru: {
    home: {
      brand: 'Учимся читать',
      subtitle: 'Обучающие приложения для детей',
      languageLabel: 'Язык обучения',
      open: 'Открыть',
      aboutTitle: 'О приложении',
      about: 'Это коллекция обучающих приложений для детей: учимся читать по слогам — от отдельных слогов к словам и целым предложениям.',
      footer: 'Сделано с ❤️ для детей'
    },
    apps: {
      syllables: {
        title: 'Учим слоги',
        description: 'Читаем слоги из согласных и гласных'
      },
      popularWords: {
        title: 'Популярные слова',
        description: 'Читаем 1000 самых частых слов, разбитых на склады'
      },
      sentences: {
        title: 'Учим предложения',
        description: 'Читаем простые предложения по слогам, от лёгких к сложным'
      }
    },
    menu: {
      title: 'Учим слоги!',
      orderCV: 'Согласная + Гласная',
      orderVC: 'Гласная + Согласная',
      orderMixed: 'Вперемешку',
      consonants: 'Согласные:',
      vowels: 'Гласные:',
      all: 'Все',
      clear: 'Сбросить',
      selected: 'Выбрано: {n}',
      nothingSelected: 'Ничего не выбрано — будут все буквы',
      softSign: 'Слоги с мягким знаком (Ь)',
      softSignHint: '«Ь» ставится только после согласной — например НЬ, ТЬ, СЬ',
      softSignOrderHint: '(работает в порядке «Согласная + Гласная»)',
      startRandom: 'Случайные слоги',
      game3d: '3D Игра',
      spaceKey: 'Пробел',
      spaceHint: 'Нажимай {key} для следующего слога',
      home: 'На главную'
    },
    display: {
      toggleCase: 'Переключить регистр',
      soundOn: 'Включить звук',
      soundOff: 'Выключить звук',
      hintsShow: 'Показать подсказки',
      hintsHide: 'Скрыть подсказки',
      changeBg: 'Сменить фон',
      menu: 'Меню',
      nextHint: 'Нажми ПРОБЕЛ или экран для следующего слога'
    },
    words: {
      rangeTitle: 'Диапазон слов',
      rangePick: 'Выбрать диапазон слов',
      count: '{n} слов из {total}',
      allWords: 'Все {total}',
      rangeFrom: 'Начало диапазона',
      rangeTo: 'Конец диапазона',
      cancel: 'Отмена',
      apply: 'Применить',
      prev: 'Предыдущее слово',
      next: 'Следующее слово'
    },
    sentences: {
      levelTitle: 'Уровень сложности',
      levelPick: 'Выбрать уровень',
      levelShort: 'Ур. {n}',
      allShort: 'Все',
      allLevels: 'Все уровни',
      allLevelsHint: 'Все предложения подряд',
      close: 'Закрыть',
      prev: 'Предыдущее',
      next: 'Следующее'
    },
    common: {
      toMenu: 'В меню',
      shuffleOn: 'Вперемешку (нажми — по порядку)',
      shuffleOff: 'По порядку (нажми — вперемешку)',
      dashesHide: 'Скрыть дефисы',
      dashesShow: 'Показать дефисы',
      trackOn: 'Выключить ползунок',
      trackOff: 'Включить ползунок — вести пальчиком по буквам',
      trackHint: 'Веди пальчиком по буквам — буква подсветится',
      navHint: 'ПРОБЕЛ или экран — дальше · ← → листать'
    },
    game: {
      speed: 'Скорость',
      score: 'Очки',
      correct: 'Правильных',
      menu: 'Меню',
      gameOver: 'ИГРА ОКОНЧЕНА!',
      correctAnswers: 'Правильных ответов',
      of: 'из',
      accuracy: 'Точность',
      backToMenu: 'Вернуться в меню',
      instructions: '← или → для ответа | ↑ повторить'
    }
  },

  be: {
    home: {
      brand: 'Вучымся чытаць',
      subtitle: 'Навучальныя праграмы для дзяцей',
      languageLabel: 'Мова навучання',
      open: 'Адкрыць',
      aboutTitle: 'Пра праграму',
      about: 'Гэта збор навучальных праграм для дзяцей: вучымся чытаць па складах — ад асобных складоў да словаў і цэлых сказаў.',
      footer: 'Зроблена з ❤️ для дзяцей'
    },
    apps: {
      syllables: {
        title: 'Вучым склады',
        description: 'Чытаем склады з зычных і галосных'
      },
      popularWords: {
        title: 'Папулярныя словы',
        description: 'Чытаем 1000 самых частых словаў, разбітых на склады'
      },
      sentences: {
        title: 'Вучым сказы',
        description: 'Чытаем простыя сказы па складах, ад лёгкіх да складаных'
      }
    },
    menu: {
      title: 'Вучым склады!',
      orderCV: 'Зычная + Галосная',
      orderVC: 'Галосная + Зычная',
      orderMixed: 'Упярэмешку',
      consonants: 'Зычныя:',
      vowels: 'Галосныя:',
      all: 'Усе',
      clear: 'Скінуць',
      selected: 'Выбрана: {n}',
      nothingSelected: 'Нічога не выбрана — будуць усе літары',
      softSign: 'Склады з мяккім знакам (Ь)',
      softSignHint: '«Ь» ставіцца толькі пасля зычнай — напрыклад НЬ, СЬ, ЗЬ',
      softSignOrderHint: '(працуе ў парадку «Зычная + Галосная»)',
      startRandom: 'Выпадковыя склады',
      game3d: '3D Гульня',
      spaceKey: 'Прабел',
      spaceHint: 'Націскай {key} для наступнага складу',
      home: 'На галоўную'
    },
    display: {
      toggleCase: 'Пераключыць рэгістр',
      soundOn: 'Уключыць гук',
      soundOff: 'Выключыць гук',
      hintsShow: 'Паказаць падказкі',
      hintsHide: 'Схаваць падказкі',
      changeBg: 'Змяніць фон',
      menu: 'Меню',
      nextHint: 'Націсні ПРАБЕЛ ці экран для наступнага складу'
    },
    words: {
      rangeTitle: 'Дыяпазон словаў',
      rangePick: 'Выбраць дыяпазон словаў',
      count: '{n} словаў з {total}',
      allWords: 'Усе {total}',
      rangeFrom: 'Пачатак дыяпазону',
      rangeTo: 'Канец дыяпазону',
      cancel: 'Адмена',
      apply: 'Ужыць',
      prev: 'Папярэдняе слова',
      next: 'Наступнае слова'
    },
    sentences: {
      levelTitle: 'Узровень складанасці',
      levelPick: 'Выбраць узровень',
      levelShort: 'Узр. {n}',
      allShort: 'Усе',
      allLevels: 'Усе ўзроўні',
      allLevelsHint: 'Усе сказы запар',
      close: 'Закрыць',
      prev: 'Папярэдні',
      next: 'Наступны'
    },
    common: {
      toMenu: 'У меню',
      shuffleOn: 'Упярэмешку (націсні — па парадку)',
      shuffleOff: 'Па парадку (націсні — упярэмешку)',
      dashesHide: 'Схаваць злучкі',
      dashesShow: 'Паказаць злучкі',
      trackOn: 'Выключыць паўзунок',
      trackOff: 'Уключыць паўзунок — весці пальчыкам па літарах',
      trackHint: 'Вядзі пальчыкам па літарах — літара падсвеціцца',
      navHint: 'ПРАБЕЛ ці экран — далей · ← → гартаць'
    },
    game: {
      speed: 'Хуткасць',
      score: 'Ачкі',
      correct: 'Правільных',
      menu: 'Меню',
      gameOver: 'ГУЛЬНЯ СКОНЧАНА!',
      correctAnswers: 'Правільных адказаў',
      of: 'з',
      accuracy: 'Дакладнасць',
      backToMenu: 'Вярнуцца ў меню',
      instructions: '← ці → для адказу | ↑ паўтарыць'
    }
  },

  uk: {
    home: {
      brand: 'Вчимося читати',
      subtitle: 'Навчальні застосунки для дітей',
      languageLabel: 'Мова навчання',
      open: 'Відкрити',
      aboutTitle: 'Про застосунок',
      about: 'Це збірка навчальних застосунків для дітей: вчимося читати по складах — від окремих складів до слів і цілих речень.',
      footer: 'Зроблено з ❤️ для дітей'
    },
    apps: {
      syllables: {
        title: 'Вчимо склади',
        description: 'Читаємо склади з приголосних і голосних'
      },
      popularWords: {
        title: 'Популярні слова',
        description: 'Читаємо 1000 найчастіших слів, поділених на склади'
      },
      sentences: {
        title: 'Вчимо речення',
        description: 'Читаємо прості речення по складах, від легких до складних'
      }
    },
    menu: {
      title: 'Вчимо склади!',
      orderCV: 'Приголосна + Голосна',
      orderVC: 'Голосна + Приголосна',
      orderMixed: 'Упереміш',
      consonants: 'Приголосні:',
      vowels: 'Голосні:',
      all: 'Усі',
      clear: 'Скинути',
      selected: 'Вибрано: {n}',
      nothingSelected: 'Нічого не вибрано — будуть усі літери',
      softSign: 'Склади з м’яким знаком (Ь)',
      softSignHint: '«Ь» ставиться тільки після приголосної — наприклад НЬ, ТЬ, СЬ',
      softSignOrderHint: '(працює в порядку «Приголосна + Голосна»)',
      startRandom: 'Випадкові склади',
      game3d: '3D Гра',
      spaceKey: 'Пробіл',
      spaceHint: 'Натискай {key} для наступного складу',
      home: 'На головну'
    },
    display: {
      toggleCase: 'Перемкнути регістр',
      soundOn: 'Увімкнути звук',
      soundOff: 'Вимкнути звук',
      hintsShow: 'Показати підказки',
      hintsHide: 'Сховати підказки',
      changeBg: 'Змінити фон',
      menu: 'Меню',
      nextHint: 'Натисни ПРОБІЛ або екран для наступного складу'
    },
    words: {
      rangeTitle: 'Діапазон слів',
      rangePick: 'Вибрати діапазон слів',
      count: '{n} слів із {total}',
      allWords: 'Усі {total}',
      rangeFrom: 'Початок діапазону',
      rangeTo: 'Кінець діапазону',
      cancel: 'Скасувати',
      apply: 'Застосувати',
      prev: 'Попереднє слово',
      next: 'Наступне слово'
    },
    sentences: {
      levelTitle: 'Рівень складності',
      levelPick: 'Вибрати рівень',
      levelShort: 'Рів. {n}',
      allShort: 'Усі',
      allLevels: 'Усі рівні',
      allLevelsHint: 'Усі речення поспіль',
      close: 'Закрити',
      prev: 'Попереднє',
      next: 'Наступне'
    },
    common: {
      toMenu: 'У меню',
      shuffleOn: 'Упереміш (натисни — по порядку)',
      shuffleOff: 'По порядку (натисни — упереміш)',
      dashesHide: 'Сховати дефіси',
      dashesShow: 'Показати дефіси',
      trackOn: 'Вимкнути повзунок',
      trackOff: 'Увімкнути повзунок — вести пальчиком по літерах',
      trackHint: 'Веди пальчиком по літерах — літера підсвітиться',
      navHint: 'ПРОБІЛ або екран — далі · ← → гортати'
    },
    game: {
      speed: 'Швидкість',
      score: 'Очки',
      correct: 'Правильних',
      menu: 'Меню',
      gameOver: 'ГРУ ЗАКІНЧЕНО!',
      correctAnswers: 'Правильних відповідей',
      of: 'із',
      accuracy: 'Точність',
      backToMenu: 'Повернутися в меню',
      instructions: '← або → для відповіді | ↑ повторити'
    }
  }
};

/**
 * Все надписи для языка (с откатом на язык по умолчанию).
 * @param {string} lang
 */
export const getUI = (lang) => UI[lang] || UI[DEFAULT_LANGUAGE];

/**
 * Подставляет значения в плейсхолдеры: fill('Выбрано: {n}', { n: 3 }).
 * @param {string} template
 * @param {Object} values
 * @returns {string}
 */
export const fill = (template, values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
