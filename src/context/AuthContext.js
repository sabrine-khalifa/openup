import { createContext, useState, useEffect } from "react";

// 1. Création du contexte
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 2. État pour l'utilisateur
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 3. Fonction pour login
  const login = (data) => {
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user); // ⚡ met à jour l'état global immédiatement
  };

  // 4. Fonction pour logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login"; // redirection après logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
