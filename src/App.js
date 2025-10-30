import { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateService from "./pages/CreateService"; // <-- importer le composant
import ModifierProfil from "./pages/ModifierProfil";
import Profile from "./pages/Profile";
import ServiceList from "./pages/ServiceList";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ServiceDetail from "./pages/ServiceDetail";
import UserProfile from "./pages/UserProfile";
import Messagerie from "./components/Messagerie";
import MessagerieList from "./components/MessagerieList";
import EditService from "./pages/EditService";
import CompleterProfil from "./pages/CompleterProfil";
import ChooseRole from "./pages/ChooseRole";

function App() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(true);


   useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const userId = storedUser ? JSON.parse(storedUser).id : null;

    if (storedToken && userId) {
      setCurrentUserId(userId);
    }
    setIsLoading(false); // Fin du chargement
  }, []);



  // Fonction pour vérifier si l'utilisateur est connecté
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
                <Route path="/completer-profil" element={<CompleterProfil />} />

        <Route
          path="/dashboard"
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/create-service"
          element={
            isAuthenticated() ? <CreateService /> : <Navigate to="/login" />
          }
        />
        <Route path="/modifier-profil" element={<ModifierProfil />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/ServiceList" element={<ServiceList />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
<Route path="/editService/:id" element={<EditService />} />
         <Route
          path="/messagerie/:otherId"
          element={<Messagerie currentUserId={currentUserId}  />}
        />

        <Route
          path="/messagerie"
          element={
            <MessagerieList currentUserId={currentUserId} />
          }
        />

                <Route path="/ChooseRole" element={<ChooseRole />} />
                                <Route path="/UserProfile/:id" element={<UserProfile />} />


        {/* Tu peux ajouter d'autres routes ici plus tard (create-service, profile, etc.) */}
      </Routes>
    </Router>
  );
}

export default App;
