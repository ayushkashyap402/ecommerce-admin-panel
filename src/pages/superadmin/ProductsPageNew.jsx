import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Pagination
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  CloudUpload,
  Close,
  Inventory,
  TrendingUp,
  Category,
  AttachMoney
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, deleteProduct, createProduct, updateProduct } from '../../store/products/productsSlice';
import { compressImagesToBase64, createPreviewUrl, revokePreviewUrl, validateImageFiles } from '../../utils/imageUtils';

export const ProductsPageNew = () => {
  const dispatch = useDispatch();
  const { list: products, loading } = useSelector((state) => state.products);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Debug: Log products to see what data we're getting
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('🔍 [Products Page] Products data:', products);
      console.log('🔍 [Products Page] First product:', products[0]);
    }
  }, [products]);

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
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images.map(url => ({ url, isExisting: true })));
    }
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id));
      dispatch(fetchProducts());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = { ...formData };
      if (selectedImages.length > 0) {
        productData.images = selectedImages;
      }
      
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id, ...productData })).unwrap();
      } else {
        await dispatch(createProduct(productData)).unwrap();
      }
      
      await dispatch(fetchProducts());
      handleCloseDialog();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validation = validateImageFiles(files, 10);
    if (!validation.valid) {
      alert('Image validation failed:\n' + validation.errors.join('\n'));
      e.target.value = '';
      return;
    }

    setImageLoading(true);
    try {
      const base64Images = await compressImagesToBase64(files, 1200, 1200, 0.85);
      setSelectedImages(base64Images);
      const previews = files.map(file => ({
        url: createPreviewUrl(file),
        isExisting: false
      }));
      setImagePreviews(previews);
    } catch (error) {
      console.error('Image processing error:', error);
      alert('Failed to process images. Please try again.');
      e.target.value = '';
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const preview = imagePreviews[index];
    if (!preview.isExisting) {
      revokePreviewUrl(preview.url);
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseDialog = () => {
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SuperAdmin: Calculate stats from ALL products in database
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stock < 10).length,
    totalValue: products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0)
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#111827', mb: 0.5 }}>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your product inventory and catalog
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <IconButton 
            onClick={() => dispatch(fetchProducts())}
            sx={{ 
              border: '1px solid #E5E7EB',
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <Refresh sx={{ color: '#6B7280' }} />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              bgcolor: '#00bd7d',
              color: '#FFFFFF',
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#00a56d' }
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Products
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#111827' }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Inventory sx={{ color: '#6366F1', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Active Products
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#111827' }}>
                    {stats.active}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: '#D1FAE5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingUp sx={{ color: '#10B981', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Low Stock
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#111827' }}>
                    {stats.lowStock}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Category sx={{ color: '#F59E0B', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Value
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#111827' }}>
                    ₹{stats.totalValue.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoney sx={{ color: '#3B82F6', fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
                '&:hover fieldset': {
                  borderColor: '#00bd7d',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00bd7d',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress sx={{ color: '#00bd7d' }} />
        </Box>
      ) : (
        <>
        <Grid container spacing={3}>
          {paginatedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #E5E7EB',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => {
                  setSelectedProduct(product);
                  setDetailDialogOpen(true);
                }}
              >
                {/* Product Image */}
                <Box
                  sx={{
                    height: 200,
                    bgcolor: '#F3F4F6',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <Inventory sx={{ fontSize: 64, color: '#9CA3AF' }} />
                    </Box>
                  )}
                  <Chip
                    label={product.status}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: product.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                      color: product.status === 'active' ? '#065F46' : '#991B1B',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      color: '#111827',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '1rem'
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: 40,
                      fontSize: '0.875rem'
                    }}
                  >
                    {product.description || 'No description'}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#00bd7d', fontSize: '1.125rem' }}>
                      ₹{product.price}
                    </Typography>
                    <Chip
                      label={`Stock: ${product.stock}`}
                      size="small"
                      sx={{
                        backgroundColor: product.stock < 10 ? '#FEF3C7' : '#E0E7FF',
                        color: product.stock < 10 ? '#92400E' : '#3730A3',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        sx={{ color: '#00bd7d' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product._id);
                        }}
                        sx={{ color: '#EF4444' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Seller Info */}
                  <Box display="flex" alignItems="center" gap={1} pt={1} mt="auto" borderTop="1px solid #E5E7EB">
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: '0.75rem',
                        bgcolor: product.createdByRole === 'superadmin' ? '#EF4444' : '#00bd7d',
                        fontWeight: 600
                      }}
                    >
                      {(product.createdByName || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6B7280',
                          fontSize: '0.7rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {product.createdByRole === 'superadmin' ? '👑 Super Admin' : `🏪 ${product.createdByName || 'Seller'}`}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 600
                },
                '& .Mui-selected': {
                  bgcolor: '#00bd7d !important',
                  color: '#FFFFFF'
                }
              }}
            />
          </Box>
        )}
        </>
      )}

      {/* Product Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Product Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedProduct && (
            <Box>
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <ImageList cols={3} gap={12}>
                    {selectedProduct.images.map((image, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={image}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          loading="lazy"
                          style={{ height: 200, objectFit: 'cover', borderRadius: 12 }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Product Name</Typography>
                  <Typography variant="h6" fontWeight={600}>{selectedProduct.name}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedProduct.description || 'No description'}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Price</Typography>
                  <Typography variant="h6" sx={{ color: '#00bd7d' }}>₹{selectedProduct.price}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Stock</Typography>
                  <Typography variant="h6">{selectedProduct.stock} units</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{selectedProduct.category}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={selectedProduct.status}
                      size="small"
                      sx={{
                        backgroundColor: selectedProduct.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                        color: selectedProduct.status === 'active' ? '#065F46' : '#991B1B',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Created By</Typography>
                  <Box display="flex" alignItems="center" gap={1.5} mt={1}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: selectedProduct.createdByRole === 'superadmin' ? '#EF4444' : '#00bd7d',
                        fontWeight: 600
                      }}
                    >
                      {(selectedProduct.createdByName || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedProduct.createdByName || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: selectedProduct.createdByRole === 'superadmin' ? '#EF4444' : '#00bd7d' }}>
                        {selectedProduct.createdByRole === 'superadmin' ? '👑 Super Admin' : '🏪 Seller'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {selectedProduct.createdAt && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Created At</Typography>
                    <Typography variant="body2">
                      {new Date(selectedProduct.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 2 }}>
          <Button onClick={() => setDetailDialogOpen(false)} sx={{ color: '#6B7280' }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              setDetailDialogOpen(false);
              handleEdit(selectedProduct);
            }}
            sx={{
              bgcolor: '#00bd7d',
              '&:hover': { bgcolor: '#00a56d' }
            }}
          >
            Edit Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #E5E7EB', pb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#00bd7d',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#00bd7d',
                },
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#00bd7d',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#00bd7d',
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#00bd7d',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#00bd7d',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#00bd7d',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#00bd7d',
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  margin="normal"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#00bd7d',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#00bd7d',
                    },
                  }}
                >
                  <MenuItem value="menswear">Men's Wear</MenuItem>
                  <MenuItem value="womenswear">Women's Wear</MenuItem>
                  <MenuItem value="kidswear">Kids Wear</MenuItem>
                  <MenuItem value="winterwear">Winter Wear</MenuItem>
                  <MenuItem value="summerwear">Summer Wear</MenuItem>
                  <MenuItem value="footwear">Footwear</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#00bd7d',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#00bd7d',
                    },
                  }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Product Images
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={imageLoading ? <CircularProgress size={20} /> : <CloudUpload />}
                disabled={imageLoading}
                fullWidth
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  borderColor: '#E5E7EB',
                  color: '#6B7280',
                  '&:hover': {
                    borderColor: '#00bd7d',
                    bgcolor: '#F9FAFB'
                  }
                }}
              >
                {imageLoading ? 'Processing Images...' : 'Upload Images'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                />
              </Button>

              {imagePreviews.length > 0 && (
                <ImageList cols={3} gap={12}>
                  {imagePreviews.map((preview, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        loading="lazy"
                        style={{ height: 150, objectFit: 'cover', borderRadius: 8 }}
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
          <DialogActions sx={{ borderTop: '1px solid #E5E7EB', p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#6B7280' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={imageLoading}
              sx={{
                bgcolor: '#00bd7d',
                '&:hover': { bgcolor: '#00a56d' }
              }}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
