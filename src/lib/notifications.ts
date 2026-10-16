import { toast } from "@/hooks/use-toast";
import { User } from "@/interfaces/user.interface";
import { spAPI } from "@/providers/api";
import { AxiosError } from "axios";
import { Monitor, Tag } from "lucide-react";

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers are not supported.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none",
    });

    console.log("Service Worker registered:", registration.scope);

    // Check whether a newer version is available.
    await registration.update();

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            console.log("New Service Worker version installed.");
          } else {
            console.log("Service Worker installed for the first time.");
          }
        }
      });
    });

    // Check again when the user returns to the tab.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update().catch(console.error);
      }
    });
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

export async function subscribeUserToPush(
  registration: ServiceWorkerRegistration,
) {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error("Push notifications are not supported.");
  }

  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    throw new Error("Please log in before enabling notifications.");
  }

  const user: User = JSON.parse(currentUser);
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    throw new Error("VAPID public key is missing.");
  }

  // Ask permission only when it hasn't been decided yet.
  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notifications are blocked in your browser settings."
        : "Notification permission was not granted.",
    );
  }

  // Reuse an existing subscription, or create one.
  let sub = await registration.pushManager.getSubscription();

  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  // Register the subscription with your backend either way.
  const formData = new FormData();
  formData.append("subscription", JSON.stringify(sub.toJSON()));
  formData.append("user_id", String(user.ID));

  await spAPI.post(`alert?action=subscribe`, formData);

  console.log("Push subscription registered:", sub.endpoint);
  toast({
    variant: "success",
    description: "Push notification subscribed!",
  });

  return sub;
}

export async function unsubscribeUserFromPush(
  registration: ServiceWorkerRegistration,
) {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    throw new Error("Please log in before changing notification settings.");
  }

  const user: User = JSON.parse(currentUser);
  const sub = await registration.pushManager.getSubscription();

  if (!sub) {
    return; // Already unsubscribed in this browser.
  }
  const formData = new FormData();
  formData.append("subscription", JSON.stringify(sub.toJSON()));
  formData.append("user_id", String(user.ID));
  // Tell the backend to deactivate/delete this subscription.
  // Implement this endpoint to match your PHP backend.
  try {
    await spAPI.post("alert?action=unsubscribe", formData);

    // Remove the browser's subscription.
    const unsubscribed = await sub.unsubscribe();

    if (!unsubscribed) {
      throw new Error("Failed to unsubscribe from push notifications.");
    }
    toast({
      variant: "success",
      description: "Push notification unsubscribed!",
    });
  } catch (error) {
    toast({
      variant: "destructive",
      description: (error as AxiosError).message,
    });
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const notificationTagMap = {
  booking: Tag,
  sites: Monitor,
};
