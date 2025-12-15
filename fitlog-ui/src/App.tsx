import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Workouts } from './pages/Workouts';
import { Nutrition } from './pages/Nutrition';
import { Supplements } from './pages/Supplements';
import { Profile } from './pages/Profile';
import { Calendar } from './pages/Calendar';
import { WorkoutMode } from './pages/WorkoutMode';
import { BodyTracking } from './pages/BodyTracking';
import { Goals } from './pages/Goals';
import { Achievements } from './pages/Achievements';
import { Settings } from './pages/Settings';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workout-mode" element={<WorkoutMode />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/supplements" element={<Supplements />} />
              <Route path="/body-tracking" element={<BodyTracking />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
