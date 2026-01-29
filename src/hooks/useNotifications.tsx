import { DefaultResponse, WorkplaceRes } from "@/interfaces";
import { User } from "@/interfaces/user.interface";
import { catchError, wpAPI } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Notification extends NotificationOptions {
    title: string;
    recipients: "ALL" | number[]
}

export interface PushNotification {
    ID: number;
    title: string;
    body: string;
    url: string;
    tag: string;
    recipients: string;
    platform: string;
    created_at: string;
    user_id: number;
    read_at: string | null;
}

export const sendNotification = async (notification: Notification) => {
    const data = {
        ...notification,
        platform: "sales",
        icon: "/icon.png",
        badge: "/icon.png",
    }

    const notificationResponse = await wpAPI.post<WorkplaceRes<DefaultResponse>>(`alert/save`, data);

    if (notificationResponse.data.data.acknowledged) {
        const response = await wpAPI.post<DefaultResponse>(`alert/send`, data)

        return response.data.acknowledged;
    }
};

export const useNotifications = () => {
    const user = localStorage.getItem("currentUser");
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            if (!user) return [] as PushNotification[];

            const response = await wpAPI.get<WorkplaceRes<PushNotification[]>>("alert/", {
                params: {
                    user_id: Number((JSON.parse(user) as User).ID)
                }
            })

            if (response.data.success) {
                return response.data.data;
            }
        },
        enabled: !!user,
    })
}

export const useReadNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { notification_id: number; user_id: number }) => {

            const response = await wpAPI.post<DefaultResponse>("alert/read", data);

            return response.data.acknowledged;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
        onError: catchError,
    });
}