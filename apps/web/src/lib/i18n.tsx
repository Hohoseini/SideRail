import * as React from "react";

export type Lang = "en" | "ru" | "fa";

type Dict = Record<string, string>;

const en: Dict = {
  dashboard: "Dashboard",
  users: "Users",
  inbounds: "Inbounds",
  routing: "Routing",
  activityLog: "Activity Log",
  telegramBot: "Telegram Bot",
  settings: "Settings",
  signOut: "Sign out",
  version: "Version",
  owner: "Owner",
  admin: "Admin",
  overallSpeed: "Overall Speed",
  trafficPerInbound: "Traffic per inbound",
  upload: "Upload",
  download: "Download",
  xrayUptime: "Xray uptime",
  systemUptime: "System uptime",
  backupRestore: "Backup & Restore",
  export: "Export",
  import: "Import",
  newUser: "New User",
  online: "Online",
  offline: "Offline",
  active: "Active",
  language: "Language",
};

const ru: Dict = {
  dashboard: "Панель",
  users: "Пользователи",
  inbounds: "Входящие",
  routing: "Маршрутизация",
  activityLog: "Журнал",
  telegramBot: "Telegram-бот",
  settings: "Настройки",
  signOut: "Выйти",
  version: "Версия",
  owner: "Владелец",
  admin: "Админ",
  overallSpeed: "Общая скорость",
  trafficPerInbound: "Трафик по входящим",
  upload: "Отдача",
  download: "Загрузка",
  xrayUptime: "Время работы Xray",
  systemUptime: "Время работы системы",
  backupRestore: "Резервное копирование",
  export: "Экспорт",
  import: "Импорт",
  newUser: "Новый пользователь",
  online: "В сети",
  offline: "Не в сети",
  active: "Активен",
  language: "Язык",
};

const fa: Dict = {
  dashboard: "داشبورد",
  users: "کاربران",
  inbounds: "این‌باندها",
  routing: "مسیریابی",
  activityLog: "گزارش فعالیت",
  telegramBot: "ربات تلگرام",
  settings: "تنظیمات",
  signOut: "خروج",
  version: "نسخه",
  owner: "مالک",
  admin: "ادمین",
  overallSpeed: "سرعت کلی",
  trafficPerInbound: "ترافیک هر این‌باند",
  upload: "آپلود",
  download: "دانلود",
  xrayUptime: "مدت فعالیت Xray",
  systemUptime: "مدت فعالیت سیستم",
  backupRestore: "پشتیبان‌گیری و بازیابی",
  export: "خروجی",
  import: "ورودی",
  newUser: "کاربر جدید",
  online: "آنلاین",
  offline: "آفلاین",
  active: "فعال",
  language: "زبان",
};

const dicts: Record<Lang, Dict> = { en, ru, fa };

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "fa", label: "فارسی" },
];

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof en) => string;
}

const I18nContext = React.createContext<I18nState | null>(null);

export function useI18n(): I18nState {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(
    () => (localStorage.getItem("sr_lang") as Lang) || "en",
  );

  const setLang = React.useCallback((l: Lang) => {
    localStorage.setItem("sr_lang", l);
    setLangState(l);
    document.documentElement.dir = l === "fa" ? "rtl" : "ltr";
  }, []);

  React.useEffect(() => {
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const t = React.useCallback(
    (key: keyof typeof en) => dicts[lang][key] || en[key] || String(key),
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}
