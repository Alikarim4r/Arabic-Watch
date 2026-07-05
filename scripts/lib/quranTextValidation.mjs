import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** @returns {Map<number, number>} */
export function loadSurahAyahCounts() {
  const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs || [];
  return new Map(surahs.map((s) => [Number(s.id), Number(s.ayah_count)]));
}

/**
 * Validate a licensed Quran JSON payload without modifying any text fields.
 * @param {Object} data
 * @param {{ requireFullQuran?: boolean, fileLabel?: string }} [options]
 */
export function validateQuranText(data, options = {}) {
  const errors = [];
  const warnings = [];
  const fileLabel = options.fileLabel || 'quran_text.json';

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Root must be a JSON object'], warnings, ayahCount: 0 };
  }

  const meta = data.meta;
  if (!meta || typeof meta !== 'object') {
    errors.push('meta object is required');
  } else {
    for (const field of ['source_name', 'license', 'script_type', 'riwayah']) {
      if (!meta[field] || String(meta[field]).trim() === '') {
        errors.push(`meta.${field} is required`);
      }
    }
  }

  const isSample = meta?.status === 'sample_only_not_full_quran';
  const requireFullQuran = options.requireFullQuran ?? !isSample;

  if (!Array.isArray(data.ayahs)) {
    errors.push('ayahs must be an array');
    return { valid: false, errors, warnings, ayahCount: 0, isSample, requireFullQuran };
  }

  const surahMax = loadSurahAyahCounts();
  const seenKeys = new Set();
  const textSnapshots = [];

  for (let i = 0; i < data.ayahs.length; i++) {
    const ayah = data.ayahs[i];
    const prefix = `ayahs[${i}]`;

    const surahId = Number(ayah.surah_id);
    if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
      errors.push(`${prefix}.surah_id must be between 1 and 114`);
      continue;
    }

    const ayahNumber = Number(ayah.ayah_number);
    const maxAyah = surahMax.get(surahId);
    if (!Number.isInteger(ayahNumber) || ayahNumber < 1 || ayahNumber > maxAyah) {
      errors.push(`${prefix}.ayah_number ${ayahNumber} invalid for surah ${surahId} (max ${maxAyah})`);
    }

    const expectedKey = `${surahId}:${ayahNumber}`;
    if (ayah.ayah_key !== expectedKey) {
      errors.push(`${prefix}.ayah_key must be "${expectedKey}" (got "${ayah.ayah_key}")`);
    }

    if (!ayah.text_uthmani || String(ayah.text_uthmani).trim() === '') {
      errors.push(`${prefix}.text_uthmani is required`);
    } else {
      textSnapshots.push({ index: i, value: String(ayah.text_uthmani) });
    }

    if (seenKeys.has(expectedKey)) {
      errors.push(`duplicate ayah_key: ${expectedKey}`);
    }
    seenKeys.add(expectedKey);
  }

  const ayahCount = data.ayahs.length;
  if (requireFullQuran && ayahCount !== 6236) {
    errors.push(`full import requires exactly 6236 ayahs (got ${ayahCount})`);
  } else if (isSample && ayahCount >= 6236) {
    warnings.push('sample file should not contain a full Quran payload');
  }

  for (const snap of textSnapshots) {
    const current = String(data.ayahs[snap.index].text_uthmani);
    if (current !== snap.value) {
      errors.push(`text_uthmani was modified during validation at ayahs[${snap.index}]`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    ayahCount,
    isSample,
    requireFullQuran,
    fileLabel,
  };
}
