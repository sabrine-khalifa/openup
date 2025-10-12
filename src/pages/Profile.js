

// pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from '../images/logo.png';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [avis, setAvis] = useState([]);
  const [activeTab, setActiveTab] = useState("À propos");
  const [editMode, setEditMode] = useState(false); // Mode édition
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!userData || !token) return navigate("/login");

    const userId = userData.id;

    // Charger le profil
    axios.get(`https://backend-hqhy.onrender.com/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const userData = res.data;

      // Charger les avis
      axios.get(`https://backend-hqhy.onrender.com/api/avis/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((resAvis) => {
        const avis = resAvis.data;
        setAvis(avis);

        const avisAvecNote = avis.filter((a) => {
          const n = typeof a.note === "string" ? parseFloat(a.note) : a.note;
          return typeof n === "number" && !isNaN(n) && n >= 1 && n <= 5;
        });

        const noteMoyenne = avisAvecNote.length > 0
          ? (avisAvecNote.map(a => typeof a.note === "string" ? parseFloat(a.note) : a.note)
              .reduce((acc, n) => acc + n, 0) / avisAvecNote.length).toFixed(1)
          : null;

        setUser({ ...userData, note: noteMoyenne, nombreAvis: avis.length });
        setForm({ ...userData }); // Initialiser le formulaire
      });
    });

    if (userData.role === "createur") {
      axios.get(`https://backend-hqhy.onrender.com/api/services/serv/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => setServices(res.data));
    }

    axios.get(`https://backend-hqhy.onrender.com/api/reservations/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setReservations(res.data));
  }, [navigate]);

  if (!user) return <p className="text-center py-10">Chargement...</p>;

  // Vérifie si le profil est complet
  const isProfileComplete = () => {
    if (user.role === "particulier") return true;
    return user.metier && user.domaine && user.description;
  };

  const getAvatar = () => {
    if (user.photo) return user.photo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16A14A&color=fff&size=120`;
  };

  const getAuteurPhoto = (auteur) => {
    if (auteur?.photo) return auteur.photo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(auteur?.name || "User")}&background=6b7280&color=fff&size=64`;
  };

  const getNoteForService = (serviceId) => {
    const avisDuService = avis.filter(a => a.service?._id === serviceId);
    if (avisDuService.length === 0) return null;
    const note = avisDuService
      .map(a => {
        const n = typeof a.note === 'string' ? parseFloat(a.note) : a.note;
        return typeof n === 'number' && !isNaN(n) ? n : 0;
      })
      .reduce((acc, n) => acc + n, 0) / avisDuService.length;
    return note.toFixed(1);
  };

  // Gestion du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLangueChange = (langue) => {
    setForm((prev) => ({
      ...prev,
      langues: prev.langues.includes(langue)
        ? prev.langues.filter(l => l !== langue)
        : [...prev.langues, langue],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach(key => {
      if (Array.isArray(form[key])) {
        form[key].forEach(item => data.append(key, item));
      } else {
        data.append(key, form[key] ?? '');
      }
    });

    try {
      await axios.put(`/api/users/${user.id}`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(prev => ({ ...prev, ...form }));
      setEditMode(false);
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      alert(err.response?.data?.msg || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <img src={logo} alt="Logo" className="h-8" />
        <button onClick={() => navigate("/dashboard")} className="text-[#16A14A] hover:underline">
          ← Retour
        </button>
      </header>

      {/* Profil */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <img src={getAvatar()} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-[#16A14A]" />
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{user.name} {user.prenom}</h1>
            {user.metier && <p className="text-lg text-gray-600">{user.metier}</p>}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              {user.domaine && (
                <span className="bg-[#16A14A] text-white px-3 py-1 rounded-full text-sm">{user.domaine}</span>
              )}
              {user.typeCreateur && (
                <span className={`px-3 py-1 rounded-full text-sm text-white ${
                  user.typeCreateur === "Graine de Créateur" ? "bg-green-500" :
                  user.typeCreateur === "Créateur en Herbe" ? "bg-yellow-500" : "bg-blue-500"
                }`}>{user.typeCreateur}</span>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-4 text-sm text-gray-600">
              {user.role === "createur" && (
                <>
                  <div className="flex items-center gap-1">🌍 <span>{user.langues?.join(", ") || "Non renseigné"}</span></div>
                  <div className="flex items-center gap-1">📍 <span>{user.lieuPrestation || "Non renseigné"}</span></div>
                </>
              )}
              {user.note && (
                <div className="flex items-center gap-1">⭐ <span>{user.note} ({user.nombreAvis} avis)</span></div>
              )}
            </div>
          </div>

          {!isProfileComplete() && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              📝 Compléter mon profil
            </button>
          )}
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-6 border-b mb-6">
          {user.role === "createur" && (
            <button
              onClick={() => { setActiveTab("À propos"); setEditMode(false); }}
              className={`pb-2 font-medium transition ${activeTab === "À propos" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : "text-gray-600 hover:text-[#16A14A]"}`}
            >
              À propos
            </button>
          )}

          {user.role === "createur" && (
            <button
              onClick={() => { setActiveTab("services"); setEditMode(false); }}
              className={`pb-2 font-medium transition ${activeTab === "services" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : "text-gray-600 hover:text-[#16A14A]"}`
            } >
              Services proposés
            </button>
          )}

          <button
            onClick={() => { setActiveTab("reserves"); setEditMode(false); }}
            className={`pb-2 font-medium transition ${activeTab === "reserves" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : "text-gray-600 hover:text-[#16A14A]"}`
          } >
            Services réservés
          </button>

          <button
            onClick={() => { setActiveTab("portefeuille"); setEditMode(false); }}
            className={`pb-2 font-medium transition ${activeTab === "portefeuille" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : "text-gray-600 hover:text-[#16A14A]"}`
          >
            Portefeuille
          </button>

          <button
            onClick={() => { setActiveTab("avis"); setEditMode(false); }}
            className={`pb-2 font-medium transition ${activeTab === "avis" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : "text-gray-600 hover:text-[#16A14A]"}`
          >
            Avis
          </button>

          {/* Bouton Compléter uniquement si pas complet et non en mode édition */
          !isProfileComplete() && (
            <button
              onClick={() => { setActiveTab("completer"); setEditMode(true); }}
              className={`pb-2 font-medium transition ${
                activeTab === "completer" ? "border-b-2 border-yellow-500 text-yellow-500" : "text-gray-600 hover:text-yellow-500"
              }`}
            >
              📝 Compléter mon profil
            </button>
          )}
        </div>

        {/* Contenu */}
        {activeTab === "À propos" && (
          <div>...</div> // Garde ton contenu existant
        )}

        {activeTab === "completer" && editMode && (
          <div className="bg-white p-8 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-6">Complétez votre profil</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="metier"
                placeholder="Métier"
                value={form.metier || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
              <select
                name="domaine"
                value={form.domaine || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >
                <option value="">Domaine d’activité</option>
                {['Bien-être', 'Éducation', 'Création', 'Tech'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <textarea
                name="description"
                placeholder="À propos de vous"
                value={form.description || ''}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
              <button
                type="submit"
                className="w-full bg-[#16A14A] text-white py-3 rounded-lg font-semibold"
              >
                Enregistrer
              </button>
            </form>
          </div>
        )}

        {/* Autres onglets : services, réserves, etc. */}
        {/* ... (garde le reste inchangé) */}
      </main>
    </div>
  );
};

export default Profile;