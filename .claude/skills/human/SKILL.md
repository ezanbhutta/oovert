---
name: human
description: >
  Write and edit like a human, not an AI. The anti-AI-tell checklist for ALL
  copy on oovert.com — headlines, ledes, body, FAQs, meta descriptions, OG
  text, alt text, schema strings, commit/PR prose. Load this before writing or
  editing any words a visitor (or a crawler) will read. Invoke with "/human",
  or apply automatically whenever the task involves writing or rewriting copy.
  Adapted from Wikipedia:Signs of AI writing for a branding-studio marketing voice.
user-invocable: true
argument-hint: "[text or file to de-AI, optional]"
metadata:
  source: "https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing"
  version: "1.0.0"
---

# Human — don't write like an AI

The tell isn't one word. It's the accumulation: generic significance, hedged
authority, tidy triads, participle tails, em-dashes, and copula-dodging verbs.
Kill the pattern, not just the word. Below is what to hunt and what to do instead.

**One-line rule:** say the specific, earned thing in the plainest words that
carry the voice — then read it aloud. If it sounds like a press release or a
brochure wrote itself, rewrite it.

---

## 0. This is a marketing site, not Wikipedia — the nuance

The source guide is for neutral encyclopedic writing. oovert.com has a
deliberate, sharp voice ("Camouflage is for prey."). So:

- **A bold, opinionated, concrete voice is wanted.** Short declaratives, real
  claims, dry wit. That is *not* an AI tell — keep it.
- **Generic promotional filler is the enemy.** "World-class", "cutting-edge",
  "vibrant tapestry", "commitment to excellence" — hype that any brand could
  paste. That *is* the tell. Concrete beats superlative every time.
- Test: could a competitor copy-paste this sentence onto their site unchanged?
  If yes, it's filler — make it specific to us or cut it.

---

## 1. Banned & flag-hard words (the "AI vocabulary")

Delete on sight, or earn them with something concrete. Never cluster several.

`delve` · `boasts` · `bolster` · `underscore` · `testament` · `tapestry` ·
`vibrant` · `intricate` · `interplay` · `meticulous` · `pivotal` · `crucial` ·
`vital` · `enduring` · `garner` · `landscape` (figurative) · `realm` ·
`nestled` · `in the heart of` · `groundbreaking` · `renowned` · `world-class` ·
`cutting-edge` · `state-of-the-art` · `seamless` · `robust` · `leverage` (verb) ·
`elevate` · `unlock` · `empower` · `foster` · `curated` · `bespoke` (as filler) ·
`showcasing` · `exemplifies` · `resonate` · `align with` · `enhance` ·
`navigate` (figurative) · `ever-evolving` · `fast-paced` · `dynamic` ·
`holistic` · `synergy` · `game-changer` · `next-level` · `best-in-class`.

House bans already in force on this repo: **no "world-class"**, **no em-dashes**
(see §5). Don't reintroduce them.

## 2. "Undue significance" — the fake-importance sentence

The AI reflex is to tell the reader something *matters* instead of saying what
it *is*. Cut these openings/closers:

- "stands as / serves as a testament to…"
- "plays a crucial / pivotal / vital role in…"
- "marks a pivotal moment in the evolution of…"
- "underscores the importance of…"
- "reflects a broader shift toward…"
- "at the intersection of…", "in today's ever-changing landscape…"

**Do instead:** state the fact. "We named 40 companies" beats "has played a
pivotal role in the naming landscape."

## 3. Copula-dodging — stop avoiding "is / has"

AI won't say a plain "is". It reaches for a verb with a suit on.

- ❌ "serves as / functions as / represents / stands as" → ✅ **is**
- ❌ "boasts / features / offers / maintains / houses" → ✅ **has**

"The studio *is* six people" — not "The studio *boasts a* roster of six."

## 4. Structural tells

- **Negative parallelism.** "Not just X, but Y." "It's not A, it's B." "X, not
  Y." One, used with intent, can land. Three in a page is a signature. Prefer a
  plain positive claim.
- **Rule of three.** Mechanical triads — three adjectives, three clauses, three
  bullet items — everywhere. Vary list lengths. Two is fine. Four is fine.
  Break the metronome.
- **Participle tails ("-ing" endings).** Sentences that trail off into vague
  analysis: "…, cultivating deeper connections", "…, ensuring lasting impact",
  "…, highlighting our commitment." Delete the tail or make it a real clause
  with a subject.
- **Elegant variation.** Forcing synonyms to avoid repeating a word
  ("constraints… norms… impositions" for the same thing). Repeat the plain word
  if it's clearer.
- **Formulaic conclusions.** "Despite its challenges…", "Looking ahead…",
  "In conclusion…", a tidy "Challenges and Future Outlook" wrap-up. End on a
  concrete beat instead (this site uses a short declarative close — keep that).
- **Sameness of rhythm.** If every sentence is the same medium length, break it.
  Humans mix a four-word sentence against a long one.

## 5. Punctuation & typography

- **Em-dashes: banned on this site.** Use a period, a comma, or restructure.
  (This has been swept out of the repo more than once — do not bring it back.)
- **Straight quotes / apostrophes** in source and copy, not curly, unless a
  file already standardizes on one. Match the file.
- **No emoji as structure** in site copy or committed prose.
- **Headings: sentence case**, not Title Case ("Brand identity, answered." not
  "Brand Identity, Answered"). Match existing headings.
- No decorative horizontal rules before headings.

## 6. Vague authority / weasel attribution

Don't hedge behind nobody. Cut:
"Industry reports suggest…", "Experts argue…", "Studies show…", "It is widely
regarded…", "Observers have noted…", "Some say…".

**Do instead:** name the source, or make it a plain first-person claim we can
stand behind. If we can't source it and won't own it, delete it.

## 7. Filler openers & hedges

Strike: "It's important to note that", "It's worth mentioning", "Needless to
say", "In the world of", "When it comes to", "At the end of the day", "That
said,". They add words, not meaning. Start with the noun.

---

## Pre-ship checklist (run before committing any copy)

1. **Read it aloud.** Anything that sounds like a brochure → rewrite.
2. **Ctrl-F the §1 banned list** and `—` (em-dash). Zero hits.
3. **Copula check:** every "serves as / boasts / stands as" → "is / has".
4. **Triad check:** no mechanical rule-of-three within a section.
5. **Participle-tail check:** no "…, verb-ing …" trailing vague clauses.
6. **Negative-parallelism check:** at most one "not X but Y" per page.
7. **Weasel check:** every claim is sourced or owned; no "experts say".
8. **Competitor test:** no sentence a rival could paste onto their own site.
9. **Concreteness:** superlatives replaced by specifics (numbers, nouns, facts).
10. **Voice:** it still sounds like OOVERT — sharp, plain, a little dry.

## When invoked as `/human [text or file]`

If given text or a file: rewrite it to pass the checklist, preserving meaning
and the OOVERT voice, and show a short before/after list of what changed and
why. If given nothing: apply this checklist to whatever copy is currently being
written or edited this turn.

---

*Basis: adapted from [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).
That guide targets neutral encyclopedic prose; here it's tuned for a marketing
voice — the difference is that a strong, specific, opinionated line is welcome,
while generic hype and the structural tells above are not.*
