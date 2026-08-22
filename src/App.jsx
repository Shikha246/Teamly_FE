import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import SetupAdmin from './pages/SetupAdmin';
import Unauthorized from './pages/Unauthorized';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TeamMembers from './pages/TeamMembers';
import TaskDetail from './pages/TaskDetail';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import ProjectDetail from './pages/ProjectDetail';
import NotFound from './pages/NotFound';
import AdminTaskDetail from './pages/AdminTaskDetail';
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/member/dashboard"
            element={
              <PrivateRoute allowedRoles={['member']}>
                <MemberDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/admin/team"
              element={
                  <PrivateRoute allowedRoles={['admin']}>
      <TeamMembers />
    </PrivateRoute>
  }
/>
    <Route
  path="/admin/projects/:id"
  element={
    <PrivateRoute allowedRoles={['admin']}>
      <ProjectDetail />
    </PrivateRoute>
  }
/>

    <Route
  path="/member/tasks/:id"
  element={
    <PrivateRoute allowedRoles={['member']}>
      <TaskDetail />
    </PrivateRoute>
  }
/>
<Route
  path="/admin/tasks/:id"
  element={
    <PrivateRoute allowedRoles={['admin']}>
      <AdminTaskDetail />
    </PrivateRoute>
  }
/>

        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;