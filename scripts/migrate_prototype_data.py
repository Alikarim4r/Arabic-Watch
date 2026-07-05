#!/usr/bin/env python3
"""Migrate prototype RAW dataset from quran_story_universe_10_10_final.html to seed_content.json."""

import json
import re
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "quran_story_universe_10_10_final.html"
OUT = ROOT / "src/data/seed_content.json"
CURRENT = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}

# Extract RAW array via regex + eval (trusted local file)
text = HTML.read_text(encoding="utf-8")
raw_match = re.search(r"const RAW=(\[.*?\]);", text, re.S)
eras_match = re.search(r"const ERAS=(\[.*?\]);", text, re.S)
surah_match = re.search(r"const SURAH=(\[.*?\]);", text, re.S)
RAW = eval(raw_match.group(1))
ERAS = eval(eras_match.group(1))
SURAH = eval(surah_match.group(1))

SURAH_ID = {name: i + 1 for i, name in enumerate(SURAH)}

# Preserve approved statuses from current seed where ids match
approved_events = {
    e["id"]: e
    for e in CURRENT.get("story_events", [])
    if e.get("review_status") == "approved"
}
approved_nodes = {
    n["id"]: n
    for n in CURRENT.get("story_nodes", [])
    if n.get("review_status") == "approved"
}

THEME_SLUG = {
    "الصبر": "sabr",
    "التوحيد": "tawhid",
    "التوبة": "tawbah",
    "الفتنة": "fitnah",
    "الابتلاء": "ibtilaa",
    "التمكين": "tamkeen",
    "النجاة": "najah",
    "الطغيان": "tughyan",
    "الملك": "mulk",
    "الشكر": "shukr",
    "الغلو": "ghulu",
    "العلم": "ilm",
    "الدعوة": "dawah",
    "العفة": "iffah",
    "الاقتصاد": "iqtisad",
    "الأخلاق": "akhlaq",
    "الأسرة": "usrah",
    "الشريعة": "sharia",
    "الهجرة": "hijrah",
    "المعجزة": "mu_jiza",
    "العذاب": "adhab",
    "البشارة": "bushra",
    "الحجة": "hujjah",
    "الإمامة": "imamah",
    "الميزان": "mizan",
    "القيادة": "qiyadah",
    "الوحي": "wahy",
    "الخلافة": "khilafah",
    "الخلق": "khalq",
    "الاستكبار": "istikbar",
    "الرحمة": "rahmah",
    "العفو": "afw",
    "الكرامة": "karamah",
    "التأويل": "tawil",
    "السعي": "sa_y",
    "البلاء": "bala",
    "الطهر": "taharah",
    "الرسالة": "risalah",
    "التثبيت": "tathbeet",
    "الأمة": "ummah",
    "الفتح": "fath",
    "العدل": "justice",
}


def theme_id(name: str) -> str:
    if name in THEME_SLUG:
        return THEME_SLUG[name]
    slug = re.sub(r"\s+", "_", name.strip())
    slug = hashlib.md5(name.encode()).hexdigest()[:8]
    return f"theme_{slug}"


def parse_ayah_ref(ref: str):
    """Parse refs like 'البقرة 2:30-37' or 'يوسف 12:90'."""
    ref = ref.strip()
    m = re.match(r"^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$", ref)
    if not m:
        return None
    sname, surah_num, a_from, a_to = m.group(1), int(m.group(2)), int(m.group(3)), m.group(4)
    sid = SURAH_ID.get(sname) or surah_num
    return {
        "surah_id": sid,
        "ayah_from": a_from,
        "ayah_to": int(a_to) if a_to else a_from,
        "ayah_key": f"{sid}:{a_from}" + (f"-{a_to}" if a_to else ""),
    }


def slug_place(name: str) -> str:
    return "place_" + hashlib.md5(name.encode()).hexdigest()[:10]


def slug_person(name: str) -> str:
    return "person_" + hashlib.md5(name.encode()).hexdigest()[:10]


themes = {}
story_nodes = {}
story_events = []
event_ayahs = []
node_links = []

# Meta themes from prototype THEMES line
all_theme_names = set()
for row in RAW:
    all_theme_names.update(row[7])
extra = [
    "التوحيد", "الصبر", "التوبة", "الفتنة", "الابتلاء", "التمكين", "النجاة", "الطغيان",
    "الملك", "الشكر", "الغلو", "العلم", "الدعوة", "العفة", "الاقتصاد", "الأخلاق", "الأسرة",
    "الشريعة", "الهجرة", "المعجزة", "العذاب", "البشارة", "الحجة", "الإمامة", "الميزان",
    "القيادة", "الوحي", "الخلافة", "الخلق", "الاستكبار", "الرحمة", "العفو",
]
all_theme_names.update(extra)

for tname in sorted(all_theme_names):
    tid = theme_id(tname)
    if tid not in themes:
        themes[tid] = {
            "id": tid,
            "name_ar": tname,
            "description_ar": f"محور قرآني: {tname}",
            "review_status": "pending",
        }
    if tid not in story_nodes:
        story_nodes[tid] = {
            "id": tid,
            "node_type": "theme",
            "name_ar": tname,
            "summary_ar": f"محور قرآني: {tname}",
            "review_status": "pending",
            "source_status": "pending",
        }

NETWORK_CONCLUSIONS = {
    "musa": "شبكة موسى تجمع بين الحفظ الإلهي، الإعداد النفسي، مواجهة الطغيان، وتربية الأمة — وفق ما ورد في القرآن.",
    "yusuf": "شبكة يوسف تكشف كيف يتحول الابتلاء إلى تمكين وعدل — دون تجاوز النص القرآني.",
    "ibrahim": "شبكة إبراهيم تنقل التوحيد من الحجة إلى مشروع أمة وبيت — يحتاج بعض الأحداث مراجعة مصدر.",
    "muhammad": "شبكة محمد ﷺ تمثل اكتمال الرسالة وبناء الأمة — محتوى مراجع جزئياً.",
}

for row in RAW:
    pid, name, era, theme_summary, surahs, places, people, theme_names, events, ayahs = row
    prev = approved_nodes.get(pid, {})

    node_type = "prophet"
    if pid in ("maryam",):
        node_type = "person"

    story_nodes[pid] = {
        "id": pid,
        "node_type": node_type,
        "name_ar": name,
        "short_title_ar": era,
        "summary_ar": theme_summary,
        "era_ar": era,
        "review_status": prev.get("review_status", "pending"),
        "source_status": prev.get("source_status", "pending"),
        "lessons_ar": [],
        "network_conclusion_ar": NETWORK_CONCLUSIONS.get(
            pid,
            "هذه العقدة نموذجٌ تعليمي داخل شبكة القصص القرآني — راجع الآيات والمصادر قبل الاعتماد النهائي.",
        ),
        "network_conclusion_review_status": "pending",
        "surah_ids": surahs,
    }

    # Theme links
    theme_ids = []
    for tname in theme_names:
        tid = theme_id(tname)
        theme_ids.append(tid)
        node_links.append({
            "source_node_id": pid,
            "target_node_id": tid,
            "relation_type": "embodies_theme",
            "confidence": 1,
            "evidence_note_ar": f"محور {tname} في قصة {name}",
        })

    # Places
    for place in places:
        pl_id = slug_place(place)
        if pl_id not in story_nodes:
            story_nodes[pl_id] = {
                "id": pl_id,
                "node_type": "place",
                "name_ar": place,
                "summary_ar": f"مكان مرتبط بقصة {name}",
                "review_status": "pending",
                "source_status": "pending",
            }
        node_links.append({
            "source_node_id": pid,
            "target_node_id": pl_id,
            "relation_type": "located_in",
            "confidence": 1,
            "evidence_note_ar": place,
        })

    # People
    for person in people:
        pe_id = slug_person(person)
        if pe_id not in story_nodes:
            story_nodes[pe_id] = {
                "id": pe_id,
                "node_type": "person",
                "name_ar": person,
                "summary_ar": f"شخصية مرتبطة بقصة {name}",
                "review_status": "pending",
                "source_status": "pending",
            }
        node_links.append({
            "source_node_id": pid,
            "target_node_id": pe_id,
            "relation_type": "related_to",
            "confidence": 1,
            "evidence_note_ar": person,
        })

    # Surah links
    for sid in surahs:
        snode_id = f"surah_{sid}"
        if snode_id not in story_nodes:
            story_nodes[snode_id] = {
                "id": snode_id,
                "node_type": "surah",
                "name_ar": f"سورة {SURAH[sid - 1]}",
                "summary_ar": f"سورة {sid} — {SURAH[sid - 1]}",
                "review_status": "approved",
                "source_status": "cited",
            }
        node_links.append({
            "source_node_id": pid,
            "target_node_id": snode_id,
            "relation_type": "narrated_in",
            "confidence": 1,
            "evidence_note_ar": f"سورة {sid}",
        })

    # Parse ayah refs for distribution
    parsed_ayahs = []
    for a in ayahs:
        ref_str, quote_ar, note_ar = a[0], a[1], a[2]
        parsed = parse_ayah_ref(ref_str)
        if parsed:
            parsed_ayahs.append({**parsed, "note_ar": note_ar, "ref_label": ref_str})
            # Draft lesson from educational note — NOT tafsir
            story_nodes[pid].setdefault("lessons_ar", [])
            if note_ar and note_ar not in story_nodes[pid]["lessons_ar"]:
                story_nodes[pid]["lessons_ar"].append(note_ar)

    # Events
    for i, ev_title in enumerate(events, start=1):
        eid = f"{pid}_{i:02d}_{re.sub(r'[^a-z0-9]+', '_', ev_title)[:20]}"
        # Try match existing approved event by node + order
        legacy = None
        for old in CURRENT.get("story_events", []):
            if old.get("node_id") == pid and old.get("event_order") == i:
                legacy = old
                eid = old["id"]
                break

        ev_theme_ids = [theme_id(t) for t in theme_names[:3]]
        review = legacy.get("review_status", "pending") if legacy else "pending"
        source = legacy.get("source_status", "cited") if legacy else ("cited" if parsed_ayahs else "pending")

        summary = legacy.get("summary_ar") if legacy else f"مرحلة من القصة: {ev_title} — ملخص تعليمي يحتاج مراجعة."

        story_events.append({
            "id": eid,
            "node_id": pid,
            "title_ar": ev_title,
            "summary_ar": summary,
            "event_order": i,
            "certainty_level": "quran_explicit",
            "review_status": review,
            "source_status": source,
            "evidence_status": "needs_precise_mapping",
            "evidence_confidence": "needs_review",
            "theme_ids": ev_theme_ids,
            "lessons_ar": legacy.get("lessons_ar", []) if legacy else [],
            "sources": (
                legacy.get("sources", [{"source_id": "quran_text", "note_ar": "مرجع قرآني — يحتاج ربطًا دقيقًا"}])
                if legacy
                else []
            ),
        })

        # Do NOT auto-assign ayahs (round-robin removed in Phase 5).
        # Run scripts/apply_precise_evidence.py to attach curated precise mappings only.

# Deduplicate node_links
seen_links = set()
unique_links = []
for l in node_links:
    key = (l["source_node_id"], l["target_node_id"], l["relation_type"])
    if key not in seen_links:
        seen_links.add(key)
        unique_links.append(l)

# Build eras for JSON
eras_json = []
for e in ERAS:
    icon, title, node_ids, summary = e[0], e[1], e[2], e[3]
    eras_json.append({
        "icon": icon,
        "title_ar": title,
        "node_ids": node_ids,
        "summary_ar": summary,
    })

# Merge preserved theme approvals
for t in CURRENT.get("themes", []):
    if t["id"] in themes and t.get("review_status") == "approved":
        themes[t["id"]]["review_status"] = "approved"

seed = {
    "meta": {
        "version": "0.3.0",
        "migrated_from": "quran_story_universe_10_10_final.html",
        "disclaimer_ar": "هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعطمدة.",
        "public_mode_note": "المحتوى غير المراجع يُعرض للتجربة فقط وليس كحكم أو تفسير نهائي.",
    },
    "tafsir_sources": CURRENT.get("tafsir_sources", []),
    "eras": eras_json,
    "themes": list(themes.values()),
    "story_nodes": list(story_nodes.values()),
    "story_events": sorted(story_events, key=lambda x: (x["node_id"], x["event_order"])),
    "event_ayahs": event_ayahs,
    "node_links": unique_links,
}

# Fix typo in disclaimer
seed["meta"]["disclaimer_ar"] = "هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة."

OUT.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print("story_nodes:", len(seed["story_nodes"]))
print("story_events:", len(seed["story_events"]))
print("event_ayahs:", len(seed["event_ayahs"]))
print("themes:", len(seed["themes"]))
print("node_links:", len(seed["node_links"]))
print("eras:", len(seed["eras"]))
print("prophets in RAW:", len(RAW))
