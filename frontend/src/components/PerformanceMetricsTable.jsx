import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

/**
 * PerformanceMetricsTable Component
 * 
 * Displays performance monitoring metrics in an organized table with:
 * - Sorting and filtering
 * - Pagination
 * - Summary statistics
 * - Export functionality
 * - Detailed metric view
 */

const PerformanceMetricsTable = () => {
  // State management
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Filters
  const [operationFilter, setOperationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch metrics
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (operationFilter) params.append('operation_type', operationFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`/api/performance-metrics/?${params.toString()}`);
      setMetrics(response.data.results || response.data);
      
      // Fetch summary stats
      const statsResponse = await axios.get('/api/performance-metrics/summary/');
      setStats(statsResponse.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchMetrics();
  }, [operationFilter, statusFilter, searchTerm]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open details dialog
  const handleOpenDetails = (metric) => {
    setSelectedMetric(metric);
    setDetailsOpen(true);
  };

  // Close details dialog
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedMetric(null);
  };

  // Open notes dialog
  const handleOpenNotes = (metric) => {
    setSelectedMetric(metric);
    setNoteText('');
    setNotesOpen(true);
  };

  // Add note to metric
  const handleAddNote = async () => {
    if (!selectedMetric || !noteText.trim()) return;

    try {
      await axios.post(
        `/api/performance-metrics/${selectedMetric.id}/add_note/`,
        { note: noteText }
      );
      setNotesOpen(false);
      fetchMetrics(); // Refresh data
    } catch (err) {
      alert('Error adding note: ' + err.message);
    }
  };

  // Export metrics
  const handleExport = (format) => {
    const url = `/api/performance-metrics/export/?format=${format}`;
    window.open(url, '_blank');
  };

  // Get badge color based on value
  const getStatusColor = (status) => {
    const colors = {
      completed: '#4caf50',
      valid: '#4caf50',
      verified: '#4caf50',
      invalid: '#f44336',
      failed: '#f44336',
    };
    return colors[status] || '#999999';
  };

  const getOperationColor = (operation) => {
    const colors = {
      'File Hashing': '#2196f3',
      'Key Generation': '#4caf50',
      'Signature Generation': '#ff9800',
      'Signature Verification': '#00bcd4',
      'Complete Workflow': '#9c27b0',
    };
    return colors[operation] || '#999999';
  };

  // Format milliseconds to readable string
  const formatTime = (ms) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  };

  // Paginated metrics
  const paginatedMetrics = metrics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && !metrics.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Metrics Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Monitor CPU, GPU, and memory usage during cryptographic operations
        </Typography>
      </Box>

      {/* Summary Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Operations
                </Typography>
                <Typography variant="h5">
                  {stats.total_operations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Time
                </Typography>
                <Typography variant="h5">
                  {stats.avg_elapsed_ms?.toFixed(2)}ms
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg CPU
                </Typography>
                <Typography variant="h5">
                  {stats.avg_cpu_percent?.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Memory Δ
                </Typography>
                <Typography variant="h5">
                  {stats.avg_memory_delta_mb?.toFixed(2)}MB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Size
                </Typography>
                <Typography variant="h5">
                  {stats.total_file_size_mb?.toFixed(1)}MB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Filename"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Operation Type"
          value={operationFilter}
          onChange={(e) => setOperationFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Operations</MenuItem>
          <MenuItem value="hash">File Hashing</MenuItem>
          <MenuItem value="keygen">Key Generation</MenuItem>
          <MenuItem value="sign">Signature Generation</MenuItem>
          <MenuItem value="verify">Signature Verification</MenuItem>
          <MenuItem value="workflow">Complete Workflow</MenuItem>
        </TextField>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="valid">Valid</MenuItem>
          <MenuItem value="verified">Verified</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchMetrics}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleExport('csv')}
          startIcon={<DownloadIcon />}
        >
          CSV
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleExport('json')}
          startIcon={<DownloadIcon />}
        >
          JSON
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Filename</strong></TableCell>
              <TableCell><strong>Operation</strong></TableCell>
              <TableCell align="right"><strong>Time (ms)</strong></TableCell>
              <TableCell align="right"><strong>CPU %</strong></TableCell>
              <TableCell align="right"><strong>Memory Δ (MB)</strong></TableCell>
              <TableCell align="right"><strong>Throughput (MB/s)</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMetrics.map((metric) => (
              <TableRow key={metric.id} hover>
                <TableCell>{metric.filename.substring(0, 30)}</TableCell>
                <TableCell>
                  <Chip
                    label={metric.operation_display}
                    size="small"
                    sx={{
                      backgroundColor: getOperationColor(metric.operation_display),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  {formatTime(metric.elapsed_ms)}
                </TableCell>
                <TableCell align="right">
                  {metric.cpu_process_percent.toFixed(1)}%
                </TableCell>
                <TableCell align="right">
                  {metric.memory_delta_mb.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {metric.throughput_mbs ? metric.throughput_mbs.toFixed(2) : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={metric.status.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(metric.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  {new Date(metric.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={() => handleOpenDetails(metric)}
                  >
                    Details
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenNotes(metric)}
                  >
                    Note
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={metrics.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Performance Metrics Details</DialogTitle>
        <DialogContent>
          {selectedMetric && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Basic Information</Typography>
                  <Typography>Filename: <strong>{selectedMetric.filename}</strong></Typography>
                  <Typography>Operation: <strong>{selectedMetric.operation_display}</strong></Typography>
                  <Typography>Date: <strong>{new Date(selectedMetric.created_at).toLocaleString()}</strong></Typography>
                  <Typography>Status: <strong>{selectedMetric.status}</strong></Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">CPU Metrics</Typography>
                  <Typography>Process CPU: {selectedMetric.cpu_process_percent.toFixed(2)}%</Typography>
                  <Typography>System CPU: {selectedMetric.cpu_system_percent.toFixed(2)}%</Typography>
                  <Typography>Threads: {selectedMetric.cpu_threads}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">Memory Metrics</Typography>
                  <Typography>Before: {selectedMetric.memory_before_mb.toFixed(2)}MB</Typography>
                  <Typography>After: {selectedMetric.memory_after_mb.toFixed(2)}MB</Typography>
                  <Typography>Delta: {selectedMetric.memory_delta_mb.toFixed(2)}MB</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">Execution</Typography>
                  <Typography>Time: {formatTime(selectedMetric.elapsed_ms)}</Typography>
                  <Typography>Throughput: {selectedMetric.throughput_mbs ? selectedMetric.throughput_mbs.toFixed(2) + ' MB/s' : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">GPU Metrics</Typography>
                  <Typography>Available: {selectedMetric.gpu_available ? 'Yes' : 'No'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesOpen} onClose={() => setNotesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note to Metric</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add any notes or observations..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">Add Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceMetricsTable;
