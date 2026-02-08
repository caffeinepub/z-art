import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface EditArtworkParams {
  artworkId: bigint;
  title: string;
  description: string;
  imageUrl: string;
  price: bigint;
}

export function useEditArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, EditArtworkParams>({
    mutationFn: async (params: EditArtworkParams) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        return await actor.editArtwork(
          params.artworkId,
          params.title,
          params.description,
          params.imageUrl,
          params.price
        );
      } catch (error: any) {
        // Normalize backend trap messages to Error.message for UI display
        // Backend traps like "Unauthorized: Only the original artist can edit this artwork"
        // or "You must have an existing user profile to edit artworks" will be surfaced
        const errorMessage = error.message || String(error);
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate all artworks list
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      // Invalidate the specific artwork
      queryClient.invalidateQueries({ queryKey: ['artwork', variables.artworkId.toString()] });
      // Invalidate caller's submissions (for ownership checks and embedded artwork data)
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      // Invalidate admin submissions view
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
    },
  });
}
