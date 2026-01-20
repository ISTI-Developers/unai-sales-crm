import { Deck } from "@/misc/deckTemplate";
import { catchError, spAPI } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { useAuth } from "@/providers/auth.provider";
export const useDecks = (userID: number | null) => {
    return useQuery({
        queryKey: ["decks", userID],
        queryFn: async () => {
            const response = await spAPI.get<Deck[]>(`deck`, {
                params: {
                    user_id: userID,
                },
            });
            return response.data;
        },
        enabled: !!userID,
        staleTime: 1000 * 60 * 10,
    });
};

export const useDeck = (deckID: string | null) => {
    return useQuery({
        queryKey: ["decks", { ID: deckID }],
        queryFn: async () => {
            const response = await spAPI.get<Deck>(`deck`, {
                params: {
                    deck_id: deckID,
                },
            });
            return response.data;
        },
        enabled: !!deckID,
        staleTime: 1000 * 60 * 10,
    });
};

export const useUpdateDeck = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (deck: Omit<Deck, "token" | "description" | "created_at" | "thumbnail" | "status">) => {
            const response = await spAPI.put("deck", deck);

            if (response.data) {
                return response.data;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.refetchQueries({ queryKey: ["decks", variables.user_id] })
            queryClient.refetchQueries({ queryKey: ["decks", { ID: variables.ID }] });
            toast({
                variant: "success",
                title: "Deck saved successfully."
            })
        },
        onError: catchError,
    });
}


export const useDeleteDeck = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ID: number) => {
            const response = await spAPI.delete("deck", {
                params: {
                    id: ID
                }
            })
            if (response.data) {
                return response.data;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.refetchQueries({ queryKey: ["decks", user?.ID] })
            queryClient.refetchQueries({ queryKey: ["decks", { ID: variables }] });
            toast({
                variant: "success",
                title: "Deck saved successfully."
            })
        },
        onError: catchError,
    });
}