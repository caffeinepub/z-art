import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ArtistProfile, PublicArtistProfile } from '../backend';

export function useArtists() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicArtistProfile[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArtistProfiles();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

export function useArtistById(artistId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: artists } = useArtists();

  return useQuery<PublicArtistProfile | null>({
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
  profileName: string;
  publicSiteUsername: string;
  bio: string;
  website: string;
}

export function useCreateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateArtistProfileParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createArtistProfile(
        params.profileName,
        params.publicSiteUsername,
        params.bio,
        params.website
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerArtistProfile'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.refetchQueries({ queryKey: ['callerArtistProfile'] });
      queryClient.refetchQueries({ queryKey: ['artists'] });
    },
  });
}

interface UpdateArtistProfileParams {
  profileName: string;
  publicSiteUsername: string;
  bio: string;
  website: string;
}

export function useUpdateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateArtistProfileParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateArtistProfile(
        params.profileName,
        params.publicSiteUsername,
        params.bio,
        params.website
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerArtistProfile'] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artwork'] });
      queryClient.refetchQueries({ queryKey: ['callerArtistProfile'] });
      queryClient.refetchQueries({ queryKey: ['artists'] });
      queryClient.refetchQueries({ queryKey: ['artworks'] });
    },
  });
}
