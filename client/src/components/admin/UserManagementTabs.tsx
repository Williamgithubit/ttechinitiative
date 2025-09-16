import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Chip,
  Tooltip,
  Avatar,
  TablePagination,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Grid from '@/components/ui/Grid';
import {
  Teacher,
  Student,
  Parent,
  Subject,
  Class
} from '@/services/userManagementService';

interface TeachersTabProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
}

interface StudentsTabProps {
  students: Student[];
  classes: Class[];
  parents: Parent[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
}

interface ParentsTabProps {
  parents: Parent[];
  students: Student[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEdit: (parent: Parent) => void;
  onDelete: (parentId: string) => void;
}

export const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  subjects,
  classes,
  isLoading,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const getSubjectNames = (subjectIds: string[]) => {
    return subjects
      .filter(subject => subjectIds.includes(subject.id))
      .map(subject => subject.name)
      .join(', ');
  };

  const getClassNames = (classIds: string[]) => {
    return classes
      .filter(cls => classIds.includes(cls.id))
      .map(cls => `${cls.name} ${cls.section}`)
      .join(', ');
  };

  return (
    <Box>
      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#000054' }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Teachers Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredTeachers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No teachers found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Subjects</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Classes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeachers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((teacher) => (
                    <TableRow key={teacher.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {teacher.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {teacher.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {teacher.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{teacher.employeeId}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" noWrap>
                          {getSubjectNames(teacher.subjects)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" noWrap>
                          {getClassNames(teacher.classes || [])}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={teacher.status}
                          color={teacher.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => onEdit(teacher)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => onDelete(teacher.id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTeachers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  classes,
  parents,
  isLoading,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const filteredStudents = React.useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} - Grade ${cls.grade} ${cls.section}` : 'Unknown';
  };

  const getParentNames = (parentIds: string[]) => {
    return parents
      .filter(parent => parentIds.includes(parent.id))
      .map(parent => parent.name)
      .join(', ');
  };

  return (
    <Box>
      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#000054' }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredStudents.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No students found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Class</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Parents</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2">
                          {getClassName(student.classId)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" noWrap>
                          {getParentNames(student.parentIds)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.status}
                          color={student.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => onEdit(student)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => onDelete(student.id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export const ParentsTab: React.FC<ParentsTabProps> = ({
  parents,
  students,
  isLoading,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const filteredParents = React.useMemo(() => {
    return parents.filter(parent =>
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [parents, searchTerm]);

  const getStudentNames = (studentIds: string[]) => {
    return students
      .filter(student => studentIds.includes(student.id))
      .map(student => student.name)
      .join(', ');
  };

  return (
    <Box>
      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#000054' }} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Parents Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredParents.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No parents found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Parent/Guardian</TableCell>
                  <TableCell>Relationship</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Students</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredParents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((parent) => (
                    <TableRow key={parent.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {parent.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {parent.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {parent.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={parent.relationship}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" noWrap>
                          {getStudentNames(parent.studentIds)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2">
                          {parent.phone || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={parent.status}
                          color={parent.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => onEdit(parent)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => onDelete(parent.id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredParents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
