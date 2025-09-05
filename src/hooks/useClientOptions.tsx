import { useQuery } from "@tanstack/react-query";
import { ClientOptions } from "@/interfaces/client.interface";
import { useMemo } from "react";
import { List } from "@/interfaces";
import { spAPI } from "@/providers/api";

export const useClientMisc = () => {
  return useQuery({
    queryKey: ["client-misc"],
    queryFn: async () => {
      const response = await spAPI.get<ClientOptions[]>("/clients?misc");
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
export const useAllClientOptions = () => {
  const { data, ...query } = useClientMisc();
  const filter = (pattern: RegExp) =>
    data?.filter((item) => pattern.test(item.category)) ?? [];

  return {
    ...query,
    industry: filter(/ALL|industry/),
    source: filter(/ALL|source/),
    status: filter(/status/),
    type: filter(/ALL|type/),
    mediums: filter(/ALL|medium/),
  };
};

export const useIndustries = () => {
  const query = useClientMisc();
  return {
    ...query,
    data:
      query.data?.filter((item) => /ALL|industry/.test(item.category)) ?? [],
  };
};

export const useTypes = () => {
  const query = useClientMisc();
  return {
    ...query,
    data: query.data?.filter((item) => /ALL|type/.test(item.category)) ?? [],
  };
};

export const useStatuses = () => {
  const query = useClientMisc();
  return {
    ...query,
    data: query.data?.filter((item) => /status/.test(item.category)) ?? [],
  };
};

export const useSources = () => {
  const query = useClientMisc();
  return {
    ...query,
    data: query.data?.filter((item) => /ALL|source/.test(item.category)) ?? [],
  };
};

export const useClientOptionList = (header?: string) => {
  const { data, isLoading } = useClientMisc();

  const options: List[] = useMemo(() => {
    if (!data || isLoading) return [];

    let optionsList: ClientOptions[] = [];
    if (header) {
      const filteredByHeader = data.filter(
        (option) => option.category === header
      );

      optionsList = filteredByHeader;
    }

    if (optionsList.length > 0) {
      return optionsList
        .map(({ misc_id, name }) => {
          return {
            id: String(misc_id),
            label: name,
            value: name,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    return [];
  }, [data, isLoading, header]);

  return { options };
};
