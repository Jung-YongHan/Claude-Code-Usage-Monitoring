import { useQuery } from "@tanstack/react-query";
import { fetchUsageData } from "../services/tauri-commands";

export function useUsageData(enabled: boolean = true) {
  return useQuery({
    queryKey: ["usage"],
    queryFn: fetchUsageData,
    refetchInterval: 10_000, // Auto-refresh every 10 seconds
    staleTime: 5_000,
    enabled,
  });
}
