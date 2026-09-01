/**
 * Browser Notification API helper and manager
 * Handles permission requests, native notification dispatching, and fallback mechanisms.
 */

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  onClick?: () => void;
}

export const isBrowserNotificationSupported = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const getBrowserNotificationPermission = (): NotificationPermission => {
  if (!isBrowserNotificationSupported()) {
    return "denied";
  }
  try {
    return Notification.permission;
  } catch (e) {
    console.warn("Error reading Notification.permission:", e);
    return "default";
  }
};

export const requestBrowserNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isBrowserNotificationSupported()) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn("Notification.requestPermission failed:", e);
    return "denied";
  }
};

export const showNativeBrowserNotification = (
  options: BrowserNotificationOptions
): Notification | null => {
  if (!isBrowserNotificationSupported()) {
    return null;
  }

  try {
    if (Notification.permission !== "granted") {
      return null;
    }

    const notif = new Notification(options.title, {
      body: options.body,
      tag: options.tag || `notif-${Date.now()}`,
      icon: options.icon || "/favicon.ico",
      badge: options.badge,
      data: options.data,
      requireInteraction: false,
      silent: false
    });

    if (options.onClick) {
      notif.onclick = () => {
        window.focus();
        options.onClick?.();
        notif.close();
      };
    }

    return notif;
  } catch (e) {
    console.warn("Native Notification trigger failed:", e);
    return null;
  }
};
