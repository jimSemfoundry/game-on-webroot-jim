import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { ICachePaymentIcons } from "@/types/game";

export const usePaymentGatewayByUser = () => {
    const { user } = useAuth();

    const { data, refetch } = useQuery<{ data: ICachePaymentIcons; code: number }>({
        queryKey: ['paymentGatewayByUser'],
        queryFn: () => authService.getPaymentGatewayByUser(),
        enabled: !!user,
    });

    return {
        paymentGatewayByUser: data?.code === 0 ? data.data : undefined,
        refetch,
    };
};

export const usePaymentIcons = () => {
    const { data, refetch } = useQuery<{ data: ICachePaymentIcons; code: number }>({
        queryKey: ['paymentIcons'],
        queryFn: () => authService.getPaymentIcons(),
    });

    return { paymentIcons: data?.code === 0 ? data.data : undefined, refetch };
};
