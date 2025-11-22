
import React, { useState, useRef } from 'react';
import { TaxProfile, Transaction, TransactionType, EntityType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { Plus, Trash2, Camera, Filter, Search, X, Calendar, ArrowUpCircle, ArrowDownCircle, Zap, MoreHorizontal, Lock, Smartphone, Download } from 'lucide-react';
import { parseReceiptImage } from '../services/geminiService';
import { createTransaction, deleteTransaction as deleteTransactionDB, updateTransaction } from '../services/amplifyService';
import { validateAndSecureFile } from '../services/security';

interface TransactionManagerProps {
  profile: TaxProfile;
  setProfile: (p: TaxProfile) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ profile, setProfile }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPro = profile.tier === 'Pro';
  
  // Form State
  const [form, setForm] = useState<Partial<Transaction>>({
    type: 'income',
    amount: 0,
    category: INCOME_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    description: '',
    isTaxDeductible: true,
    hasInputVat: false
  });

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
        // 1. Security Check
        const secureFile = await validateAndSecureFile(file);
        
        // 2. Convert to Base64 for Gemini
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Content = base64String.split(',')[1];
            
            try {
                const extractedData = await parseReceiptImage(base64Content);
                
                // 3. Populate Form
                setForm(prev => ({
                    ...prev,
                    amount: extractedData.amount || prev.amount,
                    date: extractedData.date || prev.date,
                    description: extractedData.description || prev.description,
                    category: extractedData.category || prev.category,
                    type: 'expense' // Receipts are usually expenses
                }));
                
                setIsAddModalOpen(true);
            } catch (err) {
                console.error(err);
                alert("Failed to extract data from receipt. Please try again.");
            } finally {
                setIsScanning(false);
            }
        };
        reader.readAsDataURL(secureFile);
        
    } catch (error: any) {
        alert(error.message);
        setIsScanning(false);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTransaction = async () => {
    if (!form.amount || !form.description) return;
    if (!profile.id) {
      console.error('Profile ID required to add transaction');
      return;
    }

    // Check Limits for Free Plan
    if (!isPro) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = profile.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && t.type === form.type;
        });

        if (monthlyTransactions.length >= 50) {
            alert(`You have reached your monthly limit of 50 ${form.type} entries. Upgrade to Pro for unlimited entries.`);
            return;
        }
    }
    
    const newTx: Omit<Transaction, 'id'> = {
      type: form.type as TransactionType,
      amount: Number(form.amount),
      category: form.category || 'Other',
      date: form.date || '',
      description: form.description,
      source: 'manual',
      isVerified: true,
      isTaxDeductible: form.isTaxDeductible,
      hasInputVat: form.hasInputVat
    };
    
    try {
      // Save to database
      const createdTx = await createTransaction(profile.id, newTx);
      
      // Update local state
      setProfile({
        ...profile,
        transactions: [...profile.transactions, { id: createdTx.id, ...newTx }]
      });
      
      setIsAddModalOpen(false);
      setForm({
        type: 'income',
        amount: 0,
        category: INCOME_CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        description: '',
        isTaxDeductible: true,
        hasInputVat: false
      });
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('Failed to save transaction. Please try again.');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      // Delete from database
      await deleteTransactionDB(id);
      
      // Update local state
      setProfile({
        ...profile,
        transactions: profile.transactions.filter(t => t.id !== id)
      });
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const exportReport = () => {
    if (!profile.transactions.length) return;

    // Simple HTML escaping to prevent XSS
    const escapeHtml = (unsafe: string) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LevyMate Transaction Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; color: #333; }
          h1 { color: #1D4ED8; margin-bottom: 10px; }
          .meta { margin-bottom: 30px; color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th { background-color: #f8fafc; text-align: left; padding: 12px 16px; font-weight: 600; border-bottom: 2px solid #e2e8f0; color: #475569; }
          td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          tr:hover { background-color: #f8fafc; }
          .amount { text-align: right; font-family: monospace; font-weight: 600; }
          .income { color: #16a34a; }
          .expense { color: #dc2626; }
          .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Transaction Report</h1>
        <div class="meta">
          <p><strong>Generated for:</strong> ${escapeHtml(profile.name)}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th style="text-align: right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${profile.transactions.map(t => `
              <tr>
                <td>${escapeHtml(t.date)}</td>
                <td>${escapeHtml(t.description)}</td>
                <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${escapeHtml(t.category)}</span></td>
                <td class="amount ${t.type === 'income' ? 'income' : 'expense'}">
                  ${t.type === 'income' ? '+' : '-'} ₦${t.amount.toLocaleString()}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Generated by LevyMate Tax App
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `levymate_report_${new Date().toISOString().split('T')[0]}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isCompany = profile.entityType === EntityType.COMPANY;

  // Filter transactions
  const filteredTransactions = profile.transactions.filter(t => {
      const matchesType = viewFilter === 'all' ? true : t.type === viewFilter;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">Transactions</h1>
                <p className="text-sm text-gray-500">Track income and {isCompany ? 'Input VAT' : 'deductible expenses'}.</p>
            </div>
            <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                />
                {/* Pro Features Locked for Free Users */}
                <button 
                    disabled={!isPro || isScanning}
                    onClick={handleScanClick}
                    className={`px-3 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        isPro ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={isPro ? "Scan Receipt" : "Upgrade to Pro to use Receipt Scanning"}
                >
                    {isScanning ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                    ) : (
                        isPro ? <Camera size={20} /> : <Lock size={16} />
                    )}
                    <span className="hidden md:inline">{isScanning ? 'Scanning...' : 'Scan Receipt'}</span>
                </button>
                
                <button 
                    disabled={!isPro}
                    onClick={exportReport}
                    className={`px-3 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        isPro ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={isPro ? "Export Data to HTML Report" : "Upgrade to Pro to Export Data"}
                >
                    {isPro ? <Download size={20} /> : <Lock size={16} />}
                    <span className="hidden md:inline">Export Report</span>
                </button>

                <button 
                    onClick={() => {
                        setForm(prev => ({ ...prev, type: 'income' }));
                        setIsAddModalOpen(true);
                    }}
                    className="bg-levy-blue text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} /> Record Entry
                </button>
            </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-xl border border-gray-200">
            {/* Filter Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full md:w-auto">
                <button 
                    onClick={() => setViewFilter('all')}
                    className={`flex-1 md:w-24 py-2 text-sm font-medium rounded-md transition-all ${viewFilter === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setViewFilter('income')}
                    className={`flex-1 md:w-24 py-2 text-sm font-medium rounded-md transition-all ${viewFilter === 'income' ? 'bg-white text-green-700 shadow' : 'text-gray-500 hover:text-green-700'}`}
                >
                    Income
                </button>
                <button 
                    onClick={() => setViewFilter('expense')}
                    className={`flex-1 md:w-24 py-2 text-sm font-medium rounded-md transition-all ${viewFilter === 'expense' ? 'bg-white text-red-700 shadow' : 'text-gray-500 hover:text-red-700'}`}
                >
                    Expenses
                </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-levy-blue/20 outline-none text-gray-900"
                />
            </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
             {filteredTransactions.length === 0 ? (
                 <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Filter size={24} className="opacity-30"/>
                     </div>
                     <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                     <p className="text-sm text-gray-500 mt-1">Adjust your filters or record a new entry.</p>
                 </div>
             ) : (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Description</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Category</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Amount</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">{t.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{t.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.type === 'expense' && (
                                            <div className="flex flex-col gap-1">
                                                {t.hasInputVat && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                                                        <Zap size={8}/> VAT Claim
                                                    </span>
                                                )}
                                                {!t.isTaxDeductible && (
                                                    <span className="text-[10px] text-gray-400 italic">Non-deductible</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {t.type === 'income' ? '+' : '-'} ₦{t.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => deleteTransaction(t.id)}
                                            className="text-gray-300 hover:text-red-500 transition-all"
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                 </div>
             )}
        </div>
        
        {/* Add Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-gray-900">Record Transaction</h3>
                        <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full"><X size={18}/></button>
                    </div>
                    
                    <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
                        <button onClick={() => setForm({...form, type: 'income'})} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${form.type === 'income' ? 'bg-white shadow-sm text-green-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>Income</button>
                        <button onClick={() => setForm({...form, type: 'expense'})} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${form.type === 'expense' ? 'bg-white shadow-sm text-red-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>Expense</button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₦</span>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all font-bold text-lg" 
                                onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                            <input 
                                type="date"
                                value={form.date}
                                onChange={e => setForm({...form, date: e.target.value})}
                                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-levy-blue/20 text-sm"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                             <select 
                                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-levy-blue/20 text-sm"
                                value={form.category}
                                onChange={e => setForm({...form, category: e.target.value})}
                             >
                                 {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                                     <option key={c} value={c}>{c}</option>
                                 ))}
                             </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Client Payment, Office Rent" 
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-levy-blue/20" 
                            onChange={e => setForm({...form, description: e.target.value})} 
                        />
                    </div>
                    
                    {form.type === 'expense' && (
                        <div className="space-y-3 pt-2">
                            <div className="p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-levy-blue/30 transition-all group">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.isTaxDeductible} onChange={e => setForm({...form, isTaxDeductible: e.target.checked})} className="w-5 h-5 text-levy-blue rounded border-gray-300 focus:ring-levy-blue" />
                                    <span className="font-medium text-gray-800">WREN Test Passed (Deductible)</span>
                                </label>
                                <p className="text-xs text-gray-500 italic mt-1.5 ml-8 leading-relaxed">
                                    Only check this if the expense was incurred <span className="font-semibold text-gray-700">Wholly, Reasonably, Exclusively, and Necessarily</span> for the business. Personal expenses do not qualify.
                                </p>
                            </div>

                            <div className="p-3 border border-blue-100 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-all group">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={form.hasInputVat} onChange={e => setForm({...form, hasInputVat: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="font-medium text-blue-900">Includes VAT (Claim Input Credit)</span>
                                </label>
                                <p className="text-xs text-blue-700/70 italic mt-1.5 ml-8 leading-relaxed">
                                    Check this if you paid VAT (7.5%) on this service or asset. Under the 2026 Act, you can deduct this "Input VAT" from the VAT you collect from customers.
                                </p>
                            </div>
                        </div>
                    )}

                    <button onClick={addTransaction} className="w-full bg-levy-blue hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold transition-colors mt-2 shadow-lg shadow-blue-900/20">Save Entry</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default TransactionManager;
