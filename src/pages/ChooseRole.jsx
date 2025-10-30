// pages/ChooseRole.jsx
import { useNavigate } from 'react-router-dom';

const ChooseRole = () => {
  const navigate = useNavigate();

  const goToRegisterAs = (role) => {
    // On stocke temporairement le rôle dans localStorage ou on le passe via navigate.state
    navigate('/register', { state: { preselectedRole: role } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="p-4 text-center border-b bg-white">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <p className="text-gray-700">Je m'inscris en tant que :</p>

        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => goToRegisterAs('particulier')}
            className="px-8 py-4 bg-white border-2 border-gray-300 rounded-xl shadow hover:shadow-md transition text-gray-800 font-medium w-48"
          >
            Particulier
          </button>

          <button
            onClick={() => goToRegisterAs('createur')}
            className="px-8 py-4 bg-[#16A14A] text-white rounded-xl shadow hover:shadow-md transition font-medium w-48"
          >
            Créateur
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChooseRole;