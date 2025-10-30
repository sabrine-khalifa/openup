

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
const userId = (userData.id || userData._id || "").trim();

    // Charger le profil
   axios
  .get(`https://backend-hqhy.onrender.com/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  .then((res) => {
    setUser(res.data);
  })
  .catch((err) => {
    console.error("Erreur de chargement utilisateur :", err);
  });


      // Charger les avis
      axios.get(`https://backend-hqhy.onrender.com/api/avis/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })   .then((resAvis) => {
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
  })
  .catch((err) => console.error("Erreur de chargement des avis :", err));


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

        { /* <img src={logo} alt="Logo" className="h-8" /> */}
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

        <button
  onClick={() => navigate("/completer-profil")}
            className="mt-4 md:mt-0 bg-[#16A14A] hover:bg-[#1a9d53] text-white px-6 py-2 rounded-lg font-medium transition"

>
  Compléter mon profil
</button>

          
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
          } >
            Portefeuille
          </button>

          <button
            onClick={() => { setActiveTab("avis"); setEditMode(false); }}
            className={`pb-2 font-medium transition ${activeTab === "avis" ? "border-b-2 border-[#16A14A] text-[#16A14A]" : "text-gray-600 hover:text-[#16A14A]"}`
          } >
            Avis
          </button>

           
        </div>

        {/* Contenu */}
        {activeTab === "À propos" && (
          <div className="space-y-6">
           {services.length > 0 && services[0] && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Bloc service (2 colonnes à gauche) */}
    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
      {/* Titre du service */}
      <h3 className="text-xl font-semibold mb-2">{services[0].titre || "Sans titre"}</h3>

      {/* Description du créateur */}
      {user.description && (
        <p className="text-gray-700 mb-4">{user.description}</p>
      )}

      {/* Images du service */}
      {services[0].images && (
        <div>
          {/* Si c’est une chaîne (image unique) */}
          {typeof services[0].images === "string" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <img
                src={services[0].images}
                alt={services[0].titre}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Si c’est un tableau (plusieurs images) */}
          {Array.isArray(services[0].images) && services[0].images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services[0].images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${services[0].titre} - image ${idx + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {/* Bloc liens (1 colonne à droite) */}
{user.liens && (
  <div className="bg-white p-6 rounded-lg shadow h-fit">
    <h3 className="text-xl font-semibold mb-4">Lien</h3>
    <ul className="space-y-2 text-gray-800">
      <li className="break-all">
        <a
          href={
            user.liens.startsWith("http")
              ? user.liens
              : `https://${user.liens}` // ✅ Ajoute automatiquement https:// si absent
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {user.liens.includes("facebook.com") || user.liens.includes("fb.com")
            ? "Facebook"
            : user.liens.includes("instagram.com")
            ? "Instagram"
            : user.liens.includes("linkedin.com")
            ? "LinkedIn"
            : user.liens.includes("http")
            ? "Site web"
            : "Lien"}{" "}
          : {user.liens}
        </a>
      </li>
    </ul>
  </div>
)}

  </div>
)}

            {user.valeurs && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold mb-3">Mes valeurs profondes</h3>
                <p className="text-gray-700">{user.valeurs}</p>
              </div>
            )}
              {user.role === "createur" && (

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-3">Informations pratiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong>Langues :</strong> {user.langues?.join(", ") || "Non"}</p>
                <p><strong>Type de cours :</strong> {user.typeCours || "Non"}</p>
                <p><strong>Public cible :</strong> {user.publicCible || "Non"}</p>
                <p><strong>PMR :</strong> {user.pmr ? "✅ Oui" : "Non"}</p>
              </div>
            </div>
            )}
              {user.role === "particulier" && (

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-3">À propos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong>email :</strong> {user.email }</p>
                <p><strong> telephone:</strong> {user.telephone || "Non"}</p>
              
              </div>
            </div>
            )}
          </div>
        )}
         {activeTab === "services" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Vos services</h2>
            {services.length === 0 ? (
              <p className="text-gray-500">Aucun service pour l’instant.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/service/${s._id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                        <div>
                    <h3 className="font-bold text-gray-800">{s.titre}</h3>
                    </div>
                    </div>
                     <div className="mt-2 flex items-center text-xs text-gray-500">
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
  {/* Durée */}
  <span className="flex items-center gap-1">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
      stroke="#6b7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
    {s.typePrestation} et {s.lieu}
  </span>

  {/* Type prestation = collectif */}
  <span className="flex items-center gap-1">
     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
{s.duree || "Non précisé"}  </span>

  {/* Date */}
  <span className="flex items-center gap-1">
     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
 {s.typeCours || "Individuel"}  </span>
</div>

              </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-green-600 font-semibold">{s.creditsProposes} crédits</span>
                      <button
    className="w-20  bg-[#16A14A] hover:bg-[#1a9d53] text-white py-2 rounded-lg transition text-sm"
    onClick={(e) => {
      e.stopPropagation(); // empêche le onClick du parent qui navigue vers la page de détail
      navigate(`/editService/${s._id}`); // chemin vers la page de modification
    }}
  >
    Modifier
  </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "reserves" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Réservations</h2>
            {reservations.length === 0 ? (
              <p className="text-gray-500">Aucune réservation.</p>
            ) : (
              <div className="space-y-4">
                {reservations.map(r => (
                  <div key={r._id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{r.service?.titre}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
  {/* Durée */}
  <span className="flex items-center gap-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {r.service?.duree || "Non précisé"}
  </span>

  {/* Type prestation = collectif */}
  <span className="flex items-center gap-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
    {r.service?.typePrestation || "Non précisé"}
  </span>

  {/* Date */}
  <span className="flex items-center gap-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    {new Date(r.date).toLocaleDateString("fr-FR")}
  </span>
</div>

                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-green-600 font-semibold text-sm">
                        {r.service?.creditsProposes || 0} crédits
                      </span>
                    <button
                      onClick={() => navigate(`/messagerie/${r.service?.createur}`)}
                      className="bg-[#16A14A] text-white px-4 py-2 rounded"
                    >
                      Contacter
                    </button>
                  </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "portefeuille" && (
          
          
          <div className="bg-white p-8 rounded-xl shadow text-center">
                <h2 className="text-xl font-semibold mb-6 text-left">Mon portefeuille virtuel</h2>
            <p className="text-4xl font-bold text-[#16A14A]">{user.credits} ⚡</p>
            <p className="text-gray-600 mt-2">Solde de crédits</p>
          </div>
        )}
   {user.role === "createur" && activeTab === "avis" && (
  <div>
    <h2 className="text-xl font-semibold mb-4">Avis reçus</h2>
    {avis.length === 0 ? (
      <p className="text-gray-500">Aucun avis.</p>
    ) : (
      <div className="space-y-4">
        {avis.map(a => (
          <div key={a._id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <img
                src={getAuteurPhoto(a.auteur)} 
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {a.auteur?.name} {a.auteur?.prenom}
                    </p>
                    {a.note && (
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < a.note ? "★" : "☆"}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-gray-700">{a.commentaire}</p>
            <p className="text-sm text-gray-500 italic mt-1">Service : {a.service?.titre}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* Autres onglets : services, réserves, etc. */}
        {/* ... (garde le reste inchangé) */}
      </main>
    </div>
  );
};

export default Profile;