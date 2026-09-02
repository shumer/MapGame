# Voice script

Recording brief for the spoken lines in "Путешествие по Европе", a geography
game for two children: a five-year-old who cannot read and an eleven-year-old
who can. The younger one relies on the voice completely — for her the audio is
the interface, not decoration.

## The character

One narrator throughout: a warm, friendly young woman, the way a kind teacher
or an older sister sounds. Not a cartoon squeak, not a corporate announcer, not
a TV host. She is genuinely pleased when the child gets it right and genuinely
unbothered when they do not.

- **Age impression:** 25-35.
- **Pace:** unhurried. A five-year-old needs the beat between words.
- **Warmth over energy.** Excitement is fine; hysteria is not. She is delighted,
  not amazed.
- **Never sarcastic, never disappointed, never patronising.** A wrong answer is
  a normal thing that happens, not a small tragedy.

## Files

Deliver one file per line per language. Naming: `<language>/<key>.m4a`
(or `.mp3`), e.g. `ru/praise-01.m4a`, `pl/miss-02.m4a`.

Mono, normalised to about -16 LUFS, trimmed so playback starts immediately —
leading silence is noticeable when a line answers a tap.

---

## 1. Praise — a correct answer

Played the instant the child is right, before the country is named. Short,
because confetti and a chime are playing at the same time.

| key | Russian | Polish | English | direction |
|---|---|---|---|---|
| `praise-01` | Ура! | Hurra! | Hooray! | Bright and quick, a small burst of joy. Rising pitch. |
| `praise-02` | Молодец! | Brawo! | Well done! | Warm, approving, slightly lower than praise-01. |
| `praise-03` | Отлично! | Świetnie! | Excellent! | Crisp and confident. A nod, not a cheer. |
| `praise-04` | Здорово! | Super! | Great one! | Relaxed, smiling, as if to a friend. |
| `praise-05` | Точно! | Zgadza się! | That's it! | Quiet certainty. Almost matter-of-fact, with a smile. |
| `praise-06` | Так держать! | Tak trzymaj! | Keep it up! | Encouraging, a touch of momentum. Slight emphasis on the second word. |

Six variants so the child does not hear the same word twice in a row. Vary the
delivery between them noticeably — that is the whole reason there are six.

## 2. Consolation — a wrong answer

Played as the wrong button turns red, before the right answer appears. This is
the most important set to get right: it must remove any sting.

| key | Russian | Polish | English | direction |
|---|---|---|---|---|
| `miss-01` | Ничего страшного! | Nic się nie stało! | No worries! | Gentle, immediate, dismissive of the mistake. Falling pitch, soft. |
| `miss-02` | Почти! | Prawie! | So close! | Light, a little playful. Not mocking. |
| `miss-03` | В следующий раз получится! | Następnym razem się uda! | You'll get it next time! | Confident on the child's behalf. Warm, unhurried. |
| `miss-04` | Смотри, вот она! | Popatrz, tutaj jest! | Look, here it is! | Curious and inviting — it hands over to the map showing the answer. |
| `miss-05` | Бывает! | Zdarza się! | It happens! | Casual, shrugging, friendly. Very short. |

Never emphasise the negative. `miss-01` in particular should sound like the
mistake is already forgotten.

## 3. Round start

| key | Russian | Polish | English | direction |
|---|---|---|---|---|
| `start-01` | Поехали! | Ruszamy! | Off we go! | Inviting, a beginning. Slight rise at the end. |
| `start-02` | Начинаем путешествие! | Zaczynamy podróż! | Let's start the journey! | Storytelling opener, a shade slower. |

## 4. Round finished

Played over the star animation. Star count is in the file name.

| key | Russian | Polish | English | direction |
|---|---|---|---|---|
| `end-3stars` | Вот это да! Все звёздочки твои! | O rany! Wszystkie gwiazdki twoje! | Wow! All the stars are yours! | Genuine delight. The biggest moment in the game — let it be big, but not shrill. |
| `end-2stars` | Здорово получилось! | Świetnie ci poszło! | That went really well! | Pleased and sincere. No hint of "but". |
| `end-1star` | Молодец, что дошёл до конца! | Brawo, że dotarłeś do końca! | Well done for finishing! | Warm, proud of the effort itself. This plays after a weak round — it must not sound like a consolation prize. |

For Polish and Russian, `end-1star` is addressed to a boy by default; if a
feminine variant is easy to record, add `end-1star-f` (`дошла`, `dotarłaś`).

## 5. Prompts

| key | Russian | Polish | English | direction |
|---|---|---|---|---|
| `who-plays` | Кто играет? | Kto gra? | Who is playing? | Friendly question, spoken to the room. Start screen. |
| `where-is-it` | Где это на карте? | Gdzie to jest na mapie? | Where is it on the map? | Curious, inviting a search. Slight rise. |
| `which-capital` | Какая тут столица? | Jaka jest tu stolica? | What is its capital? | Same, a shade more thoughtful. |
| `whose-flag` | Чей это флаг? | Czyja to flaga? | Whose flag is this? | Playful, like a riddle. |
| `find-flag` | Найди нужный флаг! | Znajdź właściwą flagę! | Find the right flag! | An instruction to a small child: clear, unhurried, kind. |

---

## 6. Country and capital names

The largest set: 45 countries and 45 capitals in three languages. These are read
plainly — no drama, no rising question. They are the content, and clarity beats
character here. Leave a clear final consonant; children repeat what they hear.

Two notes that matter more than tone:

- **Polish names are exonyms and are easy to get wrong.** Niemcy (Germany),
  Włochy (Italy), Węgry (Hungary), Wilno (Vilnius), Lublana (Ljubljana),
  Kiszyniów (Chișinău), Bukareszt (Bucharest). Read them as a Pole would.
- **Russian stress:** Черного́рия, Ватика́н, Кишинёв, Люксембу́рг, Рейкья́вик,
  Валле́тта, Люблья́на.

The full list of names, per language, is in `src/data/countries.json` — the
`name` and `capital` fields. File keys: `country-<ISO>` and `capital-<ISO>`,
e.g. `ru/country-PL.m4a`, `pl/capital-FR.m4a`.

If the budget only stretches to part of this, record the 23 best-known countries
first — those with `"fame": 1` in the same file. They are what the younger child
plays with, and she cannot read the names at all.

---

## Delivery summary

| set | lines | × languages | files |
|---|---|---|---|
| praise | 6 | 3 | 18 |
| consolation | 5 | 3 | 15 |
| round start | 2 | 3 | 6 |
| round end | 3 | 3 | 9 |
| prompts | 5 | 3 | 15 |
| countries | 45 | 3 | 135 |
| capitals | 45 | 3 | 135 |
| **total** | | | **333** |

The first five sets — 63 files — are what change the feel of the game. The names
can follow later; the game falls back to the device's own speech synthesis for
anything that has no recording.
