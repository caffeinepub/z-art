import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useToggleArtworkSoldStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artworkId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.toggleArtworkSoldStatus(artworkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allPurchaseInquiries'] });
    },
  });
}
