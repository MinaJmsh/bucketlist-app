import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "fa";

const en = {
  plans: "Plans",
  memories: "Memories",
  soon: "Soon",
  someday: "Someday",
  filters: "filters",
  twoFilters: "2 filters",
  oneFilter: "1 filter",
  writtenBy: "written by",
  everyone: "everyone",
  sticker: "sticker",
  allStickers: "all stickers",
  clearFilters: "clear filters",
  newestFirst: "newest first",
  oldestFirst: "oldest first",
  az: "A to Z",
  mostRecent: "most recent",
  bestRated: "best rated",
  menuBucketlist: "Our bucketlist",
  menuGames: "Games",
  menuIdeas: "Idea box",
  pickPage: "pick a page to flip to",
  madeWithLove: "made with love",
  loading: "Opening your notebook...",
  emptyPlans: "nothing written yet...\ntap + to add our first bucketlist item",
  noMatchItems: "no items match these filters...",
  noMatchMemories: "no memories match these filters...",
  emptyMemories: "no polaroids yet...\nfinish a dream to stick one here",
  hintPlans: "tap a line to edit · tap the circle when we've done it",
  hintMemories: "tap a polaroid to open its page",
  language: "Language",
};

const fa: Record<keyof typeof en, string> = {
  plans: "برنامه‌ها",
  memories: "خاطره‌ها",
  soon: "به‌زودی",
  someday: "یک روزی",
  filters: "فیلتر",
  twoFilters: "۲ فیلتر",
  oneFilter: "۱ فیلتر",
  writtenBy: "نوشته‌شده توسط",
  everyone: "همه",
  sticker: "استیکر",
  allStickers: "همه استیکرها",
  clearFilters: "پاک کردن فیلترها",
  newestFirst: "جدیدترین",
  oldestFirst: "قدیمی‌ترین",
  az: "الفبایی",
  mostRecent: "تازه‌ترین",
  bestRated: "بهترین امتیاز",
  menuBucketlist: "فهرست آرزوهای ما",
  menuGames: "بازی‌ها",
  menuIdeas: "جعبه ایده",
  pickPage: "یک صفحه را انتخاب کن",
  madeWithLove: "با عشق ساخته شده",
  loading: "در حال باز کردن دفترچه...",
  emptyPlans: "هنوز چیزی نوشته نشده...\nبرای اضافه کردن اولین آرزو روی + بزن",
  noMatchItems: "موردی با این فیلترها پیدا نشد...",
  noMatchMemories: "خاطره‌ای با این فیلترها پیدا نشد...",
  emptyMemories: "هنوز پولاروییدی نیست...\nیک آرزو را تمام کن تا اینجا بچسبد",
  hintPlans: "برای ویرایش روی خط بزن · وقتی انجامش دادیم روی دایره بزن",
  hintMemories: "برای باز کردن صفحه روی پولارویید بزن",
  language: "زبان",
};

const STRINGS = { en, fa };
export type StringKey = keyof typeof en;

const STORAGE_KEY = "app-language";

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
  isRTL: boolean;
};

const I18nContext = createContext<I18nValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key],
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // restore the saved language on startup
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === "en" || v === "fa") setLangState(v);
      })
      .catch(() => {});
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  };

  const t = (key: StringKey) => STRINGS[lang][key];

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL: lang === "fa" }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
