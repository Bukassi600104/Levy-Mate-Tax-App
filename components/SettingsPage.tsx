import React, { useState, useRef } from 'react';
import { TaxProfile, EntityType, PersonaType, TaxPolicyYear } from '../types';
import { PERSONA_LABELS, PERSONA_DESCRIPTIONS, NIGERIAN_STATES, ADMIN_EMAILS } from '../constants';
import { updateProfile } from '../services/amplifyService';
import { useToastContext } from '../contexts/ToastContext';
import { User, Building, Briefcase, MapPin, Phone, Save, Check, Crown, Shield, Wallet, Calendar, Settings, CreditCard, Sliders, AlertCircle, CheckCircle2, Loader2, LogOut, Trash2, MessageSquare } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';

interface SettingsPageProps {
  profile: TaxProfile;
  onProfileUpdate: (profile: TaxProfile) => void;
  onLogout?: () => void;
  onViewFeedback?: () => void;
}

// Helper functions for comma formatting
const formatWithCommas = (value: number | undefined): string => {
  if (value === undefined || value === 0) return '';
  return value.toLocaleString('en-NG');
};

const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Formatted Number Input Component
interface FormattedInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  hint?: string;
  icon?: React.ReactNode;
  label?: string;
}

const FormattedNumberInput: React.FC<FormattedInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "0",
  className = "",
  hint,
  icon,
  label
}) => {
  const [displayValue, setDisplayValue] = useState(formatWithCommas(value));
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(formatWithCommas(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    onChange(parseFormattedNumber(raw));
  };

  const handleBlur = () => {
    setDisplayValue(formatWithCommas(value));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <div className={`absolute ${icon ? 'left-11' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 font-medium`}>
          ₦
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-16' : 'pl-10'} pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-levy-teal/30 focus:border-levy-teal focus:bg-white transition-all duration-200 text-gray-900 font-medium ${className}`}
        />
      </div>
      {hint && <p className="text-xs text-gray-500 pl-1">{hint}</p>}
    </div>
  );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ profile, onProfileUpdate, onLogout, onViewFeedback }) => {
  const [editedProfile, setEditedProfile] = useState<TaxProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'financials' | 'preferences' | 'account'>('profile');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToastContext();

  // Scroll to content on mobile when section changes
  const handleSectionChange = (section: 'profile' | 'financials' | 'preferences' | 'account') => {
    setActiveSection(section);
    // Scroll to content on mobile
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Sync editedProfile when profile prop changes (e.g., after database update)
  React.useEffect(() => {
    setEditedProfile({ ...profile });
  }, [profile]);

  const isAdmin = profile.email && ADMIN_EMAILS.includes(profile.email.toLowerCase());
  const isPro = profile.tier === 'Pro' || isAdmin;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Save to database first
      if (profile.id) {
        await updateProfile(profile.id, editedProfile);
      }
      
      // Clear auth cache so next login fetches fresh profile
      sessionStorage.removeItem('levymate_auth_cache');
      
      // Update local state
      onProfileUpdate(editedProfile);
      setSaveSuccess(true);
      toast.success('Profile Saved', 'Your changes have been saved successfully.');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError('Failed to save changes. Please try again.');
      toast.error('Save Failed', 'Failed to save changes. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(editedProfile);

  // Compact icon button for section navigation
  const SectionIcon: React.FC<{ 
    section: 'profile' | 'financials' | 'preferences' | 'account'; 
    icon: React.ElementType; 
    label: string;
    color: string;
  }> = ({ section, icon: Icon, label, color }) => {
    const isActive = activeSection === section;
    const colorClasses: Record<string, { bg: string; text: string; activeBg: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', activeBg: 'bg-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', activeBg: 'bg-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', activeBg: 'bg-purple-600' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600', activeBg: 'bg-rose-600' },
    };
    const colors = colorClasses[color] || colorClasses.blue;
    
    return (
      <button
        onClick={() => handleSectionChange(section)}
        className={`bg-white p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-200 active:scale-95 ${
          isActive 
            ? 'border-levy-teal shadow-lg shadow-levy-teal/20' 
            : 'border-gray-100 hover:border-levy-teal/30 hover:shadow-md'
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
          isActive ? `${colors.activeBg} text-white` : `${colors.bg} ${colors.text}`
        }`}>
          <Icon size={24} />
        </div>
        <span className={`text-xs font-semibold ${isActive ? 'text-levy-teal' : 'text-gray-700'}`}>{label}</span>
      </button>
    );
  };

  const PersonaCard: React.FC<{ persona: PersonaType }> = ({ persona }) => {
    const isSelected = editedProfile.persona === persona;
    const personaIcons: Record<PersonaType, React.ElementType> = {
      [PersonaType.SALARY]: Briefcase,
      [PersonaType.BUSINESS]: Building,
      [PersonaType.FREELANCER]: User,
      [PersonaType.COMPANY]: Building,
      [PersonaType.CRYPTO]: Wallet,
    };
    const Icon = personaIcons[persona];
    
    return (
      <button
        onClick={() => setEditedProfile(prev => ({ 
          ...prev, 
          persona,
          entityType: persona === PersonaType.COMPANY ? EntityType.COMPANY : EntityType.INDIVIDUAL
        }))}
        className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${
          isSelected
            ? 'border-levy-teal bg-gradient-to-br from-levy-teal/10 to-emerald-50 shadow-lg shadow-levy-teal/10'
            : 'border-gray-100 bg-white hover:border-levy-teal/30 hover:shadow-md'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isSelected 
              ? 'bg-gradient-to-br from-levy-teal to-emerald-600 text-white' 
              : 'bg-gray-100 text-gray-500 group-hover:bg-levy-teal/10 group-hover:text-levy-teal'
          }`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={`font-bold text-sm ${isSelected ? 'text-levy-teal' : 'text-gray-900'}`}>
                {PERSONA_LABELS[persona]}
              </span>
              {isSelected && (
                <div className="w-6 h-6 bg-gradient-to-br from-levy-teal to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-levy-teal/30">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{PERSONA_DESCRIPTIONS[persona]}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-levy-teal to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-levy-teal/20">
              <Settings size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                Settings
                {isAdmin && (
                  <span className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                    <Shield size={10} /> ADMIN
                  </span>
                )}
                {isPro && !isAdmin && (
                  <span className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                    <Crown size={10} /> PRO
                  </span>
                )}
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage your profile and tax preferences</p>
            </div>
          </div>
          
          {/* Save Button with Status Messages */}
          <div className="flex items-center gap-3">
            {saveError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg animate-fade-in">
                <AlertCircle size={16} />
                <span>{saveError}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 px-3 py-2 rounded-lg animate-fade-in">
                <CheckCircle2 size={16} />
                <span>Changes saved successfully!</span>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleSave(); }}
              disabled={isSaving || !hasChanges}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${hasChanges ? 'bg-gradient-to-r from-levy-teal to-emerald-600 text-white hover:shadow-lg hover:shadow-levy-teal/30 cursor-pointer active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} disabled:opacity-50`}
            >
              {isSaving ? (
                <><Loader2 size={18} className="animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><CheckCircle2 size={18} /> Saved!</>
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
          </div>
        </div>
        
        {/* Unsaved Changes Indicator */}
        {hasChanges && (
          <div className="mt-4 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200">
            <AlertCircle size={16} />
            <span>You have unsaved changes. Click "Save Changes" to update your profile.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Navigation - Compact Icon Grid */}
        <div className="lg:col-span-1 space-y-4">
          {/* Icon Grid */}
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-3">
            <SectionIcon section="profile" icon={User} label="Profile" color="blue" />
            <SectionIcon section="financials" icon={CreditCard} label="Financial" color="green" />
            <SectionIcon section="preferences" icon={Sliders} label="Tax Prefs" color="purple" />
            <SectionIcon section="account" icon={Shield} label="Account" color="rose" />
          </div>

          {/* Mobile: Active Section Indicator */}
          <div className="lg:hidden text-center">
            <p className="text-xs text-gray-500">
              Selected: <span className="font-bold text-levy-teal">
                {activeSection === 'profile' && 'Profile Information'}
                {activeSection === 'financials' && 'Financial Details'}
                {activeSection === 'preferences' && 'Tax Preferences'}
                {activeSection === 'account' && 'Account Management'}
              </span>
            </p>
          </div>

          {/* Account Status Card - Hidden on Mobile, shown on Desktop */}
          <div className="hidden lg:block bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-levy-teal/20 to-transparent rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full translate-y-4 -translate-x-4" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAdmin 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                    : isPro 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                      : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}>
                  {isAdmin ? (
                    <Shield size={20} className="text-white" />
                  ) : isPro ? (
                    <Crown size={20} className="text-white" />
                  ) : (
                    <User size={20} className="text-white" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-sm block">
                    {isAdmin ? 'Admin Account' : isPro ? 'Pro Account' : 'Free Account'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isAdmin 
                      ? 'Full access privileges' 
                      : isPro 
                        ? 'Premium features unlocked'
                        : 'Basic features only'
                    }
                  </span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-xs text-gray-300">
                  {isAdmin 
                    ? 'Permanent Pro access with admin privileges' 
                    : isPro 
                      ? `Expires: ${profile.subscriptionExpiryDate ? new Date(profile.subscriptionExpiryDate).toLocaleDateString() : 'Never'}`
                      : 'Upgrade for unlimited calculations & AI features'
                  }
                </p>
                <p className="text-[10px] text-gray-500 mt-2 font-mono">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div ref={contentRef} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg">
              {activeSection === 'profile' && 'Profile Information'}
              {activeSection === 'financials' && 'Financial Details'}
              {activeSection === 'preferences' && 'Tax Preferences'}
              {activeSection === 'account' && 'Account Management'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeSection === 'profile' && 'Your personal and contact information'}
              {activeSection === 'financials' && 'Income, deductions, and asset information'}
              {activeSection === 'preferences' && 'Customize your tax calculation settings'}
              {activeSection === 'account' && 'Manage your account and sign out'}
            </p>
          </div>
          
          <div className="p-6">
          {activeSection === 'profile' && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-levy-teal/30 focus:border-levy-teal focus:bg-white transition-all duration-200 text-gray-900 font-medium"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={editedProfile.phoneNumber}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-levy-teal/30 focus:border-levy-teal focus:bg-white transition-all duration-200 text-gray-900 font-medium"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State of Residence</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <select
                    value={editedProfile.stateOfResidence}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, stateOfResidence: e.target.value }))}
                    className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-levy-teal/30 focus:border-levy-teal focus:bg-white transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer"
                  >
                    {NIGERIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'financials' && (
            <div className="space-y-6">
              {editedProfile.entityType === EntityType.INDIVIDUAL ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Annual Gross Income */}
                  <FormattedNumberInput
                    label="Annual Gross Income"
                    value={editedProfile.annualGrossIncome}
                    onChange={(value) => setEditedProfile(prev => ({ ...prev, annualGrossIncome: value }))}
                    hint="Your total yearly income before deductions"
                  />

                  {/* Pension Contribution */}
                  <FormattedNumberInput
                    label="Monthly Pension Contribution"
                    value={editedProfile.pensionContribution}
                    onChange={(value) => setEditedProfile(prev => ({ ...prev, pensionContribution: value }))}
                    hint="Typically 8% of basic salary"
                  />

                  {/* NHF Contribution */}
                  <FormattedNumberInput
                    label="Monthly NHF Contribution"
                    value={editedProfile.nhfContribution}
                    onChange={(value) => setEditedProfile(prev => ({ ...prev, nhfContribution: value }))}
                    hint="2.5% of basic salary"
                  />

                  {/* Rent Paid */}
                  <FormattedNumberInput
                    label="Annual Rent Paid"
                    value={editedProfile.rentPaid}
                    onChange={(value) => setEditedProfile(prev => ({ ...prev, rentPaid: value }))}
                    hint="For Rent Relief (20% or ₦500k max)"
                  />

                  {/* Life Insurance */}
                  <FormattedNumberInput
                    label="Annual Life Insurance Premium"
                    value={editedProfile.lifeInsurance}
                    onChange={(value) => setEditedProfile(prev => ({ ...prev, lifeInsurance: value }))}
                    hint="Qualifies for tax relief"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Annual Turnover */}
                  <FormattedNumberInput
                    label="Annual Turnover"
                    value={editedProfile.annualTurnover}
                    onChange={(value) => setEditedProfile(prev => ({ ...prev, annualTurnover: value }))}
                    hint="Companies ≤₦50m are Small Company (0% CIT)"
                  />

                  {/* Total Fixed Assets */}
                  <FormattedNumberInput
                    label="Total Fixed Assets"
                    value={editedProfile.totalFixedAssets}
                    onChange={(value) => setEditedProfile(prev => ({ ...prev, totalFixedAssets: value }))}
                    hint="For Small Company classification (≤₦250m)"
                  />
                </div>
              )}
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="space-y-8">
              {/* Persona Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">Your Tax Persona</label>
                <p className="text-xs text-gray-500 mb-4 -mt-2">Select the option that best describes your tax situation</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PersonaCard persona={PersonaType.SALARY} />
                  <PersonaCard persona={PersonaType.BUSINESS} />
                  <PersonaCard persona={PersonaType.FREELANCER} />
                  <PersonaCard persona={PersonaType.COMPANY} />
                  <PersonaCard persona={PersonaType.CRYPTO} />
                </div>
              </div>

              {/* Policy Year */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">Preferred Tax Policy</label>
                <p className="text-xs text-gray-500 mb-4 -mt-2">Choose which tax law to use for calculations</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setEditedProfile(prev => ({ ...prev, preferredPolicy: 'ACT_2024' }))}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${
                      editedProfile.preferredPolicy === 'ACT_2024'
                        ? 'border-levy-teal bg-gradient-to-br from-levy-teal/10 to-emerald-50 shadow-lg shadow-levy-teal/10'
                        : 'border-gray-100 bg-white hover:border-levy-teal/30 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        editedProfile.preferredPolicy === 'ACT_2024' 
                          ? 'bg-gradient-to-br from-levy-teal to-emerald-600 text-white' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-levy-teal/10 group-hover:text-levy-teal'
                      }`}>
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-sm ${editedProfile.preferredPolicy === 'ACT_2024' ? 'text-levy-teal' : 'text-gray-900'}`}>
                            Finance Act 2020
                          </span>
                          {editedProfile.preferredPolicy === 'ACT_2024' && (
                            <div className="w-6 h-6 bg-gradient-to-br from-levy-teal to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-levy-teal/30">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">Current law with CRA deductions and traditional tax bands</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setEditedProfile(prev => ({ ...prev, preferredPolicy: 'ACT_2026_PROPOSED' }))}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 group relative overflow-hidden ${
                      editedProfile.preferredPolicy === 'ACT_2026_PROPOSED'
                        ? 'border-levy-teal bg-gradient-to-br from-levy-teal/10 to-emerald-50 shadow-lg shadow-levy-teal/10'
                        : 'border-gray-100 bg-white hover:border-levy-teal/30 hover:shadow-md'
                    }`}
                  >
                    {/* NEW Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] px-2 py-1 rounded-full font-bold shadow-lg shadow-green-500/30">
                        NEW
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        editedProfile.preferredPolicy === 'ACT_2026_PROPOSED' 
                          ? 'bg-gradient-to-br from-levy-teal to-emerald-600 text-white' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-levy-teal/10 group-hover:text-levy-teal'
                      }`}>
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1 pr-12">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-sm ${editedProfile.preferredPolicy === 'ACT_2026_PROPOSED' ? 'text-levy-teal' : 'text-gray-900'}`}>
                            Nigeria Tax Act 2025
                          </span>
                          {editedProfile.preferredPolicy === 'ACT_2026_PROPOSED' && (
                            <div className="w-6 h-6 bg-gradient-to-br from-levy-teal to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-levy-teal/30">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">Effective Jan 2026 • ₦800k exempt • 6 progressive bands</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="space-y-6">
              {/* Feedback Section */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 mb-1">Send Feedback</h4>
                    <p className="text-sm text-blue-700/70 mb-4">Help us improve LevyMate by sharing your thoughts, suggestions, or reporting issues.</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (onViewFeedback) {
                          onViewFeedback();
                        }
                      }}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 cursor-pointer active:scale-95"
                    >
                      <MessageSquare size={18} /> Give Feedback
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout Section */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <LogOut size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Log Out</h4>
                    <p className="text-sm text-gray-500 mb-4">Sign out of your LevyMate account on this device.</p>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLogout(); }}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all duration-300 cursor-pointer active:scale-95"
                      >
                        <LogOut size={18} /> Log Out
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 mb-1">Delete Account</h4>
                    <p className="text-sm text-red-700/70 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteModalOpen(true); }}
                      className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-all duration-300 cursor-pointer active:scale-95"
                    >
                      <Trash2 size={18} /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Floating Save Button for Mobile - appears when there are changes */}
      {hasChanges && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-levy-teal to-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-levy-teal/30 active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            {isSaving ? (
              <><Loader2 size={20} className="animate-spin" /> Saving...</>
            ) : saveSuccess ? (
              <><CheckCircle2 size={20} /> Saved Successfully!</>
            ) : (
              <><Save size={20} /> Save Changes</>
            )}
          </button>
        </div>
      )}

      {/* Delete Account Modal */}
      {profile.id && (
        <DeleteAccountModal 
          isOpen={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)} 
          profileId={profile.id} 
          onDeleteSuccess={onLogout || (() => {})}
        />
      )}
    </div>
  );
};

export default SettingsPage;