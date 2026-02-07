import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useReplaceDataset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.replaceDataset();
    },
    onSuccess: () => {
      // Invalidate all data-related queries to refresh views
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['allInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['artistProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
