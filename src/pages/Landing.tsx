import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Globe,
  Users,
  Award,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Shield,
  Plane,
  HeadphonesIcon,
  BookOpen,
  Home,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    age: '',
    city: '',
    program: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown to March 31, 2026
  useEffect(() => {
    const targetDate = new Date('2026-03-31T23:59:59').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const cities = [
    'Casablanca',
    'Rabat',
    'Marrakech',
    'Fes',
    'Tangier',
    'Agadir',
    'Oujda',
    'Kenitra',
    'Tetouan',
    'Meknes',
    'Safi',
    'El Jadida',
    'Nador',
    'Beni Mellal',
    'Taza',
    'Khouribga',
    'Other',
  ];

  const programs = [
    'Medicine',
    'Engineering',
    'Business Administration',
    'Computer Science',
    'Pharmacy',
    'Dentistry',
    'Chinese Language',
    'Other',
  ];

  const whatsappLink = 'https://wa.me/212622565270';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ');

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          phone: formData.whatsapp,
          city: formData.city,
          referralCode,
        }),
      });

      if (response.ok) {
        // Track conversion
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) window.gtag('event', 'generate_lead');

        navigate('/thank-you');
      } else {
        alert('An error occurred, please try again');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm">
              <Users className="w-4 h-4" />
              Over 500 students have achieved their dreams with us
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Apply Now for a Chance at
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Free Tuition & Free Dorm
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              At China's and the world's elite universities - full scholarships covering tuition and accommodation
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="#form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition"
            >
              Register Now <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-lg font-semibold rounded-full hover:bg-white/20 transition"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Us on WhatsApp
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-3xl font-bold text-white">4.9</p>
              <p className="text-gray-300 text-sm">rating</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">400+</p>
              <p className="text-gray-300 text-sm">partner universities</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">2</p>
              <p className="text-gray-300 text-sm">offices in Rabat and China</p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Timer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-white" />
            <p className="text-xl text-white font-semibold">
              FREE tuition & dorm - Register before March 31, 2026
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { value: timeLeft.days, label: 'days' },
              { value: timeLeft.hours, label: 'hrs' },
              { value: timeLeft.minutes, label: 'min' },
              { value: timeLeft.seconds, label: 'sec' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-4 min-w-[100px]"
              >
                <p className="text-4xl font-bold text-white">{item.value}</p>
                <p className="text-white/80 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              How We Support You
            </h2>
            <p className="text-xl text-gray-300">
              Four clear steps separate you from achieving your academic dream
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Register Your Details',
                desc: 'Complete the form in just 2 minutes',
                icon: '📝',
              },
              {
                title: 'Expert Consultation',
                desc: 'Our advisor contacts you within 24 hours',
                icon: '💬',
              },
              {
                title: 'Application Submission',
                desc: 'We prepare and submit your file to suitable universities',
                icon: '📄',
              },
              {
                title: 'Admission & Travel',
                desc: 'We welcome you in China and accompany you to your university',
                icon: '✈️',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition group"
              >
                <div className="text-6xl mb-4">{step.icon}</div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Why Choose */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose Foorsa?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: 'Full Scholarships',
                desc: 'Scholarships covering up to 100% of costs at internationally recognized universities',
              },
              {
                icon: Shield,
                title: 'Money-Back Guarantee',
                desc: 'If not admitted, we refund you in full with no questions asked',
              },
              {
                icon: MapPin,
                title: 'Two Offices at Your Service',
                desc: 'An office in Rabat for your application and one in China to welcome you',
              },
              {
                icon: Plane,
                title: 'Airport Pickup',
                desc: 'Our team in China welcomes you and accompanies you to your university',
              },
              {
                icon: Users,
                title: 'Community of 500+ Students',
                desc: 'Join the thriving Moroccan student community in China',
              },
              {
                icon: HeadphonesIcon,
                title: '24/7 Support',
                desc: 'Our team is available around the clock to answer your questions',
              },
              {
                icon: BookOpen,
                title: 'Chinese Language Courses',
                desc: 'Learn the basics of Chinese before your departure',
              },
              {
                icon: Home,
                title: 'Guaranteed Accommodation',
                desc: 'We provide comfortable housing on campus or nearby',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <benefit.icon className="w-10 h-10 text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-300 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="form" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Register Now</h2>
              <p className="text-xl text-gray-300">
                We will contact you within 24 hours for an expert consultation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* WhatsApp & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    placeholder="+212 6XX XXX XXX"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="22"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* City & Program */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    City *
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="" className="bg-slate-800">
                      Select your city
                    </option>
                    {cities.map((city) => (
                      <option key={city} value={city} className="bg-slate-800">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Preferred Program *
                  </label>
                  <select
                    required
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="" className="bg-slate-800">
                      Select your program
                    </option>
                    {programs.map((program) => (
                      <option key={program} value={program} className="bg-slate-800">
                        {program}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Write any question or comment..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Submitting...' : 'Enter Now'}
              </button>

              {/* Privacy Note */}
              <p className="text-sm text-gray-400 text-center">
                By registering, you agree to our privacy policy. Your information is 100%
                secure.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-300">
              Real success stories from students who achieved their dreams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sara El Mansouri',
                university: 'Beijing Institute of Technology',
                program: 'Mechanical Engineering',
                text: 'Foorsa completely changed my life. From registration to arrival in China, the team accompanied me every step of the way. I am now studying at one of the best universities.',
                avatar: '👩‍🎓',
              },
              {
                name: 'Mohammed Alaoui',
                university: 'Tsinghua University',
                program: 'Computer Science',
                text: 'I received a full scholarship thanks to the exceptional Foorsa team. Their continuous support and professional guidance helped me achieve my dream of studying in China.',
                avatar: '👨‍🎓',
              },
              {
                name: 'Houda Bekri',
                university: 'Shanghai University',
                program: 'Medicine',
                text: 'I was worried about traveling alone, but the Foorsa team welcomed me at the airport and helped me with everything. I recommend Foorsa to every student.',
                avatar: '👩‍⚕️',
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-indigo-400">{testimonial.university}</p>
                    <p className="text-xs text-gray-400">{testimonial.program}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{testimonial.text}</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">Answers to the most common questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What is the cost of Foorsa services?',
                answer:
                  'We offer an initial consultation. Costs vary depending on the program and university chosen. We guarantee complete transparency in all fees and offer a full refund if not admitted.',
              },
              {
                question: 'Do I need to know Chinese?',
                answer:
                  'No! We offer programs in both English and Chinese. We also provide courses to learn Chinese basics before departure.',
              },
              {
                question: 'How long does the admission process take?',
                answer:
                  'The process typically takes 4 to 8 weeks from application submission to receiving admission. We follow up on your file at every stage.',
              },
              {
                question: 'Do you provide support after arrival in China?',
                answer:
                  'Yes! We have an office in China and a community of over 500 Moroccan students. We provide airport pickup, housing assistance, and 24/7 support.',
              },
              {
                question: 'What scholarships are available?',
                answer:
                  'We help you obtain Chinese government scholarships (CSC), university scholarships, and regional scholarships covering 50% to 100% of costs.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-indigo-400 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Register now and get a consultation from our specialized team
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition"
            >
              Register Now <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-md border border-white/20 text-white text-lg font-semibold rounded-full hover:bg-white/30 transition"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white mb-2">Foorsa</h3>
            <p className="text-gray-400 text-lg">Your Gateway to Studying in China</p>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Foorsa - All rights reserved
          </p>
        </div>
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
