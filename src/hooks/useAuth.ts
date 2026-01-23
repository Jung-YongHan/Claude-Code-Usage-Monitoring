import { useQuery } from "@tanstack/react-query";
import { checkCredentials } from "../services/tauri-commands";

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: checkCredentials,
    staleTime: 30_000,
    retry: false,
  });
}
