import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import AppRoutes from "./routes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <AppRoutes />
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
