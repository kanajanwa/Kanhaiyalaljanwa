import React, { useState } from 'react';
import { DonationCause, DonationRecord } from '../types.js';
import { Landmark, ArrowUpRight, CheckCircle2, AlertCircle, FileSpreadsheet, Lock, HelpCircle } from 'lucide-react';

interface DonationsSectionProps {
  causes: DonationCause[];
  donations: DonationRecord[];
  onAddDonation: (donation: { causeId: string; donorName: string; gotra: string; village: string; amount: number; mobile: string; transactionId: string; message: string; instantApprove?: boolean; screenshot?: string }) => Promise<void>;
  onVerifyDonation: (id: string) => Promise<void>;
  onRefreshDatabase?: () => void;
}

export default function DonationsSection({ causes, donations, onAddDonation, onVerifyDonation, onRefreshDatabase }: DonationsSectionProps) {
  // Navigation modes
  const [activeDonationTab, setActiveDonationTab] = useState<'causes' | 'submit' | 'history' | 'auditor' | 'helpline'>('causes');

  // Form states
  const [selectedCauseId, setSelectedCauseId] = useState('');
  const [donorName, setDonorName] = useState('');
  const [gotra, setGotra] = useState('');
  const [village, setVillage] = useState('');
  const [amount, setAmount] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cash' | 'other'>('gpay');
  const [transactionId, setTransactionId] = useState('GPAY_' + Math.floor(10000000 + Math.random() * 90000000));
  const [message, setMessage] = useState('');
  const [instantApprove, setInstantApprove] = useState(true);
  const [screenshot, setScreenshot] = useState('');
  const [fileName, setFileName] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Submit feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helpline states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DonationRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [helplineSuccess, setHelplineSuccess] = useState('');
  const [helplineError, setHelplineError] = useState('');

  // Individual correction inline form states
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<string | null>(null);
  const [corrTxId, setCorrTxId] = useState('');
  const [corrScreenshot, setCorrScreenshot] = useState('');
  const [corrFileName, setCorrFileName] = useState('');
  const [corrMessage, setCorrMessage] = useState('');
  const [corrBonusName, setCorrBonusName] = useState('');
  const [corrBonusMobile, setCorrBonusMobile] = useState('');
  const [isUpdatingCorrection, setIsUpdatingCorrection] = useState(false);

  // Missing Dispute Ticket form state
  const [showMissingTicketForm, setShowMissingTicketForm] = useState(false);
  const [disputeCauseId, setDisputeCauseId] = useState('');
  const [disputeName, setDisputeName] = useState('');
  const [disputeGotra, setDisputeGotra] = useState('');
  const [disputeVillage, setDisputeVillage] = useState('');
  const [disputeAmount, setDisputeAmount] = useState('');
  const [disputeMobile, setDisputeMobile] = useState('');
  const [disputeTxId, setDisputeTxId] = useState('');
  const [disputeMsg, setDisputeMsg] = useState('');
  const [disputeScreenshot, setDisputeScreenshot] = useState('');
  const [disputeFileName, setDisputeFileName] = useState('');

  const handleSearchHelpline = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      alert("कृपया खोजने के लिए मोबाइल नंबर अथवा ट्रांजेक्शन ID दर्ज करें।");
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    
    const matched = donations.filter(d => 
      d.mobile.toLowerCase().includes(q) || 
      d.transactionId.toLowerCase().includes(q) ||
      d.donorName.toLowerCase().includes(q)
    );
    
    setSearchResults(matched);
    setHasSearched(true);
    setHelplineSuccess('');
    setHelplineError('');
  };

  const handleUpdateCorrection = async (recordId: string) => {
    if (!corrTxId.trim()) {
      alert("कृपया मान्य ट्रांजेक्शन आईडी विवरण लिखें।");
      return;
    }
    setIsUpdatingCorrection(true);
    setHelplineError('');
    setHelplineSuccess('');
    try {
      const response = await fetch(`/api/donations/${recordId}/correct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: corrTxId.trim(),
          screenshot: corrScreenshot,
          message: corrMessage.trim() || undefined,
          donorName: corrBonusName.trim() || undefined,
          mobile: corrBonusMobile.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error("विवरण संशोधित करने में असफलता हुई।");
      }

      await response.json();
      setHelplineSuccess("आपका भुगतान संशोधन विवरण सफलतापूर्वक लेखा टीम/ऑडिटर के पास भेज दिया गया है! धन्यवाद सा।");
      
      if (onRefreshDatabase) {
         onRefreshDatabase();
      }
      
      // Reset correction forms
      setSelectedCorrectionId(null);
      setCorrTxId('');
      setCorrScreenshot('');
      setCorrFileName('');
      setCorrMessage('');
      setCorrBonusName('');
      setCorrBonusMobile('');
      
      // Reload results
      setTimeout(() => {
        const freshMatches = donations.filter(d => 
          d.mobile.toLowerCase().includes(searchQuery.trim().toLowerCase()) || 
          d.transactionId.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          d.donorName.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );
        setSearchResults(freshMatches);
      }, 500);

    } catch (err: any) {
      setHelplineError(err.message || 'संशोधन अपडेट करने में सामान्य भूल हुई सा।');
    } finally {
      setIsUpdatingCorrection(false);
    }
  };

  const handleAddDisputeTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeCauseId || !disputeName || !disputeAmount) {
      alert("कृपया विषय, सहयोगी का नाम और सहयोग राशि अवश्य भरें।");
      return;
    }
    const val = parseFloat(disputeAmount);
    if (isNaN(val) || val <= 0) {
      alert("कृपया मान्य राशि भरें।");
      return;
    }

    setIsSubmitting(true);
    setHelplineError('');
    setHelplineSuccess('');

    try {
      const disputeMessage = `🚩 [भुगतान सहायता टिकट] - ${disputeMsg || 'खाते से पैसे डेबिट हुए पर नाम नहीं आया।'}`;
      
      await onAddDonation({
        causeId: disputeCauseId,
        donorName: disputeName.trim(),
        gotra: disputeGotra.trim(),
        village: disputeVillage.trim(),
        amount: val,
        mobile: disputeMobile.trim(),
        transactionId: disputeTxId.trim() || `DIS_UPI_${Math.floor(Math.random() * 100000000)}`,
        message: disputeMessage,
        instantApprove: false,
        screenshot: disputeScreenshot
      });

      setHelplineSuccess("आपका लापता भुगतान सहायता टिकट मय विवरण सफलतापूर्वक दर्ज कर लिया गया है! हमारी लेखा टीम आपका सहयोग और ट्रांजेक्शन सत्यापित कर जल्द ही सक्रिय कर देगी। राम राम सा।");
      
      setDisputeCauseId('');
      setDisputeName('');
      setDisputeGotra('');
      setDisputeVillage('');
      setDisputeAmount('');
      setDisputeMobile('');
      setDisputeTxId('');
      setDisputeMsg('');
      setDisputeScreenshot('');
      setDisputeFileName('');
      setShowMissingTicketForm(false);
      
      if (onRefreshDatabase) {
        onRefreshDatabase();
      }
    } catch (err: any) {
      setHelplineError(err.message || "टिकट दर्ज करने में त्रुटि हुई सा।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("फ़ाइल का आकार 3MB से कम होना चाहिए।");
        return;
      }
      setCorrFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCorrScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDisputeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("फ़ाइल का आकार 3MB से कम होना चाहिए।");
        return;
      }
      setDisputeFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDisputeScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCauseId || !donorName || !amount) {
      alert("कृपया आवश्यक जानकारी (सहयोग विषय, नाम, राशि) भरें।");
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert("कृपया मान्य सहयोग राशि दर्ज करें।");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      await onAddDonation({
        causeId: selectedCauseId,
        donorName,
        gotra,
        village,
        amount: val,
        mobile,
        transactionId: transactionId || `${selectedUpiApp.toUpperCase()}_${Math.floor(10000000 + Math.random() * 90000000)}`,
        message,
        instantApprove: instantApprove,
        screenshot: screenshot
      });

      if (instantApprove) {
        setSuccessMsg("कृपया ध्यान दें: आपका यूपीआई भुगतान प्राप्त हो गया है (Payment Received) और आपकी दान राशि सफलतापूर्वक सत्यापित कर सीधे लाइव प्रोग्रेस कोष में जोड़ दी गई है! सहयोग सूची में आपका नाम दर्ज हो चुका है।");
      } else {
        setSuccessMsg("आपका सहयोग दर्ज कर लिया गया है! सुरक्षा एवं ऑडिट कारणों से यह हमारे 'ऑडिटर सूची' में लंबित है। जैसे ही ऑडिटर इसे सत्यापित करते हैं, यह लाइव फंड्स में जुड़ जाएगा।");
      }
      
      // Reset fields
      setSelectedCauseId('');
      setDonorName('');
      setGotra('');
      setVillage('');
      setAmount('');
      setMobile('');
      setTransactionId('GPAY_' + Math.floor(10000000 + Math.random() * 90000000));
      setMessage('');
      setSelectedUpiApp('gpay');
      setScreenshot('');
      setFileName('');
      
      // Auto move back to causes tab or success
    } catch (err: any) {
      alert(err.message || "पंजीकरण में त्रुटि हुई।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await onVerifyDonation(id);
      alert("भुगतान प्राप्त हुआ (Payment Received)! सहयोग राशि सफलतापूर्वक सत्यापित कर सक्रिय फंड में जोड़ दी गई है।");
    } catch (err: any) {
      alert(err.message || "सत्यापन में त्रुटि हुई।");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("फ़ाइल का आकार 3MB से कम होना चाहिए।");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Tab Bar */}
      <div className="bg-white p-2 rounded-xl border border-amber-100 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => { setActiveDonationTab('causes'); setSuccessMsg(''); }}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeDonationTab === 'causes'
              ? 'bg-amber-600 text-white'
              : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
          }`}
        >
          सहयोग परियोजनाएं (Causes)
        </button>
        <button
          onClick={() => { setActiveDonationTab('submit'); setSuccessMsg(''); }}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeDonationTab === 'submit'
              ? 'bg-amber-600 text-white'
              : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
          }`}
        >
          सहयोग प्रविष्टि (Pledge)
        </button>
        <button
          onClick={() => { setActiveDonationTab('history'); setSuccessMsg(''); }}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeDonationTab === 'history'
              ? 'bg-amber-600 text-white'
              : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
          }`}
        >
          सहयोगियों की सूची (Wall)
        </button>
        <button
          onClick={() => { setActiveDonationTab('auditor'); setSuccessMsg(''); }}
          className={`flex-1 py-1 px-3 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDonationTab === 'auditor'
              ? 'bg-red-700 text-white border-red-700'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          खाता सत्यापन (Auditor)
        </button>
        <button
          onClick={() => { setActiveDonationTab('helpline'); setSuccessMsg(''); setHelplineSuccess(''); setHelplineError(''); }}
          className={`flex-1 py-1 px-3 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeDonationTab === 'helpline'
              ? 'bg-amber-800 text-white'
              : 'text-amber-800 hover:bg-amber-50 hover:text-amber-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          भुगतान सहायता (Troubleshoot)
        </button>
      </div>

      {/* 1. CAUSES/PROJECTS TAB */}
      {activeDonationTab === 'causes' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
            <h3 className="text-lg font-bold text-gray-800">समाज विकास कोष</h3>
            <p className="text-xs text-gray-500 mt-1">समाज की विभिन्न आधारभूत संरचनाओं, छात्रावासों तथा जरूरतमंद परिवारों की सहायता हेतु सक्रिय प्रोजेक्ट्स</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {causes.map((cause) => {
              const rawPct = (cause.raisedAmount / cause.targetAmount) * 100;
              const percent = Math.min(Math.round(rawPct), 100);
              
              return (
                <div key={cause.id} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-100">
                      {cause.category === 'भवन-निर्माण' ? 'भवन एवं छात्रावास' : cause.category === 'शिक्षा-मदद' ? 'मेधावी छात्रवृत्ति' : cause.category === 'चिकित्सा-मदद' ? 'चिकित्सा आपात' : cause.category === 'धार्मिक-योगदान' ? 'धार्मिक आयोजन' : cause.category === 'रक्तदान-मदद' ? 'रक्तदान सहयोग' : 'सामान्य कोष'}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{cause.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{cause.description}</p>
                  </div>

                  {/* Meter graph container */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-500">संग्रह प्रगति:</span>
                      <span className="text-amber-700">{percent}%</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-gray-100 h-2 md:h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">प्राप्त राशि:</span>
                        <span className="text-amber-700 font-bold">{formatCurrency(cause.raisedAmount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block text-[9px] uppercase font-bold">कोष लक्ष्य:</span>
                        <span className="text-gray-700 font-bold">{formatCurrency(cause.targetAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCauseId(cause.id);
                      setActiveDonationTab('submit');
                    }}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    सहयोग राशि जमा करें
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. PLEDGE FORM TAB */}
      {activeDonationTab === 'submit' && (
        <div className="bg-white rounded-2xl border border-amber-100/70 p-6 space-y-6 max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-gray-900">श्री जणवा समाज मेवाड़ भामाशाह समर्पण प्रविष्टि</h3>
            <p className="text-xs text-gray-500 mt-1">समाज विकास कार्यों में आपके द्वारा भेजे गए स्वैच्छिक योगदान को समाज के रिकॉर्ड में दर्ज करें।</p>
          </div>

          {successMsg ? (
            <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-900 text-sm">सहयोग प्राप्त हुआ!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">{successMsg}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSuccessMsg(''); setActiveDonationTab('history'); }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                >
                  सहयोगियों की सूची देखें
                </button>
                <button
                  onClick={() => { setSuccessMsg(''); setActiveDonationTab('auditor'); }}
                  className="px-4 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded text-xs font-bold cursor-pointer"
                >
                  ऑडिटर के रूप में सत्यापित करें
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitDonation} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">सहयोग परियोजना विषय *</label>
                  <select
                    required
                    value={selectedCauseId}
                    onChange={(e) => setSelectedCauseId(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">-- परियोजना का चयन करें --</option>
                    {causes.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">सहयोग राशि (INR रूपये) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="जैसे: 5100, 11000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">सहयोगी भामाशाह का पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="जैसे: भंवरलाल जणवा"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">गोत्र (Gotra)</label>
                  <input
                    type="text"
                    placeholder="जैसे: पचार, मांडोवी"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">मूल निवास / ग्राम (Village)</label>
                  <input
                    type="text"
                    placeholder="जैसे: कपासन, भीलवाड़ा"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">मोबाइल नंबर (Mobile)</label>
                  <input
                    type="tel"
                    placeholder="जैसे: 9414XXXX12"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* UPI APP SELECTION BUTTONS */}
              <div className="space-y-3 bg-amber-50/20 p-4 rounded-xl border border-amber-100">
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wide">
                  भुगतान माध्यम चुनें (Select Payment Option) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'gpay', label: 'Google Pay', desc: 'गूगल पे', color: 'border-blue-500 bg-blue-50/30 text-blue-900 focus:ring-blue-300' },
                    { id: 'phonepe', label: 'PhonePe', desc: 'फ़ोनपे', color: 'border-purple-500 bg-purple-50/30 text-purple-900 focus:ring-purple-300' },
                    { id: 'paytm', label: 'Paytm', desc: 'पेटीएम', color: 'border-sky-500 bg-sky-50/30 text-sky-900 focus:ring-sky-300' },
                    { id: 'bhim', label: 'BHIM UPI', desc: 'भीम यूपीआई', color: 'border-green-600 bg-green-50/30 text-green-900 focus:ring-green-300' },
                    { id: 'cash', label: 'नकद (Cash Handover)', desc: 'प्रभारी को सौंपें', color: 'border-amber-600 bg-amber-50/30 text-amber-900 focus:ring-amber-300' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setSelectedUpiApp(app.id as any);
                        const rand = Math.floor(10000000 + Math.random() * 90000000);
                        if (app.id === 'cash') {
                          setTransactionId('CASH_HANDOVER_' + Math.floor(1000 + Math.random() * 9000));
                        } else {
                          setTransactionId(app.id.toUpperCase() + '_' + rand);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        selectedUpiApp === app.id
                          ? `${app.color} border-2 scale-[1.02] shadow-sm`
                          : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50/10'
                      }`}
                    >
                      <span className="text-xs font-black">{app.label}</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{app.desc}</span>
                    </button>
                  ))}
                </div>

                {selectedUpiApp !== 'cash' && (
                  <div className={`mt-3 border rounded-2xl overflow-hidden shadow-md transition-all duration-300 max-w-sm mx-auto ${
                    selectedUpiApp === 'phonepe' ? 'border-[#5f259f]/30 bg-[#5f259f]/5' : 
                    selectedUpiApp === 'gpay' ? 'border-blue-200 bg-blue-50/5' : 
                    selectedUpiApp === 'paytm' ? 'border-sky-200 bg-sky-50/5' : 'border-green-200 bg-green-50/5'
                  }`}>
                    {/* Standee Header */}
                    <div className={`px-4 py-2.5 text-white flex items-center justify-between font-black text-xs select-none shadow-sm ${
                      selectedUpiApp === 'phonepe' ? 'bg-[#5f259f]' : 
                      selectedUpiApp === 'gpay' ? 'bg-blue-600' : 
                      selectedUpiApp === 'paytm' ? 'bg-[#002f6c]' : 'bg-[#009247]'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">✨</span>
                        <span>
                          {selectedUpiApp === 'phonepe' ? 'PhonePe' : 
                           selectedUpiApp === 'gpay' ? 'Google Pay' : 
                           selectedUpiApp === 'paytm' ? 'Paytm' : 'BHIM UPI'} Merchant QR
                        </span>
                      </div>
                      <span className="text-[8px] uppercase font-black tracking-widest bg-white/20 px-2 py-0.5 rounded">
                        All UPI Accepted
                      </span>
                    </div>

                    {/* Standee Body */}
                    <div className="p-4 flex flex-col items-center text-center space-y-3">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-gray-900">श्री जणवा समाज मेवाड़ कल्याण (Janwa Samaj Kalyan)</h4>
                        <div className="flex items-center justify-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[8px] font-black text-gray-400 tracking-wider">प्रमाणित यूपीआई खाता (VERIFIED UPI MERCHANT)</span>
                        </div>
                      </div>

                      {/* The QR Container with Absolute Center Overlays */}
                      <div className="relative p-2 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-xs flex items-center justify-center select-all">
                        <img 
                          referrerPolicy="no-referrer"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0-0-0&data=${encodeURIComponent(
                            `upi://pay?pa=9928593812-5@ybl&pn=Janwa%20Samaj%20Kalyan&am=${amount || '5100'}&cu=INR`
                          )}`} 
                          alt="Merchant UPI QR Code" 
                          className="w-32 h-32 rounded-lg select-none"
                        />
                        {/* Dynamic Centered Brand Logo Overlay */}
                        {selectedUpiApp === 'phonepe' && (
                          <div className="absolute w-[28px] h-[28px] rounded-full bg-[#5f259f] border-2 border-white flex items-center justify-center shadow-lg select-none">
                            <span className="text-white text-[10px] font-black font-sans leading-none">पे</span>
                          </div>
                        )}
                        {selectedUpiApp === 'gpay' && (
                          <div className="absolute w-[28px] h-[28px] bg-white rounded-full border-2 border-gray-100 flex items-center justify-center shadow-lg select-none p-1">
                            <span className="text-blue-600 text-[9px] font-black tracking-tighter leading-none">G Pay</span>
                          </div>
                        )}
                        {selectedUpiApp === 'paytm' && (
                          <div className="absolute w-[28px] h-[28px] bg-[#002f6c] rounded-full border-2 border-white flex items-center justify-center shadow-lg select-none leading-none">
                            <span className="text-white text-[7px] font-black tracking-tighter scale-90">Paytm</span>
                          </div>
                        )}
                        {selectedUpiApp === 'bhim' && (
                          <div className="absolute w-[28px] h-[28px] bg-[#009247] rounded-full border-2 border-white flex items-center justify-center shadow-lg select-none leading-none">
                            <span className="text-white text-[8px] font-extrabold tracking-tighter">BHIM</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">सहयोग राशि (Amount to Pay)</span>
                        <div className="text-lg font-black text-gray-900 tracking-tight">
                          {formatCurrency(parseFloat(amount) || 5100)}
                        </div>
                      </div>

                      {/* Info & Button */}
                      <div className="w-full bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 space-y-1.5">
                        <div className="text-[10px] text-gray-600 font-sans">
                          यूपीआई आईडी: <code className="bg-amber-100 hover:bg-amber-100/80 text-amber-900 px-1 py-0.5 rounded font-black tracking-wide select-all text-[10px]">9928593812-5@ybl</code>
                        </div>
                        <div className="pt-0.5">
                          <a
                            href={`upi://pay?pa=9928593812-5@ybl&pn=Janwa%20Samaj%20Kalyan&am=${amount || '11000'}&cu=INR`}
                            className={`inline-flex items-center gap-1 text-[10px] text-white font-black px-3.5 py-1.5 rounded-lg shadow-2xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ${
                              selectedUpiApp === 'phonepe' ? 'bg-[#5f259f] hover:bg-[#4b1d7f]' : 
                              selectedUpiApp === 'gpay' ? 'bg-blue-600 hover:bg-blue-700' : 
                              selectedUpiApp === 'paytm' ? 'bg-[#002f6c] hover:bg-[#001f4a]' : 'bg-[#009247] hover:bg-green-700'
                            }`}
                          >
                            🚀 सीधे यूपीआई ऐप खोलें (Pay Direct via App)
                          </a>
                        </div>
                      </div>

                      <div className="text-[9px] text-gray-400 font-serif leading-none italic">
                        "स्कैन करें और किसी भी यूपीआई ऐप जैसे GPay, PhonePe, Paytm, BHIM आदि से सुगम भुगतान करें"
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">UPI ट्रांजेक्शन ID या रसीद संदर्भ संख्या</label>
                  <input
                    type="text"
                    placeholder="जैसे: UPI_93859204910 या कैश प्रविष्टि आईडी"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-gray-300 font-mono"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">चुने गए विकल्प के अनुसार यह रैंडम जनरेटेड या टाइप किया जा सकता है।</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">शुभकामना सन्देश (Message)</label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="समाज के नाम आपका कोई संदेश या शुभकामना..."
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* UPLOAD PAYMENT QR SCREENSHOT / RECEIPT FIELD */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  📁 भुगतान रसीद अथवा स्क्रीनशॉट अपलोड करें (Upload Payment Receipt Screenshot)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-3.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-100 hover:border-gray-400 select-none shadow-3xs active:scale-95 transition-all flex items-center gap-1 shrink-0">
                    <span>फ़ाइल चुनें (Choose File)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
                    {fileName || "कोई फ़ाइल नहीं चुनी गई"}
                  </span>
                  {screenshot && (
                    <button
                      type="button"
                      onClick={() => { setScreenshot(''); setFileName(''); }}
                      className="text-xs text-red-600 hover:text-red-700 font-bold transition-colors cursor-pointer"
                    >
                      हटाएं (Remove)
                    </button>
                  )}
                </div>
                {screenshot && (
                  <div className="mt-2 text-left">
                    <div className="inline-block relative p-1 bg-white border border-gray-200 rounded-lg shadow-2xs group cursor-pointer" onClick={() => setZoomedImage(screenshot)}>
                      <img 
                        src={screenshot} 
                        alt="Receipt preview" 
                        className="max-h-24 rounded object-contain hover:opacity-90 max-w-[150px]" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                        <span className="text-[9px] font-black text-white bg-black/60 px-1.5 py-0.5 rounded">🔍 बड़ा करें</span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-[9px] text-gray-400 font-medium">गबन और त्रुटि की गुंजाइश मिटाने व भौतिक ऑडिटिंग हेतु इस स्वैच्छिक विकल्प का उपयोग करें (अधिकतम 3MB)।</p>
              </div>

              {/* PAYMENT RECEIVED / OPTION BUTTON BY ALL UPI AUTO-APPROVE */}
              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    id="instantApprove"
                    type="checkbox"
                    checked={instantApprove}
                    onChange={(e) => setInstantApprove(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 mt-0.5 cursor-pointer accent-emerald-600"
                  />
                  <div className="space-y-1">
                    <label htmlFor="instantApprove" className="text-xs font-black text-emerald-900 cursor-pointer block select-none">
                      ✓ भुगतान प्राप्त हुआ (Payment Received - Auto-Verify Instant Option)
                    </label>
                    <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
                      इसे चालू रखने पर प्रविष्टि दर्ज करते ही ऑटो-सत्यापित होकर तुरंत 'स्वीकृत' हो जाएगी और समाज की लाइव प्रगति रिपोर्ट में तत्काल जुड़ जाएगी।
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/40 text-[11px] text-amber-900">
                <p className="leading-relaxed text-gray-700 font-medium">
                  <strong>सुरक्षा निर्देश:</strong> जमा की गई सहयोग राशि की पूर्ण सत्यता बनी रहे, इसलिए समाज की लेखा टीम द्वारा सभी यूपीआई प्रविष्टियों का बैकएंड में भौतिक ऑडिट कर मिलान रखा जाता है।
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-amber-400"
              >
                {isSubmitting ? 'प्रविष्टि दर्ज हो रही है...' : `सहयोग राशि प्रविष्टि दर्ज करें (${instantApprove ? 'Instant Approval' : 'Submit Pledge'})`}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. WALL OF DONATION RECORDS */}
      {activeDonationTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">सहयोगियों की गौरव सूची (Honor Roll of Donors)</h3>
              <p className="text-xs text-gray-500 mt-1">समाज कल्याण के पुनीत कार्यों में सहयोग देने वाले प्रबुद्ध नागरिक</p>
            </div>
            <FileSpreadsheet className="w-8 h-8 text-amber-600 shrink-0" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/70 border-b border-amber-100/50 font-bold text-amber-900">
                  <tr>
                    <th className="p-3">सहयोगी नाम (Donor)</th>
                    <th className="p-3">गोत्र / गाँव</th>
                    <th className="p-3">सहयोग परियोजना</th>
                    <th className="p-3 text-right">सहयोग राशि</th>
                    <th className="p-3 text-center">स्थिति</th>
                    <th className="p-3">दिनांक</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">कोई दान रिकॉर्ड अभी तक उपलब्ध नहीं है।</td>
                    </tr>
                  ) : (
                    donations.map((don) => {
                      const cause = causes.find(c => c.id === don.causeId);
                      return (
                        <tr key={don.id} className="hover:bg-amber-50/10">
                          <td className="p-3">
                            <div className="font-bold text-gray-900">{don.donorName}</div>
                            {don.message && <div className="text-[10px] text-gray-500 italic mt-0.5">"{don.message}"</div>}
                            {don.screenshot && (
                              <button
                                onClick={() => setZoomedImage(don.screenshot!)}
                                className="mt-1 text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit"
                              >
                                📷 रसीद देखें (View Receipt)
                              </button>
                            )}
                          </td>
                          <td className="p-3 uppercase">
                            <div>{don.gotra || '---'}</div>
                            <div className="text-[10px] text-gray-500">{don.village || '---'}</div>
                          </td>
                          <td className="p-3 font-semibold text-gray-800 truncate max-w-xs">
                            {cause ? cause.title : 'सामान्य सामाजिक कोष'}
                          </td>
                          <td className="p-3 text-right font-bold text-amber-700">
                            {formatCurrency(don.amount)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              don.status === 'स्वीकृत'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {don.status === 'स्वीकृत' ? '✓ भुगतान प्राप्त हुआ (Received)' : 'लंबित (Pending)'}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500 whitespace-nowrap">{don.date}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDITOR / VERIFICATION WORKFLOW AREA */}
      {activeDonationTab === 'auditor' && (
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-red-900">समाज लेखा परीक्षक नियन्त्रण क्षेत्र (Samaj Auditor Dashboard)</h3>
              <p className="text-xs text-red-700 leading-relaxed">
                यह अनुभाग समाज के लेखाकारों और प्रभारियों के लिए है ताकि वे यूपीआई ट्रांजेक्शन आईडी, बैंक पासबुक या नकद प्राप्ति का भौतिक मिलान करके सहयोग राशि को अधिकृत और स्वीकृत कर सकें। सत्यापन पूर्ण होने पर राशि सीधे लाइव प्रोग्रेस बार तथा कुल संचय फंड में जुड़ जाती है।
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">लंबित समर्थन प्रविष्टियां (Pending Verification Requests)</span>
              <span className="bg-amber-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                {donations.filter(d => d.status === 'लंबित').length} लंबित
              </span>
            </div>

            <div className="space-y-3">
              {donations.filter(d => d.status === 'लंबित').length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  सत्यापन के लिए कोई नया सहयोग लंबित नहीं है। सभी प्रविष्टियां पहले से ही सत्यापित और लेखाबद्ध हैं!
                </div>
              ) : (
                donations.filter(d => d.status === 'लंबित').map((don) => {
                  const cause = causes.find(c => c.id === don.causeId);
                  const isDisputeTicket = don.message && don.message.includes('[भुगतान सहायता टिकट]');
                  return (
                    <div key={don.id} className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-155 ${
                      isDisputeTicket 
                        ? 'bg-red-50/70 border-red-250 border-l-4 border-l-red-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-gray-900 text-sm">{don.donorName}</span>
                          {don.gotra && <span className="text-xs text-gray-500">({don.gotra})</span>}
                          {don.village && <span className="text-xs text-gray-400">गाँव: {don.village}</span>}
                          {isDisputeTicket && (
                            <span className="bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full select-none shadow-3xs animate-pulse">
                              ⚠️ सहायता अनुरोध (Support Ticket)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">विषय: <strong className="text-gray-800">{cause ? cause.title : '---'}</strong></p>
                        <p className="text-xs text-gray-500">ट्रैन्ज़ैक्शन ID: <code className="bg-gray-200 text-gray-700 px-1 rounded text-[10px]">{don.transactionId}</code></p>
                        {don.mobile && <p className="text-xs text-gray-500">सम्पर्क: {don.mobile}</p>}
                        {don.message && <p className="text-xs italic text-gray-400">"{don.message}"</p>}
                        {don.screenshot && (
                          <div className="mt-2 text-left">
                            <span className="text-[10px] text-gray-400 font-black tracking-wide uppercase block mb-1">संलग्न भुगतान रसीद / स्क्रीनशॉट:</span>
                            <div className="inline-block relative p-0.5 bg-white border border-gray-200 rounded-lg shadow-3xs group cursor-pointer" onClick={() => setZoomedImage(don.screenshot!)}>
                              <img 
                                src={don.screenshot} 
                                alt="Auditor receipt preview" 
                                className="max-h-20 rounded object-contain hover:opacity-95 max-w-[130px]"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                <span className="text-[8px] font-black text-white bg-black/70 px-1.5 py-0.5 rounded">पूरी देखें</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 justify-between">
                        <span className="font-bold text-amber-700 text-lg">{formatCurrency(don.amount)}</span>
                        <button
                          onClick={() => handleVerify(don.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          भुगतान प्राप्त हुआ (Payment Received)
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. HELPLINE / PAYMENT TROUBLESHOOTING TAB */}
      {activeDonationTab === 'helpline' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Banner */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-905 text-white p-5 rounded-2xl shadow-md border-b-4 border-yellow-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>⚠️</span>
                यूपीआई सहयोग भुगतान सहायता व समाधान केंद्र
              </h3>
              <p className="text-xs text-amber-100 leading-relaxed font-sans font-medium">
                खाते से राशि कटने पर नाम न दिखने, रसीद छूट जाने या ट्रांजेक्शन आईडी गलत प्रविष्ट करने की समस्याओं का त्वरित ऑनलाइन समाधान।
              </p>
            </div>
            <HelpCircle className="w-12 h-12 text-amber-300 opacity-80 shrink-0 hidden sm:block" />
          </div>

          {/* Core Support Center State Notifications */}
          {helplineSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">सफलतापूर्वक अपडेट!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed mt-1 font-semibold">{helplineSuccess}</p>
              </div>
            </div>
          )}

          {helplineError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">त्रुटि हुई सा!</h4>
                <p className="text-xs text-red-800 leading-relaxed mt-1">{helplineError}</p>
              </div>
            </div>
          )}

          {/* Section 1: Dynamic Tracker */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-black text-amber-950 uppercase tracking-widest block">STEP 1: अपना भुगतान खोजें (Track Your Status)</span>
              <p className="text-[11px] text-gray-400 mt-1">सहयोग दर्ज करते समय प्रविष्ट किया गया मोबाइल नंबर, दाता नाम अथवा UPI ट्रांजेक्शन ID लिखकर खोजें</p>
            </div>

            <form onSubmit={handleSearchHelpline} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="अपना 10 अंकों का मोबाइल नंबर, नाम या UPI Ref लिखें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 bg-gray-50 border border-amber-105 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-gray-400 font-sans"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-705 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm shrink-0 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                🔎 स्थिति खोजें
              </button>
            </form>

            {/* Results Section */}
            {hasSearched && (
              <div className="space-y-4 pt-2 animate-fadeIn">
                <div className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-105">
                  <span className="text-[11px] font-black text-gray-500 font-sans">खोज परिणाम ({searchResults.length} रिकॉर्ड मिले)</span>
                  {searchResults.length > 0 && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-xs"></span>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-3">
                    <p className="text-xs text-gray-450 leading-relaxed font-semibold">
                      "आपके द्वारा लिखे गए विवरण से कोई पुराना रिकॉर्ड नहीं मिल सका सा।"
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowMissingTicketForm(true); setDisputeMobile(searchQuery); }}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-black text-xs rounded-lg transition-all cursor-pointer"
                      >
                        📬 नया गुमशुदा भुगतान शिकायत दर्ज करें (Submit Trouble Ticket)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((rec) => {
                      const cause = causes.find(c => c.id === rec.causeId);
                      const isPending = rec.status === 'लंबित';
                      const isUnderCorrection = selectedCorrectionId === rec.id;

                      return (
                        <div key={rec.id} className="border border-amber-100 rounded-xl bg-amber-50/10 p-4 space-y-3 shadow-xs">
                          {/* Top row */}
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <div className="font-extrabold text-gray-900 text-sm">{rec.donorName}</div>
                              <div className="text-[10px] text-gray-400 font-medium font-sans mt-0.5">परियोजना: {cause ? cause.title : '---'}</div>
                              <div className="text-[10px] text-gray-500 font-mono mt-1">UPI ID: {rec.transactionId}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-sans font-black text-amber-700 text-sm block">{formatCurrency(rec.amount)}</span>
                              <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black mt-1 ${
                                isPending 
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {isPending ? '⚠️ लेखा मिलान जारी (Pending Audit)' : '✓ भुगतान स्वीकृत (Approved)'}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Solver Notice */}
                          <div className="p-3 rounded-lg text-xs leading-relaxed font-medium bg-white border border-gray-100">
                            {isPending ? (
                              <div className="text-gray-755 space-y-1">
                                <span className="text-orange-850 font-bold block">💡 बैंक रिकॉर्ड मिलान लंबित है:</span>
                                <span>
                                  यह भुगतान हमारी ऑडिट टीम द्वारा आपकी 'यूपीआई ट्रांजेक्शन ID' या 'बैंक पासबुक' से मिलान होने का इंतजार कर रहा है। यदि आपने रसीद नहीं भेजी थी या गलत ID लिखी है, तो नीचे दिए बटन से विवरण सुधारें।
                                </span>
                              </div>
                            ) : (
                              <p className="text-emerald-800 font-sans">
                                ⭐ लेखा मिलान पूर्ण! आपका भुगतान प्राप्त होकर सफलतापूर्वक समाज कोष में जमा हो चुका है। सहयोग सूची में आपका नाम अमर है। पुनः कोटि-कोटि धन्यवाद सा!
                              </p>
                            )}
                          </div>

                          {/* Control actions */}
                          <div className="flex gap-2 justify-end">
                            {rec.screenshot && (
                              <button
                                type="button"
                                onClick={() => setZoomedImage(rec.screenshot!)}
                                className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-220 text-gray-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                📷 पुरानी रसीद देखें
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (isUnderCorrection) {
                                  setSelectedCorrectionId(null);
                                } else {
                                  setSelectedCorrectionId(rec.id);
                                  setCorrTxId(rec.transactionId);
                                  setCorrMessage(rec.message || '');
                                  setCorrBonusName(rec.donorName);
                                  setCorrBonusMobile(rec.mobile);
                                  setCorrScreenshot(rec.screenshot || '');
                                }
                              }}
                              className={`px-3.5 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${
                                isUnderCorrection
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                            >
                              {isUnderCorrection ? '✕ बंद करें' : '✏️ विवरण सुधारें / रसीद बदलें'}
                            </button>
                          </div>

                          {/* Correction Form block */}
                          {isUnderCorrection && (
                            <div className="bg-white border-2 border-amber-200/50 p-4 rounded-xl space-y-3 animate-slideDown">
                              <h5 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                                📝 ट्रांजैक्शन एवं विवरण सुधार फॉर्म
                              </h5>
                              <p className="text-[10px] text-gray-400 leading-relaxed">
                                यदि आपने बैंक रसीद गलत अपलोड की थी या ट्रांजेक्शन आईडी गलत लिखी है, तो इसे यहाँ संशोधित करें ताकि ऑडिटर तुरंत खाते से भुगतान का मिलान कर सके।
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1">सहयोगी दाता का नाम</label>
                                  <input
                                    type="text"
                                    value={corrBonusName}
                                    onChange={(e) => setCorrBonusName(e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1">मोबाइल नंबर (Mobile)</label>
                                  <input
                                    type="text"
                                    value={corrBonusMobile}
                                    onChange={(e) => setCorrBonusMobile(e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded font-sans"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1">सही UTR / UPI ट्रांजेक्शन ID *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="जैसे PhonePe UTR या गूगल पे रिफ नंबर"
                                    value={corrTxId}
                                    onChange={(e) => setCorrTxId(e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-amber-300 rounded font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1">लेखाकारों हेतु स्पष्टीकरण (Optional)</label>
                                  <input
                                    type="text"
                                    value={corrMessage}
                                    onChange={(e) => setCorrMessage(e.target.value)}
                                    placeholder="जैसे: भूलवश रसीद छूट गई थी, अब संलग्न कर दी है"
                                    className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded"
                                  />
                                </div>
                              </div>

                              {/* Screenshot Upload within Correction */}
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5 text-left">
                                <label className="block text-[10px] font-bold text-gray-650">
                                  📁 नई भुगतान रसीद अथवा स्क्रीनशॉट अपलोड करें
                                </label>
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1 bg-white border border-gray-300 rounded text-[10px] font-bold cursor-pointer hover:bg-gray-100 shadow-3xs">
                                    <span>फ़ाइल चुनें</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={handleCorrFileChange} 
                                      className="hidden" 
                                    />
                                  </label>
                                  <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                    {corrFileName || "कोई नई फ़ाइल नहीं चुनी"}
                                  </span>
                                </div>
                                {corrScreenshot && (
                                  <div className="mt-1.5">
                                    <img 
                                      src={corrScreenshot} 
                                      alt="corr-preview" 
                                      className="max-h-16 rounded border border-gray-200 object-contain max-w-[100px]" 
                                    />
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={isUpdatingCorrection}
                                onClick={() => handleUpdateCorrection(rec.id)}
                                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-lg shadow-sm transition-all"
                              >
                                {isUpdatingCorrection ? "संशोधन अद्यतन हो रहा है..." : "✓ संशोधन विवरण ऑडिटर को सबमिट करें"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Missing Ticket Form Collapse Handler */}
          <div className="bg-white rounded-2xl border border-amber-150 p-5 shadow-xs space-y-4">
            <button
              type="button"
              onClick={() => setShowMissingTicketForm(!showMissingTicketForm)}
              className="w-full flex items-center justify-between font-black text-sm text-amber-950 uppercase tracking-widest cursor-pointer select-none"
            >
              <span>📬 STEP 2: लापता / अपंजीकृत भुगतान टिकट दर्ज करें</span>
              <span className="text-xl text-amber-605 font-sans">{showMissingTicketForm ? '▲' : '▼'}</span>
            </button>

            {showMissingTicketForm && (
              <form onSubmit={handleAddDisputeTicket} className="space-y-4 pt-2 animate-slideDown">
                <p className="text-[11px] text-gray-500 leading-relaxed font-semibold bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                  यदि आपने सीधे क्यूआर कोड (QR Code) पर पैसे डाल दिए और सहयोग प्रविष्टि फॉर्म नहीं भरा था, तो यह फॉर्म भरकर शिकायत टिकट (Trouble Ticket) भेजें। हमारी एकाउंटिंग टीम मैनुअल बैंक पासबुक मिलान करके आपका दान स्वीकृत प्रविष्टि सूची में घोषित कर देगी।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">सहयोग हेतु परियोजना विषय *</label>
                    <select
                      required
                      value={disputeCauseId}
                      onChange={(e) => setDisputeCauseId(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505"
                    >
                      <option value="">-- परियोजना चुनें --</option>
                      {causes.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">सहयोग राशि (INR रूपये) *</label>
                    <input
                      type="number"
                      required
                      placeholder="जैसे: 5100"
                      value={disputeAmount}
                      onChange={(e) => setDisputeAmount(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">सहयोगी भामाशाह का नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="जैसे: भंवरलाल जणवा"
                      value={disputeName}
                      onChange={(e) => setDisputeName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">गोत्र (Gotra)</label>
                    <input
                      type="text"
                      placeholder="जैसे: मांडोवी"
                      value={disputeGotra}
                      onChange={(e) => setDisputeGotra(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">मूल निवासी गाँव (Village)</label>
                    <input
                      type="text"
                      placeholder="जैसे: कपासन"
                      value={disputeVillage}
                      onChange={(e) => setDisputeVillage(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">मोबाइल नंबर (Mobile) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9414XXXX12"
                      value={disputeMobile}
                      onChange={(e) => setDisputeMobile(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">भुगतान का माध्यम व 12-अंकीय UPI UTR संख्या *</label>
                    <input
                      type="text"
                      required
                      placeholder="PhonePe UTR या Paytm Ref..."
                      value={disputeTxId}
                      onChange={(e) => setDisputeTxId(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">लेखाकारों के लिए स्पष्टीकरण</label>
                    <input
                      type="text"
                      placeholder="जैसे: बैंक से पैसे कट गए हैं, कृपया विवरण सत्यापित करें।"
                      value={disputeMsg}
                      onChange={(e) => setDisputeMsg(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-505"
                    />
                  </div>
                </div>

                {/* Screenshot Upload within Missing Ticket */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-left">
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">
                    📁 भुगतान रसीद / स्क्रीनशॉट संलग्न करें
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-100 shadow-3xs">
                      <span>फ़ाइल चुनें</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleDisputeFileChange} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      {disputeFileName || "कोई फ़ाइल नहीं चुनी"}
                    </span>
                  </div>
                  {disputeScreenshot && (
                    <div className="mt-2">
                      <img 
                        src={disputeScreenshot} 
                        alt="dispute-preview" 
                        className="max-h-20 rounded border border-gray-200 object-contain max-w-[150px]" 
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-amber-800 hover:bg-amber-905 text-white font-black text-xs rounded-xl shadow-md cursor-pointer tracking-wider"
                >
                  {isSubmitting ? "टिकट प्रसारित हो रहा है..." : "📤 मैन्युअल सत्यापन टिकट प्रसारित करें (Submit Trouble Ticket)"}
                </button>
              </form>
            )}
          </div>

          {/* Troubleshooter FAQ */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold text-gray-900 text-sm border-b border-gray-100 pb-2">
              💡 सहायता नियम व सामान्य प्रश्न (Helper Guide)
            </h4>

            <div className="space-y-3 text-xs leading-relaxed text-gray-700 font-medium">
              <div className="p-3 bg-amber-50/20 rounded-lg border border-amber-100/30">
                <p className="font-bold text-amber-900">प्रश्न: मैंने QR कोड स्कैन कर पेमेंट कर दिया, लेकिन मेरा नाम 'सहयोगियों की सूची' में नहीं आया। क्यों?</p>
                <p className="text-gray-600 mt-1">उ: घबराएं नहीं सा! यदि आपने केवल क्यूआर कोड पर राशि भेजी थी पर सहयोग प्रविष्टि 'Pledge' फॉर्म नहीं भरा था, तो हमारा सिस्टम आपके नाम से अपरिचित रहता है। समाधान के लिए ऊपर "STEP 2" का उपयोग कर अपनी रसीद मय विवरण के साथ मैन्युअल टिकट दर्ज कर दें सा।</p>
              </div>

              <div className="p-3 bg-amber-50/20 rounded-lg border border-amber-100/30">
                <p className="font-bold text-amber-900">प्रश्न: मैंने फॉर्म में गलत UPI ट्रांजेक्शन ID या गलत मोबाइल नंबर प्रविष्ट कर दिया था।</p>
                <p className="text-gray-600 mt-1">उ: सुधार के लिए "STEP 1" में अपना गलत नंबर या गलत ID खोजें, मिलान परिणाम आने पर "विवरण सुधारें" बटन दबाकर सही 12-अंकीय UTR नंबर या रसीद फिर से अपलोड कर दें। लेखाकार आपका भुगतान तुरंत खोज लेंगे।</p>
              </div>

              <div className="p-3 bg-amber-50/20 rounded-lg border border-amber-100/30">
                <p className="font-bold text-amber-900">प्रश्न: बैंक खाते से पैसे डेबिट हो गए लेकिन PhonePe/GPay पर असफल शो होकर पेंडिंग है?</p>
                <p className="text-gray-600 mt-1">उ: यह बैंकों के सर्वर टाइमआउट के कारण होता है। घबराएं नहीं, या तो 24 घंटे में आपके बैंक खाते में राशि स्वतः रिफंड हो जाएगी या समाज के खाते में आ जाएगी। आप यहाँ टिकट सबमिट कर दें, हमारी टीम बैंक स्टेटमेंट जांचकर आपको संपर्क करेगी।</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Lightbox Modal for Screenshots */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs transition-all duration-300 animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div 
            className="relative max-w-md w-full bg-white rounded-2xl p-2.5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-100/80 hover:bg-gray-200/90 h-8 w-8 rounded-full cursor-pointer flex items-center justify-center font-bold font-sans text-sm z-10 transition-all active:scale-90"
            >
              ✕
            </button>
            <div className="overflow-auto max-h-[75vh] flex justify-center bg-gray-50 rounded-xl p-1">
              <img 
                src={zoomedImage} 
                alt="Payment Receipt Screenshot" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-3xs"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 text-center text-[11px] font-black text-amber-900 tracking-wide font-sans bg-amber-50/50 mt-2 rounded-xl border border-amber-100/50 flex items-center justify-center gap-1.5">
              <span>🛡️ श्री जणवा समाज मेवाड़ डिजिटल मंच • सहयोग भुगतान रसीद</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
