import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { SettingsProvider, useSettings } from './store/SettingsContext';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { ConfirmProvider } from './components/ConfirmProvider';
import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { OnboardingTour } from './components/OnboardingTour';
import { Admin } from './pages/Admin';
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
import { Coach } from './pages/Coach';
import { Progress } from './pages/Progress';
import { SessionSummary } from './pages/SessionSummary';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import './styles/globals.css';

/** Logged-in users carry their language in account settings; apply it once settings load. */
function LanguageSync() {
  const { settings, loaded } = useSettings();
  const { setLang } = useI18n();
  useEffect(() => {
    if (loaded) setLang(settings.language);
  }, [loaded, settings.language, setLang]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
    <I18nProvider>
    <AuthProvider>
    <SettingsProvider>
    <ConfirmProvider>
      <BrowserRouter>
        <LanguageSync />
        <Navbar />
        <OnboardingTour />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/workout-mode" element={<WorkoutMode />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/share/:id" element={<SessionSummary />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/supplements" element={<Supplements />} />
              <Route path="/body-tracking" element={<BodyTracking />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </ConfirmProvider>
    </SettingsProvider>
    </AuthProvider>
    </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
