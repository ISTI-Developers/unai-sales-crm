import { DefaultResponse } from "@/interfaces";
import { ApproverResponse, NewCart, Request } from "@/interfaces/requests.interface";
import { catchError, spAPI as api } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { useAuth } from "@/providers/auth.provider";

export const useRequests = (formID: number) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['requests', formID],
        queryFn: async () => {
            const response = await api.get<Request[]>("/requests", {
                params: {
                    form_id: formID,
                    user: user?.ID
                }
            })

            return response.data;
        },
        enabled: !!user || !!formID,
    })
}
export const useSingleRequest = (request_no?: string) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['requests', "request_no", request_no],
        queryFn: async () => {
            const response = await api.get<Request>("/requests", {
                params: {
                    request_no: request_no,
                    user: user?.ID
                }
            })

            return response.data;
        },
        enabled: !!user || !!request_no,
        
    })
}
export const useInsertRequest = () => {
    // const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: NewCart) => {
            const formdata = new FormData();
            formdata.append("data", JSON.stringify(data));
            const response = await api.post<DefaultResponse>(`requests`, formdata);

            return response.data;
        },
        onSuccess: () => {
            toast({
                variant: "success",
                description: "Your request has been saved."
            })

        },
        onError: catchError,
    });
};
export const useManageRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: ApproverResponse) => {
            const response = await api.put<DefaultResponse>(`requests`, {
                ...data,
                action: 'manage_status'
            });

            return response.data;
        },
        onSuccess: (_, variables) => {
            toast({
                variant: "success",
                description: "Your request has been saved."
            })
            queryClient.invalidateQueries({ queryKey: ['requests', "request_no", variables.request_no] })
        },
        onError: catchError,
    });
};