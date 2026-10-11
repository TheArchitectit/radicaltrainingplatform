# RTP Question Bank Expansion - Validation Report
Date: 2026-10-10 | Author: Instinct task agent (AI authoring + AI review with cited sources)

## Honesty label
Validation here means "AI review with cited sources": every item was authored against the official published exam-objective documents and vendor documentation, then machine-checked. This is NOT RedEye-certified (RedEye human review is future work) and NOT endorsed by CompTIA or Nutanix.

## Deliverables
| Exam | File(s) | Items | Planned 3x | Demo-cut flagged |
|---|---|---|---|---|
| CompTIA A+ Core 1 (220-1201) | content/exams/COMPTIA-A-1201/questions/core1-part1..3.md | 180 | 120 planned -> ~360 total bank | 16 |
| CompTIA A+ Core 2 (220-1202) | content/exams/COMPTIA-A-1202/questions/core2-part1..3.md | 180 | 100 planned -> included above | 8 |
| CompTIA Network+ (N10-009) | content/exams/COMPTIA-NET-009/questions/net009-part1..5.md | 300 | 100 planned -> ~300 | 25 |
| Nutanix NCA 7.5 | content/exams/NUTANIX-NCA-75/questions/nca75-new-part1..2.md | 120 | 40 planned -> ~120 | 0 |
| **Total** | **13 files** | **780** | | **49** |

## Sources (fetched live 2026-10-10)
- CompTIA A+ 220-1201 Exam Objectives v3.0 (source id OBJ1201)
- CompTIA A+ 220-1202 Exam Objectives v3.0 (source id OBJ1202)
- CompTIA Network+ N10-009 Exam Objectives v4.0 (source id OBJN9)
- Nutanix NCA 7.5 Exam Blueprint Guide, June 2026 (source id NCAEBG)
Plain-text copies retained in report/ (aplus1201.txt, aplus1202.txt, net009.txt, nca_ebg.txt).

## Validation method
1. **Objective mapping**: every item carries a metadata comment {"id","objective","type","source","locator","verified"} tying it to a numbered objective in the official document (e.g. "objective":"2.3", "locator":"Objective 2.3 wireless channels"). Per-item records exported to report/provenance/<EXAM>-provenance.json.
2. **Format/style match**: items follow the repo bank format parsed by scripts/lint-content.py and QuestionParser.cs: `## DOMAIN` headers, `### Q<n>`, `- A)` options, `**Answer: X**` / `**Correct Answer: X, Y**`, explanation, `---` separators. Scenario-first stems mirror the exams' performance-based style; multi-select items say "(Choose two.)".
3. **Answer-key integrity**: each file passed a snapshot/rotate/verify cycle (scripts/keysnap.py) proving the keyed option text is unchanged after answer-position rebalancing. An early rotation-direction bug was caught by content-vs-key verification and repaired; all 13 files pass (12 via keysnap verify, 1 via direct content-vs-key spot check after its baseline aged out of /tmp).
4. **Machine lint**: repo scripts/lint-content.py run against all 13 files: "OK: 13 files checked, 780 questions validated" (Q=A counts, key format, structure).
5. **Key-position balance** (first-letter distribution, after rebalancing): A+1201 A47/B45/C44/D43; A+1202 A55/B40/C40/D39; Net+ A89/B71/C70/D70; NCA A35/B29/C28/D28.
6. **Originality**: all items authored new for this task. No exam-dump, brain-dump, or actual-question sources were consulted or mirrored; items teach the published objectives, not recalled exam content.
7. **Objective coverage** (item counts per objective, tagged): see report/stats.json. Summary:
   - A+ 1201: covers all objectives 1.1-5.6 (22 objectives, 4-11 items each)
   - A+ 1202: covers 1.1-4.10 (31 objectives, 2-20 items each)
   - Net+ N10-009: covers 1.1-5.5 (22 objectives, 3-32 items each)
   - NCA 7.5: covers 1.1-4.4 (16 objectives, 5-13 items each)

## Demo-cut candidates (for the Oct 23 demo)
49 items flagged with "demoCandidate":true in their metadata, all diagnosis/scenario type:
- A+ 24: 16 from Core 1 (networking + hardware/network troubleshooting objectives), 8 from Core 2 (security + operational procedures)
- Network+ 25: 5 per exam domain
IDs listed in report/demo-cut.txt.

## Known limitations
- Validation is AI review, not human expert review; a RedEye pass is still recommended before external use.
- Item difficulty is uncalibrated (no pilot statistics).
- NCA bank supplements (does not replace) the existing NCA-75-Part1.md bank; new IDs use Q101-Q220 to avoid collisions.
