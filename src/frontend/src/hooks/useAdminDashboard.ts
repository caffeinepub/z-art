import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ArtworkSubmission, PurchaseInquiry } from '../backend';

export function useGetAllSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ArtworkSubmission[]>({
    queryKey: ['allSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApproveSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveSubmission(submissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
}

export function useRejectSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectSubmission(submissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
    },
  });
}

export function useGetAllPurchaseInquiries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PurchaseInquiry[]>({
    queryKey: ['allInquiries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPurchaseInquiries();
    },
    enabled: !!actor && !actorFetching,
  });
}

