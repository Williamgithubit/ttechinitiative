import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as CertificateIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import {
  performGlobalSearch,
  getRecentSearches,
  saveRecentSearch,
  SearchResult,
} from '@/services/globalSearchService';

interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
  placeholder = "Search users, programs, events...",
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      // Use real search service instead of mock data
      const searchResults = await performGlobalSearch(searchQuery, {
        limit: 10,
        includeInactive: false,
      });
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  useEffect(() => {
    // Load recent searches using the service
    const recent = getRecentSearches();
    setRecentSearches(recent);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setOpen(value.length > 0 || recentSearches.length > 0);
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(query.length > 0 || recentSearches.length > 0);
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches using the service
    if (query.trim()) {
      saveRecentSearch(query);
      const updated = getRecentSearches();
      setRecentSearches(updated);
    }

    setOpen(false);
    setQuery('');
    
    if (onResultClick) {
      onResultClick(result);
    }
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    performSearch(recentQuery);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return <PersonIcon />;
      case 'program':
        return <SchoolIcon />;
      case 'event':
        return <EventIcon />;
      case 'admission':
        return <AssignmentIcon />;
      case 'certificate':
        return <CertificateIcon />;
      case 'report':
        return <ArticleIcon />;
      case 'setting':
        return <SettingsIcon />;
      default:
        return <SearchIcon />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return '#000054';
      case 'program':
        return '#E32845';
      case 'event':
        return '#4CAF50';
      case 'admission':
        return '#FF9800';
      case 'certificate':
        return '#9C27B0';
      case 'report':
        return '#2196F3';
      case 'setting':
        return '#607D8B';
      default:
        return '#757575';
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'white',
              py: 0.5,
              '& .MuiOutlinedInput-input': {
                py: 1,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 84, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 84, 0.4)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000054',
              },
            },
          }}
        />

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.clientWidth, zIndex: 1300 }}
        >
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
              border: '1px solid rgba(0, 0, 84, 0.1)',
            }}
          >
            {loading ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Searching...
                </Typography>
              </Box>
            ) : (
              <>
                {query.length === 0 && recentSearches.length > 0 && (
                  <>
                    <Box sx={{ p: 2, pb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Recent Searches
                      </Typography>
                    </Box>
                    <List dense>
                      {recentSearches.map((recentQuery, index) => (
                        <ListItemButton
                          key={index}
                          onClick={() => handleRecentSearchClick(recentQuery)}
                        >
                          <ListItemIcon>
                            <HistoryIcon color="action" />
                          </ListItemIcon>
                          <ListItemText primary={recentQuery} />
                        </ListItemButton>
                      ))}
                    </List>
                  </>
                )}

                {query.length > 0 && (
                  <>
                    {results.length > 0 ? (
                      <>
                        <Box sx={{ p: 2, pb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Search Results ({results.length})
                          </Typography>
                        </Box>
                        <List dense>
                          {results.map((result, index) => (
                            <React.Fragment key={result.id}>
                              <ListItemButton
                                onClick={() => handleResultClick(result)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 84, 0.05)',
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ color: getTypeColor(result.type) }}>
                                  {getTypeIcon(result.type)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {result.title}
                                      </Typography>
                                      <Chip
                                        label={result.type}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.65rem',
                                          borderColor: getTypeColor(result.type),
                                          color: getTypeColor(result.type),
                                        }}
                                      />
                                    </Box>
                                  }
                                  secondary={result.subtitle}
                                />
                              </ListItemButton>
                              {index < results.length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      </>
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No results found for "{query}"
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default GlobalSearch;
