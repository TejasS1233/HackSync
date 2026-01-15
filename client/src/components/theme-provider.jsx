import { createContext, useContext, useEffect, useState } from "react";

const initialState = {
    theme: "dark",
    setTheme: () => null,
};

const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "dark",
    storageKey = "vite-ui-theme",
    ...props
}) {
    // Always initialize as dark, ignoring storage for now to enforce "Always Dark"
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add("dark");
    }, []); // Run once, force dark

    const value = {
        theme: "dark",
        setTheme: () => null, // Disable theme switching
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};
