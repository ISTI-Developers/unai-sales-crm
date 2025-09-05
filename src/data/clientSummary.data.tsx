import { useClientStatusSummary } from "@/hooks/useDashboard";
import { LucideIcon } from "lucide-react";
import { useMemo } from "react";

export interface StatusSummary {
  count: number;
  key: string;
  status: string;
  icon: LucideIcon;
  width: string;
  color: string;
}
export interface Count {
  pool: number;
  total: number;
}

const useClientData = () => {
  const { data, isLoading } = useClientStatusSummary(46);

  const count: Count = useMemo(() => {
    if (!data || isLoading) return { pool: 0, total: 0 };
    console.log(data);
    if (data.pool.length === 0 || data.total.length === 0)
      return {
        pool: 0,
        total: 0,
      };

    const dataCount = {
      pool: data.pool[0].count,
      total: data.total.reduce((sum, item) => (sum += item.count), 0),
    };
    return dataCount;
  }, [data, isLoading]);

  return { count, clientSummary: data?.total ?? [], isLoading };
};

export default useClientData;
