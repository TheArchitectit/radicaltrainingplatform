# Sprints 37-38: Multi-Format Content

**Phase:** Enterprise  
**Duration:** Weeks 73-76 (4 weeks)  
**Goal:** Add video lectures, flashcard decks, and markdown study notes to supplement quiz content.

---

## Summary

Expand beyond quiz questions into a full learning platform with multiple content formats.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S37-01 | Design content format abstraction | 2 |
| S37-02 | Implement video lecture player (embedded/local) | 4 |
| S37-03 | Implement flashcard deck model and UI | 4 |
| S37-04 | Add markdown study notes with rendering | 3 |
| S37-05 | Add content linking (video <-> questions, notes <-> blueprint) | 3 |
| S37-06 | Add progress tracking per content type | 2 |
| S37-07 | Add content search across all formats | 3 |

**Total:** ~21 points over 2 sprints

## Key Decisions

- **Video player:** Embed via native platform players; support YouTube/Vimeo embeds; offline download deferred
- **Flashcards:** Flip animation; spaced repetition integration (reuse SM-2 from S17)
- **Study notes:** Markdown rendering with syntax highlighting; linked to blueprint objectives
- **Storage:** Videos streamed from CDN; flashcards and notes in SQLite alongside progress data

## Dependencies

- S9-03 (SQLite persistence for new content types)
- S17-01 (SM-2 scheduler reusable for flashcards)

## Risks

| Risk | Mitigation |
|---|---|
| Video licensing and hosting costs | Start with free/owned content; partner for licensed content |
| Flashcard UX requires significant UI polish | Prototype early; user testing |
| Content volume overwhelms architecture | Lazy loading; pagination; caching |
