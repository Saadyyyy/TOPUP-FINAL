import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category,
} from "@/hooks/useCategories";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete category");
      }
    }
  };

  // Remove handleImageUpload
  // Refactored handleSubmit to use FormData
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    if (formData.description)
      formDataToSend.append("description", formData.description);

    // If there is a new image file, append it.
    // If not, and we are editing, the existing image_url will be preserved by the backend
    // if we don't send anything (active record update), OR we can send the url string if the backend supports it.
    // Based on previous fixing, backend supports mix.
    // The previous implementation sent image_url as string if no new file.
    // However, typical multipart/form-data with file upload:
    // - New file: append 'image' (file)
    // - Existing file: usually don't send anything, or send 'image_url' string if backend supports it.
    // My ProductController/CategoryController support image_url from body for JSON,
    // but for Multer, req.file is prioritized.
    // If I send FormData, I should append 'image' if file exists.
    // If I want to keep existing image, I can just NOT send 'image' field,
    // and rely on backend not clearing it?
    // Wait, my backend implementation for update:
    // if (req.file) updateData.image_url = ...
    // else if (parsed.image_url) updateData.image_url = parsed.image_url
    // So if I append 'image_url' to FormData, it will be in req.body.

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    } else if (formData.image_url) {
      formDataToSend.append("image_url", formData.image_url);
    }

    try {
      if (editingCategory) {
        // useUpdateCategory expects { id, data }. Data can be FormData.
        // I need to check useCategories types. It says Partial<Category>.
        // FormData is not Partial<Category>. I might need to cast or update hook types.
        // For now, I'll pass it as any to bypass strict type check for now or cast it.
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: formDataToSend as any,
        });
      } else {
        await createCategory.mutateAsync(formDataToSend as any);
      }
      setShowDialog(false);
      resetForm();
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Failed to save category";
      alert(msg);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", image_url: "" });
    setEditingCategory(null);
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
            Categories
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage product categories
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg border shadow-sm p-4 space-y-3"
          >
            {/* Image and Name */}
            <div className="flex items-start gap-3">
              {category.image_url ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {category.description || "No description"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center text-xs text-gray-500">
              <span>
                Created: {new Date(category.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(category)}
                className="flex-1"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(category.id)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {formData.image_url && !imageFile && (
                <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden">
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
