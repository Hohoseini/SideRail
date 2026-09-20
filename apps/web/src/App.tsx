import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { AppLayout } from "./components/layout/app-layout";
import { Spinner } from "./components/spinner";
import SetupPage from "./pages/setup";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users";
import InboundsPage from "./pages/inbounds";
import ActivityPage from "./pages/activity";
import SettingsPage from "./pages/settings";
import SubscriptionPage from "./pages/subscription";

function Protected({ children }: { children: React.ReactNode }) {
  const { ready, authed, needsSetup } = useAuth();
  const location = useLocation();
  if (!ready) return <FullscreenLoader />;
  if (needsSetup) return <Navigate to="/setup" replace />;
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function FullscreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export default function App() {
  const { ready, needsSetup, authed } = useAuth();

  return (
    <Routes>
      <Route path="/sub/:token/view" element={<SubscriptionPage />} />
      <Route path="/sub/:token" element={<SubscriptionPage />} />
      <Route
        path="/setup"
        element={
          !ready ? (
            <FullscreenLoader />
          ) : needsSetup ? (
            <SetupPage />
          ) : (
            <Navigate to={authed ? "/" : "/login"} replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          !ready ? (
            <FullscreenLoader />
          ) : needsSetup ? (
            <Navigate to="/setup" replace />
          ) : authed ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/inbounds" element={<InboundsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
