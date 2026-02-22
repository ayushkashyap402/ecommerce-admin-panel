import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit, Delete, Add, CloudUpload, Close } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { productService } from '../../services/productService';
import { fetchProducts, deleteProduct, createProduct, updateProduct } from '../../store/products/productsSlice';
import { compressImagesToBase64, createPreviewUrl, revokePreviewUrl, validateImageFiles } from '../../utils/imageUtils';

export const ProductsPage = () => {
  const dispatch = useDispatch();
  const { list: products, loading, error } = useSelector((state) => state.products);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    status: 'active'
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleRowClick = (params) => {
    setSelectedProduct(params.row);
    setDetailDialogOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      status: product.status
    });
    // Set existing images as previews
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images.map(url => ({ url, isExisting: true })));
    }
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = { ...formData };
      
      // Add images if new ones are selected
      if (selectedImages.length > 0) {
        productData.images = selectedImages;
      }
      
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id, ...productData })).unwrap();
      } else {
        await dispatch(createProduct(productData)).unwrap();
      }
      
      // Refresh product list to get updated data with creator info
      await dispatch(fetchProducts());
      
      handleCloseDialog();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files first
    const validation = validateImageFiles(files, 10); // 10MB max per file
    if (!validation.valid) {
      alert('Image validation failed:\n' + validation.errors.join('\n'));
      e.target.value = ''; // Reset input
      return;
    }

    setImageLoading(true);
    try {
      // Compress and convert to base64
      const base64Images = await compressImagesToBase64(files, 1200, 1200, 0.85);
      
      setSelectedImages(base64Images);
      
      // Create previews
      const previews = files.map(file => ({
        url: createPreviewUrl(file),
        isExisting: false
      }));
      setImagePreviews(previews);
    } catch (error) {
      console.error('Image processing error:', error);
      alert('Failed to process images. Please try again.');
      e.target.value = ''; // Reset input
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const preview = imagePreviews[index];
    
    // Revoke preview URL if it's a new image
    if (!preview.isExisting) {
      revokePreviewUrl(preview.url);
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseDialog = () => {
    // Cleanup preview URLs
    imagePreviews.forEach(preview => {
      if (!preview.isExisting) {
        revokePreviewUrl(preview.url);
      }
    });
    
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: '', stock: '', status: 'active' });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const columns = [
    { 
      field: 'images', 
      headerName: 'Image', 
      width: 80,
      renderCell: (params) => (
        params.value && params.value.length > 0 ? (
          <Box
            component="img"
            src={params.value[0]}
            alt={params.row.name}
            sx={{
              width: 50,
              height: 50,
              objectFit: 'cover',
              borderRadius: 1,
              my: 0.5
            }}
          />
        ) : (
          <Box
            sx={{
              width: 50,
              height: 50,
              backgroundColor: '#f0f0f0',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              color: '#999'
            }}
          >
            No Image
          </Box>
        )
      )
    },
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'price', headerName: 'Price', width: 100, renderCell: (params) => `₹${params.value}` },
    { field: 'stock', headerName: 'Stock', width: 80, align: 'center', headerAlign: 'center' },
    { 
      field: 'createdBy', 
      headerName: 'Created By', 
      width: 180,
      renderCell: (params) => {
        const isSuperAdmin = params.row.createdByRole === 'superadmin';
        const creatorName = params.row.createdByName || 'Unknown';
        const displayName = isSuperAdmin ? 'Super Admin' : creatorName;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: isSuperAdmin ? '#f44336' : '#5e35b1',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: '2px solid',
                borderColor: isSuperAdmin ? '#d32f2f' : '#4527a0'
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: isSuperAdmin ? '#f44336' : '#5e35b1', 
                fontWeight: 600,
                fontSize: '0.7rem'
              }}>
                {isSuperAdmin ? '👑 SuperAdmin' : '👤 Admin'}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === 'active' ? '#4caf50' : '#f44336',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}
        >
          {params.value}
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row._id)}
        />,
      ],
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={(products || []).map((p) => ({ ...p, id: p._id || p.id }))}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          rowHeight={70}
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(124, 58, 237, 0.08)',
              },
            },
          }}
        />
      </Box>

      {/* Product Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Product Details
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <ImageList cols={3} gap={8} sx={{ maxHeight: 300 }}>
                    {selectedProduct.images.map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={image}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          loading="lazy"
                          style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* Product Info */}
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Product Name</Typography>
                  <Typography variant="h6">{selectedProduct.name}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedProduct.description || 'No description'}</Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                    <Typography variant="h6" color="primary">₹{selectedProduct.price}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Stock</Typography>
                    <Typography variant="h6">{selectedProduct.stock} units</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                    <Typography variant="body1">{selectedProduct.category}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        backgroundColor: selectedProduct.status === 'active' ? '#4caf50' : '#f44336',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.875rem',
                        mt: 0.5,
                      }}
                    >
                      {selectedProduct.status}
                    </Box>
                  </Box>
                </Box>

                {selectedProduct.createdAt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                    <Typography variant="body2">
                      {new Date(selectedProduct.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<Edit />}
            onClick={() => {
              setDetailDialogOpen(false);
              handleEdit(selectedProduct);
            }}
          >
            Edit Product
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="menswear">Men's Wear</MenuItem>
              <MenuItem value="womenswear">Women's Wear</MenuItem>
              <MenuItem value="kidswear">Kids Wear</MenuItem>
              <MenuItem value="winterwear">Winter Wear</MenuItem>
              <MenuItem value="summerwear">Summer Wear</MenuItem>
              <MenuItem value="footwear">Footwear</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            {/* Image Upload Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Product Images
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={imageLoading ? <CircularProgress size={20} /> : <CloudUpload />}
                disabled={imageLoading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {imageLoading ? 'Processing Images...' : 'Upload Images (JPG, JPEG, PNG, WebP, GIF)'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                />
              </Button>

              {imagePreviews.length > 0 && (
                <ImageList cols={3} gap={8} sx={{ maxHeight: 300 }}>
                  {imagePreviews.map((preview, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        loading="lazy"
                        style={{ height: 150, objectFit: 'cover' }}
                      />
                      <ImageListItemBar
                        actionIcon={
                          <IconButton
                            sx={{ color: 'white' }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Close />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={imageLoading}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
