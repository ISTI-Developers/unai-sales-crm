import { DefaultResponse } from "@/interfaces";
import axios from "axios";

const url = import.meta.env.VITE_WP;


export interface Notification extends NotificationOptions {
    title: string;
    recipients: "ALL" | number[]
}

export const sendNotification = async (notification: Notification) => {
    const data = {
        ...notification,
        icon: "/icon.png",
        badge: "/icon.png",
    }

    const response = await axios.post<DefaultResponse>(`${url}alert/send`, data, {
        headers: { "Content-Type": "application/json" }
    })

    return response.data.acknowledged;

};