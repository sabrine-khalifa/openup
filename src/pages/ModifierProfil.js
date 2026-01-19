import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const languesDisponibles = ["Français", "Anglais"];

const categoriesDisponibles = [
  { nom: "Animaux & monde vivant", couleur: "#B36A5E" },
  { nom: "Architecture & urbanisme", couleur: "#E3CD8B" },
  { nom: "Arts vivants", couleur: "#F27438" },
  { nom: "Arts visuels", couleur: "#F39C12" },
  { nom: "Artisanat", couleur: "#CA7C5C" },
  { nom: "Bien-être", couleur: "#27AE60" },
  { nom: "Décoration & aménagement", couleur: "#e76f51" },
  { nom: "Développement personnel", couleur: "#9B59B6" },
  { nom: "Informatique & numérique", couleur: "#3498DB" },
  { nom: "Autres", couleur: "#95a5a6" },
];

const extractValidLangues = (rawLangues) => {
  if (!Array.isArray(rawLangues)) return [];
  return [...new Set(rawLangues.filter(l => languesDisponibles.includes(l)))];
};

const ModifierProfil = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    password: "",
    photo: null,
    metier: "",
    domaine: "",
    categories: [],
    telephone: "",
    langues: [],
    nationalites: "",
    video: "",
    description: "",
    valeurs: "",
    lieuPrestation: "",
    typeCours: "",
    publicCible: "",
    siteWeb: "",
    instagram: "",
    linkedin: "",
  });

  /* =========================
     🔐 Sécurité + chargement
  ========================= */
  useEffect(() => {
    if (loading) return;

    if (!user || (!user.id && !user._id)) {
      navigate("/login", { replace: true });
      return;
    }

    const userId = user.id || user._id;

    api.get(`/api/users/${userId}`)
      .then((res) => {
        const u = res.data;

        setForm({
          name: u.name || "",
          prenom: u.prenom || "",
          email: u.email || "",
          password: "",
          photo: null,
          metier: u.metier || "",
          domaine: typeof u.domaine === "string" ? u.domaine : "",
          telephone: u.telephone || "",
          langues: extractValidLangues(u.langues),
          nationalites: u.nationalites || "",
          video: u.video || "",
          description: u.description || "",
          valeurs: u.valeurs || "",
          lieuPrestation: u.lieuPrestation || "",
          typeCours: u.typeCours || "",
          publicCible: u.publicCible || "",
          siteWeb: u.siteWeb || "",
          instagram: u.instagram || "",
          linkedin: u.linkedin || "",
          categories: Array.isArray(u.categories)
            ? u.categories.map(c => typeof c === "string" ? c : c.nom)
            : [],
        });
      })
      .catch(() => navigate("/dashboard", { replace: true }));
  }, [user, loading, navigate]);

  /* =========================
     🧠 Handlers
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLangueChange = (langue) => {
    setForm(prev => ({
      ...prev,
      langues: prev.langues.includes(langue)
        ? prev.langues.filter(l => l !== langue)
        : [...prev.langues, langue],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return navigate("/login");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => data.append(key, v));
      } else {
        data.append(key, value ?? "");
      }
    });

    try {
      await api.put(`/api/auth/${user.id || user._id}`, data);
      alert("Profil mis à jour !");
      navigate("/profile");
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  /* =========================
     ⏳ Loading global
  ========================= */
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  /* =========================
     🖼️ UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Modifier le profil</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nom" className="input" />
            <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" className="input" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input" />

            {user.role === "createur" && (
              <>
                <select name="domaine" value={form.domaine} onChange={handleChange} className="input">
                  <option value="">Domaine</option>
                  {categoriesDisponibles.map(c => (
                    <option key={c.nom} value={c.nom}>{c.nom}</option>
                  ))}
                </select>

                <div className="flex gap-4 flex-wrap">
                  {languesDisponibles.map(l => (
                    <label key={l}>
                      <input
                        type="checkbox"
                        checked={form.langues.includes(l)}
                        onChange={() => handleLangueChange(l)}
                      /> {l}
                    </label>
                  ))}
                </div>
              </>
            )}

            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg">
              Enregistrer
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ModifierProfil;
