import { useState, useEffect } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  Product,
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  Download,
  Search,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: productsResponse, isLoading } = useProducts(
    undefined,
    false,
    currentPage,
    limit,
    debouncedSearch,
  );
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    box: "",
    category_id: "",
    description: "",
    image_url: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Import dialog state
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      box: product.box || "",
      category_id: product.category_id?.toString() || "",
      description: product.description || "",
      image_url: product.image_url || "",
      is_active: product.is_active,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  // Remove handleImageUpload and refactor handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    if (formData.box) formDataToSend.append("box", formData.box);
    if (formData.category_id)
      formDataToSend.append("category_id", formData.category_id);
    if (formData.description)
      formDataToSend.append("description", formData.description);
    formDataToSend.append("is_active", String(formData.is_active));

    // image handling
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    } else if (formData.image_url) {
      formDataToSend.append("image_url", formData.image_url);
    }

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          data: formDataToSend as any,
        });
      } else {
        await createProduct.mutateAsync(formDataToSend as any);
      }
      setShowDialog(false);
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to save product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      box: "",
      category_id: "",
      description: "",
      image_url: "",
      is_active: true,
    });
    setEditingProduct(null);
    setImageFile(null);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetForm();
  };

  // Download Excel template
  const handleDownloadTemplate = async () => {
    try {
      // Dynamic import to avoid loading large library initially if possible,
      // but in Vite usually handled by bundler.
      const XLSX = await import("xlsx");

      // Create template data
      const templateData = [
        {
          name: "Example Product",
          price: 10000,
          box: "10 + 25 + 40",
        },
      ];

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");

      // Download file
      XLSX.writeFile(wb, "product_import_template.xlsx");
    } catch (error) {
      alert("Failed to download template");
    }
  };

  // Handle import file change
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      e.target.value = "";
      return;
    }

    setImportFile(file);
    setImportResults(null);
  };

  // Handle import submission
  const handleImportSubmit = async () => {
    if (!importFile) {
      alert("Please select a file to import");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await api.post("/products/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImportResults(response.data.results);

      // Refresh products list
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to import products");
    } finally {
      setImporting(false);
    }
  };

  // Close import dialog
  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setImportFile(null);
    setImportResults(null);
  };

  // if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Products
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your topup products
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products..."
              className="pl-8 pr-8 w-full sm:w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoading && (
              <div className="absolute right-2.5 top-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            )}
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          {/* <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button> */}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg border shadow-sm p-4 space-y-3"
          >
            {/* Image and Name */}
            <div className="flex items-start gap-3">
              {product.image_url ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={product.image_url}
                    alt={product.name}
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
                  {product.name}
                </h3>
                {product.box && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Box: {product.box}
                  </p>
                )}
                <p className="text-lg font-bold text-cyan-600 mt-1">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Category and Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                {categories.find((c) => c.id === product.category_id)?.name ||
                  "No category"}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  product.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {product.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(product)}
                className="flex-1"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(product.id)}
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
      <div className="hidden md:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Box</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
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
                      {product.name}
                    </TableCell>
                    <TableCell>{product.box}</TableCell>
                    <TableCell>
                      Rp {product.price.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {categories.find((c) => c.id === product.category_id)
                        ?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {pagination.totalPages} ({pagination.total}{" "}
              total)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="box">Box Quantity</Label>
                <Input
                  id="box"
                  type="text"
                  value={formData.box}
                  onChange={(e) =>
                    setFormData({ ...formData, box: e.target.value })
                  }
                  placeholder="e.g., 10 + 25 + 40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={handleCloseImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Products from Excel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Download Template */}
            <div>
              <Label>1. Download Template</Label>
              <p className="text-sm text-gray-600 mb-2">
                Download the Excel template to see the required format
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* Upload File */}
            <div>
              <Label htmlFor="importFile">2. Upload Excel File</Label>
              <p className="text-sm text-gray-600 mb-2">
                Only .xlsx and .xls files are allowed
              </p>
              <Input
                id="importFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFileChange}
                disabled={importing}
              />
              {importFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Selected: {importFile.name}
                </p>
              )}
            </div>

            {/* Import Results */}
            {importResults && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Import Results:</h4>
                <div className="text-sm">
                  <p className="text-green-600">
                    ✓ Success: {importResults.success} products
                  </p>
                  {importResults.failed > 0 && (
                    <>
                      <p className="text-red-600">
                        ✗ Failed: {importResults.failed} products
                      </p>
                      {importResults.errors.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <p className="font-semibold">Errors:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {importResults.errors.map(
                              (error: string, idx: number) => (
                                <li key={idx} className="text-xs text-red-600">
                                  {error}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseImportDialog}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportSubmit}
                disabled={!importFile || importing}
              >
                {importing ? "Importing..." : "Import Products"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
