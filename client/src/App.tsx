import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { AppRoutes } from "./routes";

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        richColors
        closeButton
        style={{
          top: "80px",
        }}
      />

      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
