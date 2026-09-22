import * as React from "react";

export type Lang = "en" | "ru" | "zh";

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
  dashboard: "仪表盘",
  users: "用户",
  inbounds: "入站",
  routing: "路由",
  activityLog: "活动日志",
  telegramBot: "Telegram 机器人",
  settings: "设置",
  signOut: "退出登录",
  version: "版本",
  owner: "所有者",
  admin: "管理员",
  overallSpeed: "总体速度",
  trafficPerInbound: "各入站流量",
  upload: "上传",
  download: "下载",
  xrayUptime: "Xray 运行时间",
  systemUptime: "系统运行时间",
  backupRestore: "备份与恢复",
  export: "导出",
  import: "导入",
  newUser: "新建用户",
  online: "在线",
  offline: "离线",
  active: "有效",
  language: "语言",
};

const dicts: Record<Lang, Dict> = { en, ru, zh: fa };

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
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
    document.documentElement.dir = "ltr";
  }, []);

  React.useEffect(() => {
    document.documentElement.dir = "ltr";
  }, [lang]);

  const t = React.useCallback(
    (key: keyof typeof en) => dicts[lang][key] || en[key] || String(key),
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}
