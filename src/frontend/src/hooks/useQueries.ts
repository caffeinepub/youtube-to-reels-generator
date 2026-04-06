import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetAllClips() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["clips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateClip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
    }: {
      id: string;
      title: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const clip = await actor.createClip(id, title, description);
      const voiceoverScript = generateVoiceoverScript(description);
      const imageUrl = `https://picsum.photos/seed/${id}/400/250`;
      await actor.updateClipContent(clip.id, voiceoverScript, imageUrl);
      return clip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
    },
  });
}

export function useDeleteClip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteClip(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
    },
  });
}

function generateVoiceoverScript(description: string): string {
  const trimmed = description.trim();
  const sentences = trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
  return `In this clip, ${sentences} The scene unfolds as we explore ${lowercaseFirst(trimmed)}, drawing viewers into an immersive visual journey. This moment captures the essence of the story, leaving a lasting impression on the audience.`;
}

function lowercaseFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}
