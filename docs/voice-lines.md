# Lines to record

Only the game's own reactions — country and capital names are not here.
**21 phrases per language, 63 files in total.** A partial set is fine: anything
missing keeps using the device's speech synthesis.

## File naming

`<language>/<key>.m4a` — for example `ru/praise-01.m4a`, `pl/miss-03.m4a`,
`en/end-3stars.m4a`. Language folders: `ru`, `pl`, `en`. MP3 works too.

Mono, trimmed so playback starts immediately, normalised to about -16 LUFS.

## The voice

One narrator: a warm, friendly young woman, the way a kind teacher or an older
sister sounds. Unhurried — a five-year-old needs the beat between words.
Delighted, not amazed; never sarcastic, never disappointed. A wrong answer is a
normal thing that happens, not a small tragedy.

---

## Praise — plays the instant the answer is right

Six variants so the same word never repeats twice in a row. **Vary the delivery
noticeably between them** — that is the whole reason there are six.

| key | Russian | Polish | English | delivery |
|---|---|---|---|---|
| `praise-01` | Ура! | Hurra! | Hooray! | Bright and quick, a burst of joy, rising pitch |
| `praise-02` | Молодец! | Brawo! | Well done! | Warm and approving, lower than praise-01 |
| `praise-03` | Отлично! | Świetnie! | Excellent! | Crisp and confident — a nod, not a cheer |
| `praise-04` | Здорово! | Super! | Great one! | Relaxed, smiling, as if to a friend |
| `praise-05` | Точно! | Zgadza się! | That's it! | Quiet certainty, almost matter-of-fact |
| `praise-06` | Так держать! | Tak trzymaj! | Keep it up! | Encouraging, with momentum |

## Consolation — plays on a wrong answer

The most important set. It must take the sting out completely.

| key | Russian | Polish | English | delivery |
|---|---|---|---|---|
| `miss-01` | Ничего страшного! | Nic się nie stało! | No worries! | Gentle, falling pitch, the mistake already forgotten |
| `miss-02` | Почти! | Prawie! | So close! | Light, a little playful, never mocking |
| `miss-03` | В следующий раз получится! | Następnym razem się uda! | You'll get it next time! | Confident on the child's behalf |
| `miss-04` | Смотри, вот она! | Popatrz, tutaj jest! | Look, here it is! | Curious and inviting — the map is about to show it |
| `miss-05` | Бывает! | Zdarza się! | It happens! | Casual, shrugging, very short |

## Round start

| key | Russian | Polish | English | delivery |
|---|---|---|---|---|
| `start-01` | Поехали! | Ruszamy! | Off we go! | Inviting, slight rise at the end |
| `start-02` | Начинаем путешествие! | Zaczynamy podróż! | Let's start the journey! | Storytelling opener, a shade slower |

## Round finished — plays over the stars

| key | Russian | Polish | English | delivery |
|---|---|---|---|---|
| `end-3stars` | Вот это да! Все звёздочки твои! | O rany! Wszystkie gwiazdki twoje! | Wow! All the stars are yours! | The biggest moment in the game. Big, but not shrill |
| `end-2stars` | Здорово получилось! | Świetnie ci poszło! | That went really well! | Pleased and sincere, no hint of "but" |
| `end-1star` | Молодец, что дошёл до конца! | Brawo, że dotarłeś do końca! | Well done for finishing! | Proud of the effort itself — not a consolation prize |

## Prompts

| key | Russian | Polish | English | delivery |
|---|---|---|---|---|
| `who-plays` | Кто играет? | Kto gra? | Who is playing? | Friendly question, spoken to the room |
| `where-is-it` | Где это на карте? | Gdzie to jest na mapie? | Where is it on the map? | Curious, inviting a search |
| `which-capital` | Какая тут столица? | Jaka jest tu stolica? | What is its capital? | Same, a shade more thoughtful |
| `whose-flag` | Чей это флаг? | Czyja to flaga? | Whose flag is this? | Playful, like a riddle |
| `find-flag` | Найди нужный флаг! | Znajdź właściwą flagę! | Find the right flag! | An instruction to a small child: clear, unhurried, kind |

---

Drop the files into `src/assets/voice/<lang>/` and they are picked up on the
next build. Nothing else to change.
