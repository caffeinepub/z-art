import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ArtistProfile } from '../backend';

export function useArtists() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArtistProfiles();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000, // Cache for 30 seconds to prevent unnecessary refetches
  });
}

export function useArtistById(artistId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: artists } = useArtists();

  return useQuery<ArtistProfile | null>({
    queryKey: ['artist', artistId.toString()],
    queryFn: async () => {
      if (!artists) return null;
      return artists.find((artist) => artist.id === artistId) || null;
    },
    enabled: !!actor && !actorFetching && !!artists,
  });
}

export function useGetCallerArtistProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<ArtistProfile | null>({
    queryKey: ['callerArtistProfile'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getArtistProfileByCaller();
      } catch (error) {
        // User doesn't have an artist profile yet
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

interface CreateArtistProfileParams {
  name: string;
  bio: string;
  website: string;
}

export function useCreateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateArtistProfileParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createArtistProfile(params.name, params.bio, params.website);
    },
    onSuccess: () => {
      // Invalidate both the caller's artist profile and the full artists list
      queryClient.invalidateQueries({ queryKey: ['callerArtistProfile'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.refetchQueries({ queryKey: ['callerArtistProfile'] });
      queryClient.refetchQueries({ queryKey: ['artists'] });
    },
  });
}
