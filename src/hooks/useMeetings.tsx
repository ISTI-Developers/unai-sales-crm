import { DefaultResponse } from "@/interfaces";
import { BaseMinutes, ParsedMinutes, RawMinutes } from "@/interfaces/meeting.interface";
import { catchError, spAPI } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getISOWeek } from "date-fns";

export const useMeetings = (week: number[]) => {
    const year = new Date().getFullYear();
    return useQuery({
        queryKey: ["meetings", year, week],
        queryFn: async () => {
            const response = await spAPI.get<RawMinutes[]>("/meetings", {
                params: {
                    year: year,
                    week: JSON.stringify(week)
                },
            });
            console.log(response.data);
            return response.data;
        },
        staleTime: 1000 * 60 * 10,
        enabled: !!year && !!week,
    })
}

export const useCreateMinute = () => {
    const queryClient = useQueryClient();
    const year = new Date().getFullYear();
    const toggledWeeks = localStorage.getItem("visibleWeeks") ?? '{}';
    const indexes = Object.entries(JSON.parse(toggledWeeks))
        .map(([k, v], i) => ({ key: k, value: v, index: i }))
        .filter(({ value }) => value)
        .map(({ index }) => index);

    return useMutation({
        mutationFn: async (meeting: Omit<BaseMinutes, "ID">) => {
            const formdata = new FormData();

            console.log(meeting);
            formdata.append("activity", meeting.activity);
            formdata.append("unit_id", String(meeting.sales_unit_id));
            formdata.append("week", String(meeting.week));
            formdata.append("date", new Date().toISOString());

            const response = await spAPI.post<DefaultResponse<Omit<BaseMinutes, "ID">>>(
                `meetings`,
                formdata
            );

            return response.data;
        },
        onSuccess: (data, variables) => {
            const week = getISOWeek(new Date().toISOString());
            const meetings = data.item;
            queryClient.setQueryData<ParsedMinutes[]>(
                ["meetings", year, week],
                (old) => {
                    if (!old) return old;
                    const exists = old.some(
                        (item) => item.unit_id === variables.unit_id
                    );

                    if (exists) {
                        return old.map((item) =>
                            item.unit_id === variables.unit_id ? (meetings as ParsedMinutes) : item
                        );
                    }

                    return old;
                }
            );
            queryClient.refetchQueries({
                queryKey: ["meetings", year, indexes],
            });

        },
        onError: catchError,
    })
}

export const useUpdateMinute = () => {
    const queryClient = useQueryClient();
    const year = new Date().getFullYear();
    const toggledWeeks = localStorage.getItem("visibleWeeks") ?? '{}';
    const indexes = Object.entries(JSON.parse(toggledWeeks))
        .map(([k, v], i) => ({ key: k, value: v, index: i }))
        .filter(({ value }) => value)
        .map(({ index }) => index);

    return useMutation({
        mutationFn: async (meeting: BaseMinutes) => {
            const response = await spAPI.put<DefaultResponse<BaseMinutes>>(
                `meetings`,
                { ...meeting, date: new Date().toISOString() }
            );

            return response.data;
        },
        onSuccess: (data, variables) => {
            const week = getISOWeek(new Date().toISOString());
            const meetings = data.item;
            queryClient.setQueryData<ParsedMinutes[]>(
                ["meetings", year, week],
                (old) => {
                    if (!old) return old;
                    const exists = old.some(
                        (item) => item.unit_id === variables.unit_id
                    );

                    if (exists) {
                        return old.map((item) =>
                            item.unit_id === variables.unit_id ? (meetings as ParsedMinutes) : item
                        );
                    }

                    return old;
                }
            );
            queryClient.refetchQueries({
                queryKey: ["meetings", year, indexes],
            });

        },
        onError: catchError,
    })
}

export const useDeleteMinute = () => {
    const year = new Date().getFullYear();
    const queryClient = useQueryClient();

    const toggledWeeks = localStorage.getItem("visibleWeeks") ?? '{}';
    const indexes = Object.entries(JSON.parse(toggledWeeks))
        .map(([k, v], i) => ({ key: k, value: v, index: i }))
        .filter(({ value }) => value)
        .map(({ index }) => index);

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
                queryKey: ["meetings", year, indexes],
            });

        },
        onError: catchError,
    })
}