"""SPEC-20 — who actually reviewed an item.

`reviewer` names a human or is empty. A tool's run goes in `automatedReview`
as `<tool>:<YYYY-MM-DD>`. These rules used to live in three gates; they are
here so the gates agree and so each stays under the 500-line limit.

The rule is "fail on a lie, never on an honest empty": an empty reviewer with
no automated review is a true statement about this pack, counted and reported,
not an error.
"""
import re

DATE_UNKNOWN = "date-not-recorded-at-review-time"

TOOL_IN_REVIEWER = re.compile(r"redeye|lane|script|automation|\bci\b", re.IGNORECASE)
# An empty reviewDate with a named reviewer passes only against the explicit
# token below; a real date is required everywhere else. A provenance JSON
# record cannot hold an automatedReview of DATE_UNKNOWN (see AUTOMATED_REVIEW).
AUTOMATED_REVIEW = re.compile(
    r"^[a-z][a-z0-9-]*:(?:\d{4}-\d{2}-\d{2}|date-not-recorded)$")


def review_record_errors(label: str, prov: dict, date_marker: str = "") -> list[str]:
    """REQ-RV-01..03 for one provenance-shaped record.

    `label` prefixes every message (the lint gate passes "Q<n>", the remap
    gate a row number). `date_marker` is the field that, when it holds
    DATE_UNKNOWN, stands in for a reviewDate the author of the record never
    had (the NCA remap's automatedReview column). Records that carry a real
    reviewDate field ignore it — a tool may not vouch for a human's date.
    """
    errors: list[str] = []
    reviewer = str(prov.get("reviewer", "")).strip()
    automated = str(prov.get("automatedReview", "")).strip()
    review_date = str(prov.get("reviewDate", "")).strip()
    status = str(prov.get("status", "")).strip().lower()

    if reviewer and TOOL_IN_REVIEWER.search(reviewer):
        errors.append(
            f"{label}: reviewer {reviewer!r} names a tool — `reviewer` is a person "
            f"or empty; a tool run belongs in automatedReview (SPEC-20 REQ-RV-01)")
    if automated and not AUTOMATED_REVIEW.match(automated):
        errors.append(
            f"{label}: automatedReview {automated!r} is not '<tool>:<YYYY-MM-DD>' "
            f"(SPEC-20 REQ-RV-02)")
    if reviewer and not review_date:
        # A provenance record carries a reviewDate key; a remap row does not
        # and passes "reviewDateField": None to say so.
        excused = (prov.get("reviewDateField", True) is None and date_marker
                   and str(prov.get(date_marker, "")).strip() == DATE_UNKNOWN)
        if not excused:
            errors.append(
                f"{label}: reviewer {reviewer!r} with an empty reviewDate — a named "
                f"review needs a date, or an explicit no-date note (SPEC-20 REQ-RV-03)")
    if review_date and not reviewer:
        # REQ-RV-05: the mirror of the rule above. A date with no person is a
        # review nobody can be asked about — it reads as "someone checked this
        # on that day" when nothing did. Records that carry an automatedReview
        # date it through that field instead, which says the same thing truly.
        errors.append(
            f"{label}: reviewDate {review_date!r} with no reviewer — a date claims a "
            f"person checked this; a tool's run is dated in automatedReview "
            f"(SPEC-20 REQ-RV-05)")
    if status == "reviewed" and not reviewer:
        errors.append(
            f"{label}: status 'reviewed' with no reviewer (SPEC-20 REQ-RV-03)")
    return errors


VALID_STATUSES = ("draft", "reviewed", "released")


def check_provenance(record, item_id):
    """The RedEye lane's provenance check. None if complete, else the detail.

    REQ-RV-03: an empty reviewer is honest, so it is not a completeness
    failure — but `reviewer` itself must exist as a key, and a record that
    claims a review it cannot back fails here.
    """
    if record is None:
        return "missing provenance record"
    if record.get("itemId") and record["itemId"] != item_id:
        return f"provenance itemId mismatch: record says {record['itemId']!r}"
    required = ("itemId", "examId", "objectiveId", "author", "assistance",
                "rightsBasis", "originalityCheck")
    missing = [f for f in required if not str(record.get(f, "")).strip()]
    if "reviewer" not in record:
        missing.append("reviewer")
    if missing:
        return f"incomplete provenance: empty fields {', '.join(missing)}"
    if record.get("status") not in VALID_STATUSES:
        return f"invalid provenance status: {record.get('status')!r}"
    errors = review_record_errors(item_id, record)
    return errors[0] if errors else None


def review_state(record) -> str:
    """'none' | 'automated' | 'human' — what is true about this record."""
    if record is None:
        return "none"
    if str(record.get("reviewer", "")).strip():
        return "human"
    if str(record.get("automatedReview", "")).strip():
        return "automated"
    return "none"
