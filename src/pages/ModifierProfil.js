import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../images/logo.png';

const ModifierProfil = () => {
  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    password: "",
    photo: null,
    metier: "",
    domaine: "",
    telephone: "",
    langues: [],
    nationalites: "",
    video: "",
    description: "",
    valeurs: "",
    lieuPrestation: "",
    pmr: false,
    typeCours: "",
    publicCible: "",
    liens: "",
  });
  const [userRole, setUserRole] = useState("particulier");
  const navigate = useNavigate();

  const domaines = [
    'Bien-être', 'Éducation', 'Création', 'Tech', 'Artisanat',
    'Conseil', 'Sport', 'Musique', 'Développement personnel'
  ];
  const publicCibleOptions = ['Débutants', 'Professionnels', 'Tous niveaux'];
  const languesDisponibles = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand'];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!userData || !token) return navigate("/login");
    const userId = userData.id || userData._id;


    

    axios.get(`https://backend-hqhy.onrender.com/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const user = res.data;
      setUserRole(user.role || "particulier");

      setForm({
        name: user.name || "",
        prenom: user.prenom || "",
        email: user.email || "",
        password: "",
        photo: null,
        metier: user.metier || "",
        domaine: user.domaine || "",
        telephone: user.telephone || "",
        langues: Array.isArray(user.langues) ? user.langues : [],
        nationalites: user.nationalites || "",
        video: user.video || "",
        description: user.description || "",
        valeurs: user.valeurs || "",
        lieuPrestation: user.lieuPrestation || "",
        pmr: user.pmr || false,
        typeCours: user.typeCours || "",
        publicCible: user.publicCible || "",
        liens: user.liens || "",
      });
    }).catch(() => {
      alert("Erreur de chargement du profil");
      navigate("/dashboard");
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleLangueChange = (langue) => {
    setForm((prev) => ({
      ...prev,
      langues: prev.langues.includes(langue)
        ? prev.langues.filter((l) => l !== langue)
        : [...prev.langues, langue],
    }));
  };

  const handlePhotoChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
   const userId = JSON.parse(localStorage.getItem("user"))?.id 
            || JSON.parse(localStorage.getItem("user"))?._id;


    if (!token || !userId) {
      alert("Non authentifié");
      return navigate("/login");
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "photo" && !form.photo) return;
      if (Array.isArray(form[key])) {
        form[key].forEach((item) => data.append(key, item));
      } else {
        data.append(key, form[key] ?? "");
      }
    });

    try {
      const res = await axios.put(`https://backend-hqhy.onrender.com/api/users/${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const storedUser = JSON.parse(localStorage.getItem("user"));

localStorage.setItem(
  "user",
  JSON.stringify({
    ...storedUser,   // garde _id, role, credits, etc.
    ...res.data,     // mets à jour les champs modifiés
  })
);


      alert("Profil mis à jour !");
      navigate("/profile");
    } catch (error) {
      alert(error.response?.data?.msg || "Erreur");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
       { /*<img src={logo} alt="Logo" className="h-8" /> */} 
        <button
          onClick={() => navigate("/profile")}
          className="text-[#16A14A] hover:underline"
        >
          ← Retour au profil
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Modifier le profil</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                value={form.name}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={form.prenom}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
              <input
                type="password"
                name="password"
                placeholder="Nouveau mot de passe (optionnel)"
                value={form.password}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">
                📁 Télécharger une photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
              {form.photo && (
                <p className="text-sm text-gray-500 mt-1">Fichier sélectionné : {form.photo.name}</p>
              )}
            </div>

            {/* Champs Créateur */}
            {userRole === "createur" && (
              <div className="bg-gray-50 p-6 rounded-xl space-y-5">
                <h2 className="text-xl font-semibold text-gray-800">Informations Créateur</h2>

                <input
                  type="text"
                  name="metier"
                  placeholder="Métier (optionnel)"
                  value={form.metier}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <select
                  name="domaine"
                  value={form.domaine}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Domaine d’activité</option>
                  {domaines.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <div>
                  <p className="text-gray-700 font-medium">Langues parlées :</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {languesDisponibles.map(langue => (
                      <label key={langue} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={form.langues.includes(langue)}
                          onChange={() => handleLangueChange(langue)}
                        /> {langue}
                      </label>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  name="nationalites"
                  placeholder="Nationalités"
                  value={form.nationalites}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <input
                  type="tel"
                  name="telephone"
                  placeholder="Téléphone (optionnel)"
                  value={form.telephone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <input
                  type="url"
                  name="video"
                  placeholder="Lien vidéo (optionnel)"
                  value={form.video}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <textarea
                  name="description"
                  placeholder="À propos de vous"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <textarea
                  name="valeurs"
                  placeholder="Vos valeurs (optionnel)"
                  value={form.valeurs}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <select
                  name="lieuPrestation"
                  value={form.lieuPrestation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Lieu de prestation</option>
                  <option value="distanciel">Distanciel</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="hybride">Hybride</option>
                </select>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="pmr"
                    checked={form.pmr}
                    onChange={handleChange}
                  />
                  Accessible PMR
                </label>

                <select
                  name="typeCours"
                  value={form.typeCours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Type de cours</option>
                  <option value="individuel">Individuel</option>
                  <option value="collectif">Collectif</option>
                </select>

                <select
                  name="publicCible"
                  value={form.publicCible || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Public cible</option>
                  {publicCibleOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                <input
                  type="text"
                  name="liens"
                  placeholder="Liens (site, réseaux sociaux)"
                  value={form.liens}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>
            )}

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
  type="submit"
  className="bg-[#16A14A] hover:bg-[#1a9d53] text-white py-3 px-6 rounded-lg font-semibold transition"
>
  Enregistrer les modifications
</button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm bg-white border-t">
        © {new Date().getFullYear()} OpenUp. Tous droits réservés.
      </footer>
    </div>
  );
};

export default ModifierProfil;