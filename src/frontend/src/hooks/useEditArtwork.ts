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
      return await actor.editArtwork(
        params.artworkId,
        params.title,
        params.description,
        params.imageUrl,
        params.price
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate all artworks list
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      // Invalidate the specific artwork
      queryClient.invalidateQueries({ queryKey: ['artwork', variables.artworkId.toString()] });
      // Invalidate caller's submissions (for ownership checks and embedded artwork data)
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      // Invalidate admin submissions view
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}
