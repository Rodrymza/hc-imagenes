import { Toaster } from "sonner";
import LoginPage from "./pages/Login";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <LoginPage />;
    </>
  );
}

export default App;
