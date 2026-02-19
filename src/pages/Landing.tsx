import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Globe, Users, Award, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const content = {
    fr: {
      title: 'Étudiez en Chine avec une Bourse Complète',
      subtitle: 'Rejoignez des milliers d\'étudiants qui transforment leur avenir grâce aux bourses d\'études en Chine',
      features: [
        { icon: GraduationCap, title: 'Bourses Complètes', desc: '100% financé - frais de scolarité, logement et allocation mensuelle' },
        { icon: Globe, title: 'Universités de Classe Mondiale', desc: 'Accès à plus de 300 universités chinoises reconnues' },
        { icon: Users, title: 'Support Complet', desc: 'Accompagnement personnalisé de A à Z' },
        { icon: Award, title: 'Taux de Réussite Élevé', desc: '95% de nos candidats obtiennent une bourse' },
      ],
      cta: 'Commencer Votre Parcours',
      formTitle: 'Demandez Votre Bourse Maintenant',
      formSubtitle: 'Remplissez le formulaire ci-dessous et notre équipe vous contactera dans les 24 heures',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      city: 'Ville',
      submit: 'Soumettre',
      submitting: 'Envoi...',
      successTitle: 'Demande Reçue!',
      successMessage: 'Nous vous contacterons bientôt. Vérifiez votre WhatsApp!',
      footer: '© 2026 Foorsa. Tous droits réservés.',
    },
    en: {
      title: 'Study in China with Full Scholarship',
      subtitle: 'Join thousands of students transforming their future through Chinese scholarships',
      features: [
        { icon: GraduationCap, title: 'Full Scholarships', desc: '100% funded - tuition, accommodation & monthly stipend' },
        { icon: Globe, title: 'World-Class Universities', desc: 'Access to 300+ recognized Chinese universities' },
        { icon: Users, title: 'Full Support', desc: 'Personalized guidance from A to Z' },
        { icon: Award, title: 'High Success Rate', desc: '95% of our candidates win scholarships' },
      ],
      cta: 'Start Your Journey',
      formTitle: 'Apply for Your Scholarship Now',
      formSubtitle: 'Fill the form below and our team will contact you within 24 hours',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      city: 'City',
      submit: 'Submit',
      submitting: 'Submitting...',
      successTitle: 'Application Received!',
      successMessage: 'We will contact you soon. Check your WhatsApp!',
      footer: '© 2026 Foorsa. All rights reserved.',
    },
  };

  const t = content[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          referralCode,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Track conversion
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) window.gtag('event', 'generate_lead');
        
        setTimeout(() => navigate('/thank-you'), 3000);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="px-4 py-2 bg-white rounded-full shadow-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          {lang === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              {t.title}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            <a
              href="#form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-red-600 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition"
            >
              {t.cta} <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="form" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.successTitle}</h2>
              <p className="text-xl text-gray-600">{t.successMessage}</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.formTitle}</h2>
                <p className="text-lg text-gray-600">{t.formSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.firstName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.lastName}
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+212..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-red-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.submitting : t.submit}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 text-center">
        <p className="text-gray-400">{t.footer}</p>
      </footer>
    </div>
  );
}

declare global {
  interface Window {
    fbq?: any;
    gtag?: any;
  }
}
