import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SidebarLayout from './pages/SidebarLayout';
import GoalPage from './pages/goal/GoalPage';
import SimulatorPage from './pages/simulator/SimulatorPage';
import CommunityPage from './pages/community/CommunityPage';
import PostDetailPage from './pages/community/PostDetailPage';
import AdminPage from './pages/admin/AdminPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <DashboardPage />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/goal"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <GoalPage />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulator"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <SimulatorPage />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <CommunityPage />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/community/:postId"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <PostDetailPage />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <SidebarLayout>
                <AdminPage />
              </SidebarLayout>
            </ProtectedRoute>
          }
        />


        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
