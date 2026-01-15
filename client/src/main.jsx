import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/theme-provider.jsx";
import { AuthProvider } from "@/context/auth-context";

createRoot(document.getElementById("root")).render(
    <ThemeProvider defaultTheme="dark" storageKey="hacksync-theme">
        <AuthProvider>
            <App />
        </AuthProvider>
    </ThemeProvider>
);
