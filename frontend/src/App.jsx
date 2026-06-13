import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';
import Navbar from './components/Navbar';
import PrivateRoute from './routes/PrivateRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotesPage from './pages/NotesPage';
import TestsPage from './pages/TestsPage';
import TestAttemptPage from './pages/TestAttemptPage';
import ResultsPage from './pages/ResultsPage';
import ResultDetailPage from './pages/ResultDetailPage';
import AdminUploadNotesPage from './pages/AdminUploadNotesPage';
import AdminNotesPage from './pages/AdminNotesPage';
import AdminTestsPage from './pages/AdminTestsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminResultsPage from './pages/AdminResultsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

/**
 * Material-UI Theme Configuration
 */
const AppShell = () => {
  const { mode } = useThemeMode();

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#7c3aed',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#22d3ee',
      },
      background: {
        default: mode === 'dark' ? '#040b1d' : '#eef2ff',
        paper: mode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e2e8f0' : '#111827',
        secondary: mode === 'dark' ? '#94a3b8' : '#475569',
      },
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      button: {
        textTransform: 'none',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(18px)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: '0 24px 60px rgba(7, 19, 50, 0.16)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            boxShadow: '0 14px 32px rgba(124, 58, 237, 0.18)',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/user/dashboard"
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/notes"
              element={
                <PrivateRoute>
                  <NotesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/tests"
              element={
                <PrivateRoute>
                  <TestsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/tests/:id"
              element={
                <PrivateRoute>
                  <TestAttemptPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/results"
              element={
                <PrivateRoute>
                  <ResultsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/results/:id"
              element={
                <PrivateRoute>
                  <ResultDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/upload-notes"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminUploadNotesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/notes"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminNotesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tests"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminTestsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminUsersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/results"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminResultsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <PrivateRoute requiredRole="admin">
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute requiredRole="admin">
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

/**
 * App Component
 * Main routing and theme provider
 */
function App() {
  return (
    <ThemeModeProvider>
      <AppShell />
    </ThemeModeProvider>
  );
}

export default App;
