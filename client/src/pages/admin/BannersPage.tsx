import { useState } from "react";
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  Banner,
} from "@/hooks/useBanners";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function BannersPage() {
  const { data: banners = [], isLoading } = useBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [showDialog, setShowDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    image_url: "",
    is_active: true,
    display_order: "0",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      link: banner.link || "",
      image_url: banner.image_url,
      is_active: banner.is_active,
      display_order: banner.display_order.toString(),
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete banner");
      }
    }
  };

  const isSubmitting = createBanner.isPending || updateBanner.isPending;

  // Remove handleImageUpload and refactor handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    if (formData.link) formDataToSend.append("link", formData.link);
    formDataToSend.append("is_active", String(formData.is_active));
    formDataToSend.append("display_order", formData.display_order);

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    } else if (formData.image_url) {
      formDataToSend.append("image_url", formData.image_url);
    }

    if (!imageFile && !formData.image_url && !editingBanner) {
      alert("Please upload an image");
      return;
    }

    try {
      if (editingBanner) {
        await updateBanner.mutateAsync({
          id: editingBanner.id,
          data: formDataToSend as any,
        });
      } else {
        await createBanner.mutateAsync(formDataToSend as any);
      }
      setShowDialog(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to save banner");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      link: "",
      image_url: "",
      is_active: true,
      display_order: "0",
    });
    setEditingBanner(null);
    setImageFile(null);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetForm();
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Banners
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage homepage promotional banners
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-lg border shadow-sm overflow-hidden"
          >
            {/* Banner Image */}
            <div className="relative w-full h-40">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Banner Info */}
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">{banner.title}</h3>

              {/* Order and Status */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  Order: {banner.display_order}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    banner.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {banner.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(banner)}
                  className="flex-1"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(banner.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden">
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {banner.title}
                    </TableCell>
                    <TableCell>{banner.display_order}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          banner.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(banner)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner" : "Add Banner"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.is_active.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="image">
                Image * {editingBanner && "(Upload new to replace)"}
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required={!editingBanner}
              />
              {formData.image_url && !imageFile && (
                <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
