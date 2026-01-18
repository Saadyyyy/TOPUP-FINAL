import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useBanners(activeOnly: boolean = false) {
  return useQuery<Banner[]>({
    queryKey: ["banners", activeOnly],
    queryFn: async () => {
      const params = activeOnly ? "?active=true" : "";
      const response = await api.get<any, { success: boolean; data: Banner[] }>(
        `/banners${params}`,
      );
      return response.data;
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Banner> | FormData) => {
      const response = await api.post("/banners", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Banner> | FormData;
    }) => {
      const response = await api.put(`/banners/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/banners/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}
