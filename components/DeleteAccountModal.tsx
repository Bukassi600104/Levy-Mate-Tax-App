import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader, CheckCircle, ShieldAlert } from 'lucide-react';
import { authRequestDeleteCode, authDeleteUser } from '../services/authService';
import { deleteProfile, deleteTransactionsByProfile } from '../services/amplifyService';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onDeleteSuccess: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, profileId, onDeleteSuccess }) => {
  const [step, setStep] = useState<'warning' | 'code' | 'processing'>('warning');
  const [deleteInput, setDeleteInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('warning');
      setDeleteInput('');
      setCodeInput('');
      setGeneratedCode(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestCode = async () => {
    if (deleteInput !== 'DELETE') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const code = await authRequestDeleteCode();
      setGeneratedCode(code);
      setStep('code');
      // In a real app, the code goes to email. Here we alert it for testing purposes as per the mock implementation.
      alert(`DEMO: Your confirmation code is ${code}`);
    } catch (err) {
      setError('Failed to send confirmation code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (codeInput !== generatedCode) {
      setError('Invalid confirmation code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('processing');

    try {
      // 1. Delete Transactions
      await deleteTransactionsByProfile(profileId);
      
      // 2. Delete Profile
      await deleteProfile(profileId);
      
      // 3. Delete Auth User
      await authDeleteUser();

      // 4. Complete
      onDeleteSuccess();
    } catch (err: any) {
      console.error('Deletion error:', err);
      setError(err.message || 'Failed to delete account. Please contact support.');
      setStep('code'); // Go back to allow retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-50 p-6 border-b border-red-100 flex justify-between items-start">
          <div className="flex gap-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Delete Account</h3>
              <p className="text-xs text-red-700 mt-1">This action is permanent and irreversible.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-300 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {step === 'warning' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                You are about to permanently delete your LevyMate account. All your data, including:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <li>Personal Profile & Settings</li>
                <li>Transaction History</li>
                <li>Tax Calculations & Reports</li>
                <li>Subscription Status</li>
              </ul>
              <p className="text-gray-600 text-sm font-bold">
                This data cannot be recovered once deleted.
              </p>

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Type "DELETE" to continue
                </label>
                <input 
                  type="text" 
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold text-gray-900 placeholder:font-normal"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestCode}
                  disabled={deleteInput !== 'DELETE' || isLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader className="animate-spin" size={18} /> : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} />
                </div>
                <h4 className="font-bold text-gray-900">Verify It's You</h4>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a confirmation code to your email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Confirmation Code
                </label>
                <input 
                  type="text" 
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-lg tracking-widest text-center"
                  maxLength={6}
                />
              </div>

              <button 
                onClick={handleConfirmDelete}
                disabled={codeInput.length < 6 || isLoading}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <Loader className="animate-spin" size={18} /> : 'Confirm Permanent Deletion'}
              </button>
              
              <button 
                onClick={() => setStep('warning')}
                className="w-full py-2 text-gray-400 text-sm hover:text-gray-600"
              >
                Back
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
              <Loader className="animate-spin text-red-600 mx-auto" size={48} />
              <h4 className="font-bold text-gray-900">Deleting Account...</h4>
              <p className="text-sm text-gray-500">Please wait while we scrub your data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
