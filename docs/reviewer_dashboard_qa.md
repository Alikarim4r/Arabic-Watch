# Reviewer Dashboard QA Checklist

Manual and automated checks for Phase 11 reviewer experience.

## Automated (`npm run qa`)

- Local mode loads without Supabase env
- `isFinalContent()` gate strict
- Arabic disclaimer present
- Admin panels load in browser QA
- Apply/verify batch scripts still pass

## Browser QA coverage

- Sign-in / demo banner in local mode
- Reviewer dashboard `#reviewer-dashboard`
- Review queue filters and chips
- Evidence curation save/export
- Content batches lifecycle UI
- Review action confirmation flow
- Quran text fallback badges

## Manual checklist

- [ ] Profile shows role and stats
- [ ] History tab lists session/Supabase actions
- [ ] Saved filters persist after reload
- [ ] Keyboard shortcuts j/k// work in review queue
- [ ] Toast messages appear for save/export/errors
- [ ] Access denied shown for viewer in Supabase mode (staging)
- [ ] Confirm dialog blocks approve without note
- [ ] No keyboard shortcut triggers approve/reject

## Safety regression

- [ ] Pending content shows draft banner in Story Mode
- [ ] 48 needs_precise_mapping events not public-final
- [ ] UI does not UPDATE story_* directly
- [ ] Review badges and disclaimer unchanged
