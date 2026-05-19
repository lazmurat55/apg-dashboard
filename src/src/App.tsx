import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import MainApp from "@/pages/MainApp";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient();

function AppInner() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.isSuperManager || user.schichtleiterRole) return <Dashboard />;
  return <MainApp />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </QueryClientProvider>
  );
}
