// pages/CompleterProfil.jsx
import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../images/logo.png";

const CompleterProfil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Vérifier connexion
  useEffect(() => {
    if (!storedUser) {
      alert("Veuillez vous connecter.");
      navigate("/login");
    }
  }, [navigate]);

  const userId = storedUser?.id; // ← utilise l'ID depuis localStorage
  const [form, setForm] = useState({
    // Utiliser storedUser si disponible, sinon valeurs vides
    name: storedUser?.name || "",
    prenom: storedUser?.prenom || "",
    email: storedUser?.email || "",
    telephone: storedUser?.telephone || "",
    photo: storedUser?.photo || null,
    role: storedUser?.role || "particulier",
    // Champs créateur

    metier: storedUser?.metier || "",
    domaine: Array.isArray(storedUser?.domaine) ? storedUser.domaine : [],
    langues: Array.isArray(storedUser?.langues) ? storedUser.langues : [],
    nationalites: storedUser?.nationalites || "",
    video: storedUser?.video || "",
    description: storedUser?.description || "",
    valeurs: storedUser?.valeurs || "",
    lieuPrestation: storedUser?.lieuPrestation || "",
   // pmr: storedUser?.pmr || false,
    typeCours: storedUser?.typeCours || "",
    publicCible: storedUser?.publicCible || "",
    liens: storedUser?.liens || "",
    siteWeb: storedUser?.siteWeb || "",
    instagram: storedUser?.instagram || "",
    linkedin: storedUser?.linkedin || "",
  });

  const domaines = [
    "Animaux & monde vivant",
    "Architecture & urbanisme",
    "Artisanat",
    "Arts visuels",
    "Arts vivants",
    "Bien-être",
    "Décoration & aménagement",
    "Développement personnel",
    "Écologie & durabilité",
    "Écriture & littérature",
    "Entrepreneuriat & innovation",
    "Finances personnelles & économie",
    "Formation, enseignement & accompagnement",
    "Gastronomie & art culinaire",
    "Humanitaire & droits humains",
    "Inclusion & solidarité",
    "Informatique & numérique",
    "Jeux & expériences interactives",
    "Management & organisation",
    "Marketing & communication",
    "Médias, journalisme & storytelling",
    "Musique & son",
    "Nature, jardinage & permaculture",
    "Parentalité & famille",
    "Politique, citoyenneté & engagement sociétal",
    "Relations & développement social",
    "Santé",
    "Sciences & technologies",
    "Sport, loisirs physiques & outdoor",
    "Spiritualité",
    "Stylisme & mode",
    "Thérapies alternatives",
    "Voyage, tourisme & interculturalité",
    "Autres",
  ];

  const languesDisponibles = ["Français", "Anglais"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleDomaineChange = (value) => {
    setForm((prev) => ({
      ...prev,
      domaine: prev.domaine.includes(value)
        ? prev.domaine.filter((d) => d !== value)
        : [...prev.domaine, value],
    }));
  };

  const handleFileChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleLangueChange = (langue) => {
    setForm((prev) => ({
      ...prev,
      langues: prev.langues.includes(langue)
        ? prev.langues.filter((l) => l !== langue)
        : [...prev.langues, langue],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) return;

    const data = new FormData();

    let finalCategories = [...formData.categories];
    if (
      formData.categories.includes("Autres") &&
      formData.autreCategorie?.trim()
    ) {
      finalCategories = finalCategories.filter((c) => c !== "Autres"); // retire "Autres"
      finalCategories.push(formData.autreCategorie.trim()); // ajoute la vraie valeur
    }

    Object.keys(form).forEach((key) => {
      const value = form[key];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return; // ❌ n'envoie pas
      }

      if (Array.isArray(value)) {
        value.forEach((item) => data.append(key, item));
      } else {
        data.append(key, value);
      }
    });

    try {
      const res = await api.put(`/api/auth/complete-profile/${userId}`, data);

      // ✅ stocker UNIQUEMENT la réponse backend
      if (res?.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      navigate("/profile", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="p-4 text-center border-b bg-white">
        {/* <img src={logo} alt="Logo" className="h-10 mx-auto" /> */}
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Bonjour {form.prenom}  {form.name}   👋 Complétez votre profil
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez compléter les informations suivantes pour finaliser votre
            profil.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Infos de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="tel"
                name="telephone"
                placeholder="Téléphone"
                value={form.telephone}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block mb-2 text-gray-700">
                📁 Télécharger une photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {form.photo && (
                <p className="text-sm text-gray-500">{form.photo.name}</p>
              )}
            </div>

            {/* Champs Créateur */}
            {form.role === "createur" && (
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <h3 className="font-semibold text-gray-800">
                  Informations Créateur
                </h3>

                <input
                  type="text"
                  name="metier"
                  placeholder="Métier"
                  value={form.metier}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />

                <div>
                  {" "}
                  <p className="text-gray-700 font-medium">
                    Domaines d’activité :
                  </p>{" "}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {" "}
                    {domaines.map((d) => (
                      <label
                        key={d}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        {" "}
                        <input
                          type="checkbox"
                          checked={form.domaine.includes(d)}
                          onChange={() => handleDomaineChange(d)}
                        />{" "}
                        {d}{" "}
                      </label>
                    ))}{" "}
                  </div>{" "}
                    {formData.categories.includes("Autres") && (
    <div className="mt-2">
      <label className="block text-gray-700 text-sm mb-1">
        Précisez votre catégorie :
      </label>
      <input
        type="text"
        name="autreCategorie"
        value={formData.autreCategorie || ""}
        onChange={(e) =>
          setFormData({ ...formData, autreCategorie: e.target.value })
        }
        placeholder="Entrez votre catégorie"
        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A14A]"
      />
    </div>
  )}

  {/* Message d'erreur si aucune catégorie sélectionnée */}
  {formData.categories.length === 0 && (
    <p className="text-red-500 text-sm mt-1">
      Veuillez sélectionner au moins une catégorie
    </p>
  )}
                </div>

                <div>
                  <p className="text-gray-700">Langues parlées :</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {languesDisponibles.map((langue) => (
                      <label key={langue} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={form.langues.includes(langue)}
                          onChange={() => handleLangueChange(langue)}
                        />{" "}
                        {langue}
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
                  type="url"
                  name="video"
                  placeholder="Lien vidéo de présentation "
                  value={form.video}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
                <textarea
                  name="description"
                  placeholder="À propos"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
                <textarea
                  name="valeurs"
                  placeholder="Mes valeurs profondes "
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
                  <option value="">Type de prestation</option>
                  <option value="En ligne">Distanciel</option>
                  <option value="Présentiel">Présentiel</option>
                </select>
             {/*    <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="pmr"
                    checked={form.pmr}
                    onChange={handleChange}
                  />
                  Accessible PMR (Personnes à mobilité réduite)
                </label>  */} 
                <select
                  name="typeCours"
                  value={form.typeCours}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Type de séance</option>

                  <option value="Individuel">Individuelle</option>
                  <option value="Collectif">Collective </option>
                  <option value="Groupe">Individuelle & Collective </option>
                </select>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Public cible
                  </label>
                  <input
                    type="text"
                    name="publicCible"
                    value={form.publicCible}
                    onChange={handleChange}
                    placeholder="Débutants, Professionnels,Tous niveaux"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">Liens</p>

                  <input
                    type="url"
                    name="siteWeb"
                    placeholder="Site Web"
                    value={form.siteWeb || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />

                  <input
                    type="url"
                    name="instagram"
                    placeholder="Instagram"
                    value={form.instagram || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />

                  <input
                    type="url"
                    name="linkedin"
                    placeholder="LinkedIn"
                    value={form.linkedin || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#16A14A] hover:bg-[#1a9d53] text-white py-3 rounded-lg font-semibold transition"
            >
              Compléter le profil
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} OpenUp. Tous droits réservés.
      </footer>
    </div>
  );
};

export default CompleterProfil;
