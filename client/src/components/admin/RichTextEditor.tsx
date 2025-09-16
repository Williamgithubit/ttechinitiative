import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as NumberListIcon,
  FormatQuote as QuoteIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Preview as PreviewIcon,
  Edit as EditIcon,
  PhotoLibrary as MediaLibraryIcon,
} from '@mui/icons-material';
import MediaLibrary from './MediaLibrary';
import { MediaFile } from '@/services/mediaService';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  showPreview?: boolean;
  allowMedia?: boolean;
}

interface LinkDialogData {
  text: string;
  url: string;
  openInNewTab: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 300,
  maxHeight = 600,
  showPreview = true,
  allowMedia = true,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [linkData, setLinkData] = useState<LinkDialogData>({
    text: '',
    url: '',
    openInNewTab: true,
  });
  const [formatMenuAnchor, setFormatMenuAnchor] = useState<null | HTMLElement>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Execute formatting command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle paste to clean up formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleContentChange();
  }, [handleContentChange]);

  // Insert link
  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    
    setLinkData({
      text: selectedText,
      url: '',
      openInNewTab: true,
    });
    setLinkDialogOpen(true);
  }, []);

  // Confirm link insertion
  const confirmLink = useCallback(() => {
    const { text, url, openInNewTab } = linkData;
    if (!url) return;

    const linkHtml = `<a href="${url}" ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${text || url}</a>`;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(range.createContextualFragment(linkHtml));
    } else {
      document.execCommand('insertHTML', false, linkHtml);
    }
    
    handleContentChange();
    setLinkDialogOpen(false);
    setLinkData({ text: '', url: '', openInNewTab: true });
  }, [linkData, handleContentChange]);

  // Insert media
  const insertMedia = useCallback((media: MediaFile) => {
    let mediaHtml = '';
    
    if (media.type === 'image') {
      mediaHtml = `<img src="${media.url}" alt="${media.alt || media.originalName}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
    } else if (media.type === 'video') {
      mediaHtml = `<video controls style="max-width: 100%; height: auto; margin: 10px 0;">
        <source src="${media.url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>`;
    } else if (media.type === 'audio') {
      mediaHtml = `<audio controls style="width: 100%; margin: 10px 0;">
        <source src="${media.url}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>`;
    } else {
      mediaHtml = `<a href="${media.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 8px 12px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; text-decoration: none; color: #333; margin: 10px 0;">
        📄 ${media.originalName}
      </a>`;
    }
    
    document.execCommand('insertHTML', false, mediaHtml);
    handleContentChange();
    setMediaLibraryOpen(false);
  }, [handleContentChange]);

  // Convert HTML to plain text for preview
  const getPlainTextPreview = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Render markdown-style preview
  const renderPreview = (html: string): string => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  const toolbarButtons = [
    {
      icon: <BoldIcon />,
      command: 'bold',
      tooltip: 'Bold (Ctrl+B)',
    },
    {
      icon: <ItalicIcon />,
      command: 'italic',
      tooltip: 'Italic (Ctrl+I)',
    },
    {
      icon: <UnderlineIcon />,
      command: 'underline',
      tooltip: 'Underline (Ctrl+U)',
    },
    'divider',
    {
      icon: <BulletListIcon />,
      command: 'insertUnorderedList',
      tooltip: 'Bullet List',
    },
    {
      icon: <NumberListIcon />,
      command: 'insertOrderedList',
      tooltip: 'Numbered List',
    },
    {
      icon: <QuoteIcon />,
      command: 'formatBlock',
      value: 'blockquote',
      tooltip: 'Quote',
    },
    'divider',
    {
      icon: <AlignLeftIcon />,
      command: 'justifyLeft',
      tooltip: 'Align Left',
    },
    {
      icon: <AlignCenterIcon />,
      command: 'justifyCenter',
      tooltip: 'Align Center',
    },
    {
      icon: <AlignRightIcon />,
      command: 'justifyRight',
      tooltip: 'Align Right',
    },
    'divider',
    {
      icon: <LinkIcon />,
      action: insertLink,
      tooltip: 'Insert Link',
    },
  ];

  if (allowMedia) {
    toolbarButtons.push({
      icon: <ImageIcon />,
      action: () => setMediaLibraryOpen(true),
      tooltip: 'Insert Media',
    });
  }

  toolbarButtons.push(
    'divider',
    {
      icon: <UndoIcon />,
      command: 'undo',
      tooltip: 'Undo (Ctrl+Z)',
    },
    {
      icon: <RedoIcon />,
      command: 'redo',
      tooltip: 'Redo (Ctrl+Y)',
    }
  );

  if (showPreview) {
    toolbarButtons.push(
      'divider',
      {
        icon: isPreviewMode ? <EditIcon /> : <PreviewIcon />,
        action: () => setIsPreviewMode(!isPreviewMode),
        tooltip: isPreviewMode ? 'Edit Mode' : 'Preview Mode',
      }
    );
  }

  return (
    <Box>
      <Paper elevation={1} sx={{ border: '1px solid', borderColor: 'divider' }}>
        {/* Toolbar */}
        <Toolbar variant="dense" sx={{ minHeight: 48, px: 1 }}>
          {toolbarButtons.map((button, index) => {
            if (button === 'divider') {
              return <Divider key={index} orientation="vertical" flexItem sx={{ mx: 0.5 }} />;
            }

            const btn = button as any;
            return (
              <Tooltip key={index} title={btn.tooltip}>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (btn.action) {
                      btn.action();
                    } else {
                      execCommand(btn.command, btn.value);
                    }
                  }}
                  sx={{ mx: 0.25 }}
                >
                  {btn.icon}
                </IconButton>
              </Tooltip>
            );
          })}
        </Toolbar>

        <Divider />

        {/* Editor/Preview Area */}
        <Box sx={{ position: 'relative' }}>
          {isPreviewMode ? (
            <Box
              sx={{
                p: 2,
                minHeight,
                maxHeight,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                backgroundColor: '#f8f9fa',
              }}
            >
              {renderPreview(value) || 'Nothing to preview...'}
            </Box>
          ) : (
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleContentChange}
              onPaste={handlePaste}
              dangerouslySetInnerHTML={{ __html: value }}
              sx={{
                p: 2,
                minHeight,
                maxHeight,
                overflow: 'auto',
                outline: 'none',
                '&:empty::before': {
                  content: `"${placeholder}"`,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '10px 0',
                },
                '& video, & audio': {
                  maxWidth: '100%',
                  display: 'block',
                  margin: '10px 0',
                },
                '& blockquote': {
                  borderLeft: '4px solid #E32845',
                  paddingLeft: '16px',
                  margin: '16px 0',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                },
                '& a': {
                  color: '#E32845',
                  textDecoration: 'underline',
                },
                '& ul, & ol': {
                  paddingLeft: '24px',
                },
                '& li': {
                  marginBottom: '4px',
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  color: '#000054',
                  fontWeight: 'bold',
                  margin: '16px 0 8px 0',
                },
                '& h1': { fontSize: '2rem' },
                '& h2': { fontSize: '1.5rem' },
                '& h3': { fontSize: '1.25rem' },
                '& p': {
                  margin: '8px 0',
                  lineHeight: 1.6,
                },
                '& code': {
                  backgroundColor: '#f5f5f5',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Link Text"
              value={linkData.text}
              onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="URL"
              value={linkData.url}
              onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
              margin="normal"
              placeholder="https://example.com"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={linkData.openInNewTab}
                  onChange={(e) => setLinkData({ ...linkData, openInNewTab: e.target.checked })}
                />
              }
              label="Open in new tab"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmLink} variant="contained" disabled={!linkData.url}>
            Insert Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Library Dialog */}
      {allowMedia && (
        <Dialog
          open={mediaLibraryOpen}
          onClose={() => setMediaLibraryOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <MediaLibraryIcon />
              Select Media
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <MediaLibrary
              selectionMode
              onSelectMedia={insertMedia}
              onCloseDialog={() => setMediaLibraryOpen(false)}
              allowedTypes={['image', 'video', 'audio', 'pdf', 'document']}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default RichTextEditor;
