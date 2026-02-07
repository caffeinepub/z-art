import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SubmissionResult } from '../backend';

interface SubmitArtworkParams {
  title: string;
  description: string;
  imageUrl: string;
  price: bigint;
}

export function useSubmitArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<SubmissionResult, Error, SubmitArtworkParams>({
    mutationFn: async (params: SubmitArtworkParams) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.submitArtwork(params.title, params.description, params.imageUrl, params.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
    },
  });
}
