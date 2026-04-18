import type { Language } from '../data/translations';

const SHOWREEL_VIDEO_IDS: Record<Language, string> = {
  en: '910534861',
  pt: '875142318',
};

export const getShowreelVideoId = (language: Language) => {
  return SHOWREEL_VIDEO_IDS[language] ?? SHOWREEL_VIDEO_IDS.en;
};
