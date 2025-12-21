import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";


export const useHasMysteryBox = () => {
  const { user } = useAuth();
  return useQuery<any>({
    queryKey: ['hasMysteryBox'],
    queryFn: () => authService.hasMysteryBox(),
    enabled: !!user,
  });
};