import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Product {
  id: number;
  category_id: number | null;
  name: string;
  price: number;
  box: string | null;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProducts(
  categoryId?: number | null,
  activeOnly: boolean = false,
  page: number = 1,
  limit: number = 10,
  search?: string,
) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", categoryId, activeOnly, page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.append("category_id", categoryId.toString());
      if (activeOnly) params.append("active", "true");
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const response = await api.get(`/products?${params.toString()}`);
      return response as unknown as PaginatedResponse<Product>;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product> | FormData) => {
      const response = await api.post("/products", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Product> | FormData;
    }) => {
      const response = await api.put(`/products/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/products/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
