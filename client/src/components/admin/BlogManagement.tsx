import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  TablePagination,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import Grid from "@/components/ui/Grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Publish as PublishIcon,
  Drafts as DraftsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/services/firebase";
import {
  BlogPost,
  CreateBlogPostData,
  UpdateBlogPostData,
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogCategories,
  getBlogTags,
} from "@/services/blogService";
import RichTextEditor from "./RichTextEditor";

interface BlogManagementProps {
  openDialog?: boolean;
  onCloseDialog?: () => void;
}

const BlogManagement: React.FC<BlogManagementProps> = ({
  openDialog = false,
  onCloseDialog,
}) => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(openDialog);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Form state
  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    status: "draft",
    featured: false,
    seoTitle: "",
    seoDescription: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    loadPosts();
    loadCategories();
    loadTags();
  }, []);

  useEffect(() => {
    setDialogOpen(openDialog);
  }, [openDialog]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getBlogPosts({
        orderByField: "updatedAt",
        orderDirection: "desc",
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      setSnackbar({
        open: true,
        message: "Failed to load blog posts",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const fetchedCategories = await getBlogCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadTags = async () => {
    try {
      const fetchedTags = await getBlogTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  };

  const handleCreatePost = async () => {
    try {
      setIsSubmitting(true);
      await createBlogPost(
        formData,
        "admin-user-id", // Replace with actual admin user ID
        "Admin User", // Replace with actual admin name
        "admin@ttechinitiative.com" // Replace with actual admin email
      );

      toast.success("Blog post created successfully!", {
        duration: 4000,
        position: 'top-right',
      });

      handleCloseDialog();
      loadPosts();
      loadCategories();
      loadTags();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create blog post. Please try again.", {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      setIsSubmitting(true);
      const updateData: UpdateBlogPostData = {
        id: editingPost.id,
        ...formData,
      };

      await updateBlogPost(updateData);

      toast.success("Blog post updated successfully!", {
        duration: 4000,
        position: 'top-right',
      });

      handleCloseDialog();
      loadPosts();
      loadCategories();
      loadTags();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update blog post. Please try again.", {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await deleteBlogPost(postToDelete.id);

      toast.success("Blog post deleted successfully!", {
        duration: 4000,
        position: 'top-right',
      });

      setDeleteConfirmOpen(false);
      setPostToDelete(null);
      loadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete blog post. Please try again.", {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        category: post.category,
        tags: post.tags,
        status: post.status,
        featured: post.featured,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "",
        tags: [],
        status: "draft",
        featured: false,
        seoTitle: "",
        seoDescription: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    if (onCloseDialog) {
      onCloseDialog();
    }
  };

  const handleStatusChange = async (
    post: BlogPost,
    newStatus: BlogPost["status"]
  ) => {
    try {
      await updateBlogPost({
        id: post.id,
        status: newStatus,
      });

      setSnackbar({
        open: true,
        message: `Post ${
          newStatus === "published" ? "published" : "updated"
        } successfully`,
        severity: "success",
      });

      loadPosts();
    } catch (error) {
      console.error("Error updating post status:", error);
      setSnackbar({
        open: true,
        message: "Failed to update post status",
        severity: "error",
      });
    }
  };

  const getStatusColor = (status: BlogPost["status"]) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "default";
      case "review":
        return "warning";
      case "archived":
        return "error";
      default:
        return "default";
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const paginatedPosts = filteredPosts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading blog posts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: "bold",
            color: "#000054",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ArticleIcon />
          Blog Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: "#E32845",
            "&:hover": {
              backgroundColor: "#c41e3a",
            },
          }}
        >
          Create Post
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="review">Under Review</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredPosts.length} posts found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Posts Table/Cards */}
      {isMobile ? (
        // Mobile Card View
        <Grid container spacing={2}>
          {paginatedPosts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: "bold" }}
                    >
                      {post.title}
                    </Typography>
                    <Chip
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {post.excerpt}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {post.author.name.charAt(0)}
                    </Avatar>
                    <Typography variant="caption">
                      {post.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      •{" "}
                      {post.createdAt?.toDate?.()?.toLocaleDateString() ||
                        "Unknown date"}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(post)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleStatusChange(
                        post,
                        post.status === "published" ? "draft" : "published"
                      )
                    }
                  >
                    {post.status === "published" ? (
                      <DraftsIcon />
                    ) : (
                      <PublishIcon />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setPostToDelete(post);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPosts.map((post) => (
                <TableRow key={post.id} hover>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold" }}
                      >
                        {post.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.excerpt.substring(0, 100)}...
                      </Typography>
                      {post.featured && (
                        <Chip
                          label="Featured"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {post.author.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {post.author.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.category}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{post.views}</TableCell>
                  <TableCell>
                    {post.createdAt?.toDate?.()?.toLocaleDateString() ||
                      "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(post)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleStatusChange(
                            post,
                            post.status === "published" ? "draft" : "published"
                          )
                        }
                      >
                        {post.status === "published" ? (
                          <DraftsIcon />
                        ) : (
                          <PublishIcon />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setPostToDelete(post);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredPosts.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as BlogPost["status"],
                      })
                    }
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="review">Under Review</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Content *
                </Typography>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your blog post content here..."
                  minHeight={400}
                  allowMedia={true}
                  showPreview={true}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Featured Image URL"
                  value={formData.featuredImage || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, featuredImage: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
          <Button
            onClick={editingPost ? handleUpdatePost : handleCreatePost}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              backgroundColor: "#E32845",
              "&:hover": {
                backgroundColor: "#c41e3a",
              },
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                {editingPost ? "Updating..." : "Creating..."}
              </>
            ) : (
              editingPost ? "Update" : "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{postToDelete?.title}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePost} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* React Hot Toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Box>
  );
};

export default BlogManagement;
