import type { Lang } from '../data'

/** Every string the interface shows, in the three languages the game supports. */
const STRINGS = {
  appName: { ru: 'Путешествие по миру', pl: 'Podróż po świecie', en: 'Journey around the World' },
  whoPlays: { ru: 'Кто играет?', pl: 'Kto gra?', en: 'Who is playing?' },
  addPlayer: { ru: 'Новый игрок', pl: 'Nowy gracz', en: 'New player' },
  yourName: { ru: 'Как тебя зовут?', pl: 'Jak masz na imię?', en: 'What is your name?' },
  levelLittle: { ru: 'Малыш', pl: 'Maluch', en: 'Little one' },
  levelExpert: { ru: 'Знаток', pl: 'Znawca', en: 'Expert' },
  levelLittleHint: { ru: 'Два ответа, всё вслух', pl: 'Dwie odpowiedzi, wszystko na głos', en: 'Two answers, everything read aloud' },
  levelExpertHint: { ru: 'Четыре ответа, столицы, счёт', pl: 'Cztery odpowiedzi, stolice, punkty', en: 'Four answers, capitals, score' },
  play: { ru: 'Играть', pl: 'Graj', en: 'Play' },
  start: { ru: 'Начать', pl: 'Zaczynamy', en: 'Start' },
  again: { ru: 'Ещё раз', pl: 'Jeszcze raz', en: 'Again' },
  home: { ru: 'В начало', pl: 'Do początku', en: 'Home' },
  next: { ru: 'Дальше', pl: 'Dalej', en: 'Next' },
  modeFlag: { ru: 'Флаги', pl: 'Flagi', en: 'Flags' },
  modeLocate: { ru: 'Найди на карте', pl: 'Znajdź na mapie', en: 'Find on the map' },
  modeCapital: { ru: 'Столицы', pl: 'Stolice', en: 'Capitals' },
  modeFlagHint: { ru: 'Чей это флаг?', pl: 'Czyja to flaga?', en: 'Whose flag is this?' },
  modeFlagHintLittle: { ru: 'Найди нужный флаг', pl: 'Znajdź właściwą flagę', en: 'Find the right flag' },
  modeLocateHint: { ru: 'Покажи страну на карте', pl: 'Pokaż kraj na mapie', en: 'Point to the country' },
  modeCapitalHint: { ru: 'Столица по флагу', pl: 'Stolica po fladze', en: 'The capital from the flag' },
  askFlag: { ru: 'Чей это флаг?', pl: 'Czyja to flaga?', en: 'Whose flag is this?' },
  // Phrased as a standalone question under the country name, so no language
  // needs the country declined - "Stolica kraju Niemcy?" was simply wrong.
  askLocate: { ru: 'Где это на карте?', pl: 'Gdzie to jest na mapie?', en: 'Where is it on the map?' },
  askCapital: { ru: 'Какая тут столица?', pl: 'Jaka jest tu stolica?', en: 'What is its capital?' },
  rightAnswer: { ru: 'Верно!', pl: 'Dobrze!', en: 'Correct!' },
  thisIsIt: { ru: 'Вот она', pl: 'To tutaj', en: 'Here it is' },
  listen: { ru: 'Послушать', pl: 'Posłuchaj', en: 'Listen' },
  roundDone: { ru: 'Раунд пройден', pl: 'Runda skończona', en: 'Round complete' },
  scoreOf: { ru: 'из', pl: 'z', en: 'of' },
  newBest: { ru: 'Новый рекорд!', pl: 'Nowy rekord!', en: 'New best!' },
  learned: { ru: 'Выучено стран', pl: 'Poznane kraje', en: 'Countries learned' },
  langUi: { ru: 'Язык игры', pl: 'Język gry', en: 'Game language' },
  langContent: { ru: 'Учим названия на', pl: 'Uczymy się nazw po', en: 'Learning names in' },
  back: { ru: 'Назад', pl: 'Wróć', en: 'Back' },
  modeAnimals: { ru: 'Животные', pl: 'Zwierzęta', en: 'Animals' },
  modeAnimalsHint: { ru: 'Кто здесь живёт?', pl: 'Kto tu mieszka?', en: 'Who lives here?' },
  zoo: { ru: 'Зоопарк', pl: 'Zoo', en: 'Zoo' },
  album: { ru: 'Альбом', pl: 'Album', en: 'Album' },
  zooHint: { ru: 'Смотри, кто где живёт', pl: 'Zobacz, kto gdzie mieszka', en: 'See who lives where' },
  tapCountry: { ru: 'Нажми на страну', pl: 'Dotknij kraju', en: 'Tap a country' },
  whereLives: { ru: 'Где он живёт?', pl: 'Gdzie on mieszka?', en: 'Where does it live?' },
  whoLivesHere: { ru: 'Кто здесь живёт?', pl: 'Kto tu mieszka?', en: 'Who lives here?' },
  livesIn: { ru: 'живёт здесь', pl: 'mieszka tutaj', en: 'lives here' },
  whereTo: { ru: 'Куда поедем?', pl: 'Dokąd jedziemy?', en: 'Where to?' },
  changePlace: { ru: 'Другая часть света', pl: 'Inna część świata', en: 'Somewhere else' },
  capitalIs: { ru: 'Столица', pl: 'Stolica', en: 'Capital' },
  pickFace: { ru: 'Выбери себя', pl: 'Wybierz siebie', en: 'Pick your face' },
  soundFull: { ru: 'Звук и голос', pl: 'Dźwięk i głos', en: 'Sound and voice' },
  soundEffects: { ru: 'Только звуки', pl: 'Tylko dźwięki', en: 'Sounds only' },
  soundOff: { ru: 'Тишина', pl: 'Cisza', en: 'Silent' },
} as const

export type UiKey = keyof typeof STRINGS

export const t = (key: UiKey, lang: Lang): string => STRINGS[key][lang]

/** Spoken after a correct answer, picked at random so it does not get stale. */
const PRAISE: Record<Lang, string[]> = {
  ru: ['Ура!', 'Молодец!', 'Отлично!', 'Здорово!', 'Точно!', 'Так держать!'],
  pl: ['Hurra!', 'Brawo!', 'Świetnie!', 'Super!', 'Zgadza się!', 'Tak trzymaj!'],
  en: ['Hooray!', 'Well done!', 'Great!', 'Nice one!', "That's it!", 'Keep going!'],
}

/**
 * Deterministic on `seed` so the same answer always yields the same word: a
 * re-render must not swap the praise on screen mid-celebration. Pass the
 * question index.
 */
export const praise = (lang: Lang, seed: number): string => {
  const list = PRAISE[lang]
  return list[Math.abs(Math.floor(seed)) % list.length]
}

/** Spoken after a wrong answer. Never scolding: the mistake is already over. */
const CONSOLE_LINES: Record<Lang, string[]> = {
  ru: ['Ничего страшного!', 'Почти!', 'В следующий раз получится!', 'Смотри, вот она!', 'Бывает!'],
  pl: ['Nic się nie stało!', 'Prawie!', 'Następnym razem się uda!', 'Popatrz, tutaj jest!', 'Zdarza się!'],
  en: ["No worries!", 'So close!', "You'll get it next time!", 'Look, here it is!', 'It happens!'],
}

export const consolation = (lang: Lang, seed: number): string => {
  const list = CONSOLE_LINES[lang]
  return list[Math.abs(Math.floor(seed)) % list.length]
}

/** File keys for the recorded versions, in the same order as the phrase lists. */
export const praiseKey = (seed: number) => `praise-0${(Math.abs(Math.floor(seed)) % 6) + 1}`
export const consolationKey = (seed: number) => `miss-0${(Math.abs(Math.floor(seed)) % 5) + 1}`

export const LANG_NAMES: Record<Lang, string> = {
  ru: 'Русский',
  pl: 'Polski',
  en: 'English',
}
