import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shukran! 🎉</h1>
          <p className="text-xl text-gray-600 mb-2">Thank You / Merci!</p>
          <p className="text-lg text-gray-500 mb-8">
            Your application has been received successfully. Our team will contact you within 24 hours via WhatsApp.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Votre demande a été reçue avec succès. Notre équipe vous contactera dans les 24 heures via WhatsApp.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition"
          >
            Return to Home / Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
