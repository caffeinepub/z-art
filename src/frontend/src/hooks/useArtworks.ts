import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublicArtwork } from '../backend';

export function useArtworks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicArtwork[]>({
    queryKey: ['artworks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArtworks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useArtworkById(artworkId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicArtwork | null>({
    queryKey: ['artwork', artworkId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getArtworkById(artworkId);
      } catch (error) {
        console.error('Error fetching artwork:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
