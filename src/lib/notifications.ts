import { User } from "@/interfaces/user.interface";
import axios from "axios";
import { Monitor, Tag } from "lucide-react";

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered:", registration);
    return registration;
  } else {
    throw new Error("Service workers are not supported");
  }
}

export async function subscribeUserToPush(
  registration: ServiceWorkerRegistration,
) {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    const user: User = JSON.parse(currentUser);
    const url: string = import.meta.env.VITE_WP;
    const vapidPublicKey =
      "BKS60bJGvZ0A6SfgI_O1wrR9X29hf1sr8q0bynLrDoWVUt6ALDiMsdn4cWjZLjnqlMtGSDlM-so5eO2PAcQcjHM";

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
    let sub = await registration.pushManager.getSubscription();

    if (!sub) {
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      const formdata = new FormData();
      formdata.append("subscription", JSON.stringify(sub));
      formdata.append("platform", "sales");
      formdata.append("user_id", String(user.ID));

      await axios.post(`${url}alert/subscribe`, formdata, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("User subscribed:", sub);
    } else {
      console.log("User already subscribed", sub.endpoint);
    }
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
