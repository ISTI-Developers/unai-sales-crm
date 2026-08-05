import { DefaultResponse } from "@/interfaces";
import { BaseMinutes, RawMinutes } from "@/interfaces/meeting.interface";
import { catchError, spAPI } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMeetings = (week: number[], year: number = 2026) => {
    return useQuery({
        queryKey: ["meetings", year, week],
        queryFn: async () => {
            const response = await spAPI.get<RawMinutes[]>("/meetings", {
                params: {
                    year: year,
                    week: JSON.stringify(week)
                },
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 10,
        enabled: !!year && !!week,
    })
}

export const useCreateMinute = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (meeting: Omit<BaseMinutes, "ID"> & { year: number }) => {
            const formdata = new FormData();
            formdata.append("activity", meeting.activity);
            formdata.append("week", String(meeting.week));
            formdata.append("date", new Date().toISOString());

            const response = await spAPI.post<DefaultResponse<Omit<BaseMinutes, "ID">>>(
                `meetings`,
                formdata
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.refetchQueries({
                queryKey: ["meetings", variables.year, [variables.week]],
            });

        },
        onError: catchError,
    })
}

export const useUpdateMinute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (meeting: BaseMinutes & { year: number }) => {
            const response = await spAPI.put<DefaultResponse<BaseMinutes>>(
                `meetings`,
                { ...meeting, date: new Date().toISOString() }
            );

            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.refetchQueries({
                queryKey: ["meetings", variables.year, [variables.week]],
            });

        },
        onError: catchError,
    })
}

export const useDeleteMinute = (week: number, year: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ID: number) => {
            const response = await spAPI.delete<DefaultResponse<number>>(
                `meetings`, {
                params: {
                    id: ID
                }
            });

            return response.data;
        },
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: ["meetings", year, [week]],
            });

        },
        onError: catchError,
    })
}