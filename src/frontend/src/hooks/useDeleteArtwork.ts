import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useDeleteArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (artworkId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteArtwork(artworkId);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete artwork');
      }
    },
    onSuccess: (_, artworkId) => {
      // Invalidate all artworks list
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      // Invalidate the specific artwork
      queryClient.invalidateQueries({ queryKey: ['artwork', artworkId.toString()] });
      // Invalidate caller's submissions (for ownership checks)
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      // Invalidate admin submissions view
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
    },
  });
}
