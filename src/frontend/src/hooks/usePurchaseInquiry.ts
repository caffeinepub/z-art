import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface PurchaseInquiryParams {
  artworkId: bigint;
  buyerName: string;
  buyerEmail: string;
  message: string;
}

export function usePurchaseInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PurchaseInquiryParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createPurchaseInquiry(
        params.artworkId,
        params.buyerName,
        params.buyerEmail,
        params.message
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}

