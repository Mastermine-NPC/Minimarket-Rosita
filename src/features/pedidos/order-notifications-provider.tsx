import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useRosita } from "@/hooks/use-rosita";
import { orderNotifications } from "@/lib/order-events";
import { readNoticePreferences, receiveNoticePreferences, saveNoticePreferences, subscribeNotices } from "@/lib/order-notice-preferences";
import { OrderNoticesContext } from "./order-notifications-context";
export function OrderNotificationsProvider({ children }: { children: ReactNode }) {
  const { state } = useRosita(), navigate = useNavigate();
  const userId = state.users.find(u => u.id === state.sessionUserId && u.role === "customer" && u.active !== false)?.id || "";
  const notifications = useMemo(() => orderNotifications(state.orders, userId), [state.orders, userId]);
  const preferences = useSyncExternalStore(subscribeNotices, () => readNoticePreferences(userId));
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() => typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  useEffect(() => {
    window.addEventListener("storage", receiveNoticePreferences);
    const focus = () => setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
    window.addEventListener("focus", focus);
    return () => { window.removeEventListener("storage", receiveNoticePreferences); window.removeEventListener("focus", focus); };
  }, []);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const deliver = () => {
      if (!active) return;
      const prefs = readNoticePreferences(userId, true);
      const fresh = prefs.initialized ? notifications.filter(n => !prefs.seen.includes(n.id)).reverse() : [];
      // Claim event IDs before showing notices; Web Locks serializes this across tabs.
      saveNoticePreferences(userId, { ...prefs, initialized: true, seen: [...new Set([...prefs.seen, ...notifications.map(n => n.id)])] });
      for (const notice of fresh) {
        const target = `/pedido/${notice.orderId}/seguimiento`;
        toast.success(notice.title, { id: `order-notice:${notice.id}`, description: notice.message, action: { label: "Ver pedido", onClick: () => navigate(target) } });
        if (prefs.browser && typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            const browserNotice = new Notification(notice.title, { body: `${notice.message}\n${notice.orderId}`, tag: `rosita:${notice.id}` });
            browserNotice.onclick = () => { window.focus(); navigate(target); browserNotice.close(); };
          } catch { /* Local toasts and persistent event history remain available. */ }
        }
      }
    };
    if (navigator.locks) void navigator.locks.request(`rosita:order-notices:${userId}`, deliver).catch(() => { if (active) deliver(); });
    else deliver();
    return () => { active = false; };
  }, [notifications, userId, navigate]);
  const markRead = useCallback((id: string) => { const p = readNoticePreferences(userId, true); saveNoticePreferences(userId, { ...p, read: [...new Set([...p.read, id])] }); }, [userId]);
  const markAllRead = useCallback(() => { const p = readNoticePreferences(userId, true); saveNoticePreferences(userId, { ...p, read: [...new Set([...p.read, ...notifications.map(n => n.id)])] }); }, [notifications, userId]);
  const enableBrowser = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    let value = Notification.permission;
    try { if (value === "default") value = await Notification.requestPermission(); } catch { value = Notification.permission; }
    setPermission(value);
    const p = readNoticePreferences(userId, true); saveNoticePreferences(userId, { ...p, browser: value === "granted" });
  }, [userId]);
  const disableBrowser = useCallback(() => { const p = readNoticePreferences(userId, true); saveNoticePreferences(userId, { ...p, browser: false }); }, [userId]);
  const value = useMemo(() => ({ notifications, unread: notifications.filter(n => !preferences.read.includes(n.id)).length, read: preferences.read, browserEnabled: preferences.browser && permission === "granted", permission, markRead, markAllRead, enableBrowser, disableBrowser }), [notifications, preferences, permission, markRead, markAllRead, enableBrowser, disableBrowser]);
  return <OrderNoticesContext.Provider value={value}>{children}</OrderNoticesContext.Provider>;
}
