import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Star, MessageSquare, User, Send, CheckCircle, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { TaxProfile } from '../types';
import Logo from './Logo';

interface FeedbackPageProps {
  onBack: () => void;
  userProfile?: TaxProfile | null;
}

type FeedbackCategory = 'bug' | 'feature' | 'general' | 'billing';

interface FeedbackData {
  rating: number;
  category: FeedbackCategory;
  message: string;
  name: string;
  email: string;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ onBack, userProfile }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<FeedbackData>({
    rating: 0,
    category: 'general',
    message: '',
    name: userProfile?.name || '',
    email: userProfile?.email || ''
  });

  // Update form data if user profile loads late
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || userProfile.name,
        email: prev.email || userProfile.email || ''
      }));
    }
  }, [userProfile]);

  const handleRating = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Send feedback via email using Formspree (free service)
      const response = await fetch('https://formspree.io/f/xwpkgpnz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          rating: formData.rating,
          category: formData.category,
          message: formData.message,
          name: formData.name,
          email: formData.email,
          _subject: `LevyMate Feedback: ${formData.category} (${formData.rating}/5 stars)`
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        // Fallback: open email client
        const mailtoLink = `mailto:bukassi@gmail.com?subject=${encodeURIComponent(`LevyMate Feedback: ${formData.category}`)}&body=${encodeURIComponent(
          `Rating: ${formData.rating}/5 stars\nCategory: ${formData.category}\n\nMessage:\n${formData.message}\n\nFrom: ${formData.name} (${formData.email})`
        )}`;
        window.location.href = mailtoLink;
        setIsSuccess(true);
      }
    } catch (error) {
      // Fallback: open email client if fetch fails
      const mailtoLink = `mailto:bukassi@gmail.com?subject=${encodeURIComponent(`LevyMate Feedback: ${formData.category}`)}&body=${encodeURIComponent(
        `Rating: ${formData.rating}/5 stars\nCategory: ${formData.category}\n\nMessage:\n${formData.message}\n\nFrom: ${formData.name} (${formData.email})`
      )}`;
      window.location.href = mailtoLink;
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.rating > 0 && formData.message.length > 10;
  const isStep2Valid = formData.name.length > 2 && formData.email.includes('@');

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <Helmet>
            <title>Feedback Sent - LevyMate</title>
        </Helmet>
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 mb-8">
            Your feedback helps us make LevyMate better for everyone. We appreciate your input.
          </p>
          <button 
            onClick={onBack}
            className="w-full bg-levy-blue text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Helmet>
        <title>Feedback - LevyMate</title>
        <meta name="description" content="Share your feedback, report bugs, or suggest features for LevyMate." />
      </Helmet>

      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <Logo />
          </div>
          <div className="text-sm font-medium text-gray-500">
            Step {step} of 2
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* Left Panel - Context */}
          <div className="bg-slate-900 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-levy-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-display font-bold mb-4">We Value Your Input</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Help us improve the Nigerian tax experience. Whether it's a bug report or a feature request, we're listening.
              </p>
            </div>

            <div className="relative z-10 space-y-4 mt-8">
              <div className={`flex items-center gap-3 text-sm ${step === 1 ? 'text-white font-bold' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 1 ? 'bg-white text-slate-900 border-white' : 'border-slate-700'}`}>1</div>
                <span>Feedback</span>
              </div>
              <div className={`h-8 w-0.5 bg-slate-800 ml-4`}></div>
              <div className={`flex items-center gap-3 text-sm ${step === 2 ? 'text-white font-bold' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 2 ? 'bg-white text-slate-900 border-white' : 'border-slate-700'}`}>2</div>
                <span>Details</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="p-8 md:w-2/3 flex flex-col">
            
            {/* Step 1: Feedback Content */}
            {step === 1 && (
              <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare size={20} className="text-levy-blue" />
                  What's on your mind?
                </h3>

                <div className="space-y-6 flex-1">
                  {/* Rating */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Rate your experience</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`p-2 rounded-lg transition-all ${formData.rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                          <Star size={32} fill={formData.rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Category</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['general', 'bug', 'feature', 'billing'] as FeedbackCategory[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`p-3 rounded-xl text-sm font-medium capitalize border transition-all ${
                            formData.category === cat 
                              ? 'bg-blue-50 border-levy-blue text-levy-blue shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more..."
                      className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue resize-none transition-all"
                    ></textarea>
                    {formData.message.length > 0 && formData.message.length < 10 && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> Please enter at least 10 characters.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="bg-levy-blue text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: User Details */}
            {step === 2 && (
              <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User size={20} className="text-levy-blue" />
                  About You
                </h3>

                <div className="space-y-6 flex-1">
                  <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    We'll use these details to follow up on your feedback if necessary.
                  </p>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isStep2Valid || isSubmitting}
                    className="flex-1 bg-levy-blue text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'} <Send size={18} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
