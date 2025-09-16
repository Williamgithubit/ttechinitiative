import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardMedia,
  CardContent,
  CardActions,
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
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  MoreVert as MoreIcon,
  PhotoLibrary as MediaIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/services/firebase';
import {
  MediaFile,
  UploadMediaData,
  UpdateMediaData,
  MediaFilters,
  uploadMediaFile,
  getMediaFiles,
  updateMediaFile,
  deleteMediaFile,
  getMediaFolders,
  getMediaTags,
  getStorageStats,
  formatFileSize,
  isSupportedFileType,
  getMaxFileSize,
} from '@/services/mediaService';

interface MediaLibraryProps {
  openDialog?: boolean;
  onCloseDialog?: () => void;
  onSelectMedia?: (media: MediaFile) => void;
  selectionMode?: boolean;
  allowedTypes?: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
  </div>
);

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  openDialog = false,
  onCloseDialog,
  onSelectMedia,
  selectionMode = false,
  allowedTypes = [],
}) => {
  const [user] = useAuthState(auth);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(openDialog);
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MediaFilters>({});
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuMedia, setMenuMedia] = useState<MediaFile | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Form state
  const [uploadData, setUploadData] = useState<Partial<UploadMediaData>>({
    folder: 'general',
    alt: '',
    caption: '',
    tags: [],
  });

  const [editData, setEditData] = useState<Partial<UpdateMediaData>>({
    alt: '',
    caption: '',
    tags: [],
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadMediaFiles();
    loadFolders();
    loadTags();
    loadStorageStats();
  }, [filters]);

  useEffect(() => {
    setDialogOpen(openDialog);
  }, [openDialog]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      const files = await getMediaFiles(filters);
      setMediaFiles(files);
    } catch (error) {
      console.error('Error loading media files:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load media files',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const fetchedFolders = await getMediaFolders();
      setFolders(fetchedFolders);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadTags = async () => {
    try {
      const fetchedTags = await getMediaTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    const file = files[0];
    if (!isSupportedFileType(file)) {
      setSnackbar({
        open: true,
        message: 'File type not supported',
        severity: 'error',
      });
      return;
    }

    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      setSnackbar({
        open: true,
        message: `File size exceeds ${formatFileSize(maxSize)} limit`,
        severity: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadMediaData: UploadMediaData = {
        file,
        folder: uploadData.folder || 'general',
        alt: uploadData.alt || '',
        caption: uploadData.caption || '',
        tags: uploadData.tags || [],
      };

      await uploadMediaFile(
        uploadMediaData,
        user.uid,
        user.displayName || user.email || 'Unknown'
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success',
      });

      // Reset form
      setUploadData({
        folder: 'general',
        alt: '',
        caption: '',
        tags: [],
      });

      // Reload data
      loadMediaFiles();
      loadFolders();
      loadTags();
      loadStorageStats();
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload file',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdateMedia = async () => {
    if (!editingMedia) return;

    try {
      const updateMediaData: UpdateMediaData = {
        id: editingMedia.id,
        alt: editData.alt,
        caption: editData.caption,
        tags: editData.tags,
      };

      await updateMediaFile(updateMediaData);

      setSnackbar({
        open: true,
        message: 'Media updated successfully',
        severity: 'success',
      });

      setEditingMedia(null);
      loadMediaFiles();
      loadTags();
    } catch (error) {
      console.error('Error updating media:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update media',
        severity: 'error',
      });
    }
  };

  const handleDeleteMedia = async () => {
    if (!mediaToDelete) return;

    try {
      await deleteMediaFile(mediaToDelete);

      setSnackbar({
        open: true,
        message: 'Media deleted successfully',
        severity: 'success',
      });

      setDeleteConfirmOpen(false);
      setMediaToDelete(null);
      loadMediaFiles();
      loadStorageStats();
    } catch (error) {
      console.error('Error deleting media:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete media',
        severity: 'error',
      });
    }
  };

  const handleMediaSelect = (media: MediaFile) => {
    if (selectionMode && onSelectMedia) {
      onSelectMedia(media);
      handleCloseDialog();
    } else {
      setSelectedMedia(media);
      setInfoDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    if (onCloseDialog) {
      onCloseDialog();
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSnackbar({
      open: true,
      message: 'URL copied to clipboard',
      severity: 'success',
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoIcon />;
      case 'audio':
        return <AudioIcon />;
      case 'pdf':
        return <PdfIcon />;
      case 'document':
        return <DocumentIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const filteredMediaFiles = mediaFiles.filter((media) => {
    const matchesSearch = media.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         media.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (media.alt && media.alt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (media.caption && media.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = allowedTypes.length === 0 || allowedTypes.includes(media.type);
    
    return matchesSearch && matchesType;
  });

  const filesByType = {
    all: filteredMediaFiles,
    image: filteredMediaFiles.filter(f => f.type === 'image'),
    video: filteredMediaFiles.filter(f => f.type === 'video'),
    audio: filteredMediaFiles.filter(f => f.type === 'audio'),
    document: filteredMediaFiles.filter(f => ['pdf', 'document', 'spreadsheet'].includes(f.type)),
    other: filteredMediaFiles.filter(f => f.type === 'other'),
  };

  const currentFiles = Object.values(filesByType)[currentTab] || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading media library...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" sx={{ 
          fontWeight: 'bold', 
          color: '#000054',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <MediaIcon />
          Media Library
        </Typography>
        <Box display="flex" gap={1}>
          <input
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading}
              sx={{
                backgroundColor: '#E32845',
                '&:hover': {
                  backgroundColor: '#c41e3a',
                },
              }}
            >
              Upload
            </Button>
          </label>
          <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary">
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Search and Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Folder</InputLabel>
              <Select
                value={filters.folder || 'all'}
                onChange={(e) => setFilters({ ...filters, folder: e.target.value === 'all' ? undefined : e.target.value })}
                label="Folder"
              >
                <MenuItem value="all">All Folders</MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder} value={folder}>
                    {folder}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              {currentFiles.length} files
              {storageStats && ` • ${formatFileSize(storageStats.totalSize)} used`}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* File Type Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={
              <Badge badgeContent={filesByType.all.length} color="primary">
                All Files
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={filesByType.image.length} color="primary">
                Images
              </Badge>
            } 
            icon={<ImageIcon />} 
          />
          <Tab 
            label={
              <Badge badgeContent={filesByType.video.length} color="primary">
                Videos
              </Badge>
            } 
            icon={<VideoIcon />} 
          />
          <Tab 
            label={
              <Badge badgeContent={filesByType.audio.length} color="primary">
                Audio
              </Badge>
            } 
            icon={<AudioIcon />} 
          />
          <Tab 
            label={
              <Badge badgeContent={filesByType.document.length} color="primary">
                Documents
              </Badge>
            } 
            icon={<DocumentIcon />} 
          />
          <Tab 
            label={
              <Badge badgeContent={filesByType.other.length} color="primary">
                Other
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Media Grid/List */}
      <TabPanel value={currentTab} index={currentTab}>
        {currentFiles.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <MediaIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No media files found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload some files to get started
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {currentFiles.map((media) => (
              <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 3 : 12} key={media.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => handleMediaSelect(media)}
                >
                  {media.type === 'image' ? (
                    <CardMedia
                      component="img"
                      height={viewMode === 'grid' ? 200 : 100}
                      image={media.url}
                      alt={media.alt || media.originalName}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: viewMode === 'grid' ? 200 : 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.100',
                      }}
                    >
                      {getFileIcon(media.type)}
                    </Box>
                  )}
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {media.originalName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(media.size)} • {media.uploadedAt?.toDate?.()?.toLocaleDateString()}
                    </Typography>
                    {media.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {media.tags.slice(0, 2).map((tag) => (
                          <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                        {media.tags.length > 2 && (
                          <Chip label={`+${media.tags.length - 2}`} size="small" />
                        )}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {media.uploadedByName.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {media.uploadedByName}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnchorEl(e.currentTarget);
                        setMenuMedia(media);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (menuMedia) handleCopyUrl(menuMedia.url);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy URL</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuMedia) {
              setEditingMedia(menuMedia);
              setEditData({
                alt: menuMedia.alt,
                caption: menuMedia.caption,
                tags: menuMedia.tags,
              });
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuMedia) {
              const link = document.createElement('a');
              link.href = menuMedia.url;
              link.download = menuMedia.originalName;
              link.click();
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (menuMedia) {
              setMediaToDelete(menuMedia);
              setDeleteConfirmOpen(true);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Media Dialog */}
      <Dialog open={Boolean(editingMedia)} onClose={() => setEditingMedia(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Media</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alt Text"
                  value={editData.alt || ''}
                  onChange={(e) => setEditData({ ...editData, alt: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Caption"
                  value={editData.caption || ''}
                  onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  value={editData.tags?.join(', ') || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                  })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingMedia(null)}>Cancel</Button>
          <Button onClick={handleUpdateMedia} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Media Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Media Information</DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || selectedMedia.originalName}
                    style={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'grey.100',
                      borderRadius: 1,
                    }}
                  >
                    {getFileIcon(selectedMedia.type)}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {selectedMedia.originalName}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Type:</strong> {selectedMedia.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Size:</strong> {formatFileSize(selectedMedia.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Folder:</strong> {selectedMedia.folder}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Uploaded by:</strong> {selectedMedia.uploadedByName}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Uploaded:</strong> {selectedMedia.uploadedAt?.toDate?.()?.toLocaleString()}
                </Typography>
                {selectedMedia.alt && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Alt Text:</strong> {selectedMedia.alt}
                  </Typography>
                )}
                {selectedMedia.caption && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Caption:</strong> {selectedMedia.caption}
                  </Typography>
                )}
                {selectedMedia.tags.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Tags:</strong>
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {selectedMedia.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
          {selectionMode && selectedMedia && (
            <Button 
              onClick={() => {
                if (onSelectMedia) onSelectMedia(selectedMedia);
                handleCloseDialog();
              }}
              variant="contained"
            >
              Select
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{mediaToDelete?.originalName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteMedia} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MediaLibrary;
