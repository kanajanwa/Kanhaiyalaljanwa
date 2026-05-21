import React, { useState } from 'react';
import { PromoterRecord } from '../types';
import { Share2, Trophy, Copy, Check, Users, MessageSquare, Award, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

interface ReferralPanelProps {
  promoters: PromoterRecord[];
  onRefresh: () => void;
}

export default function ReferralPanel({ promoters, onRefresh }: ReferralPanelProps) {
  const [name, setName] = useState('');
  const [gotra, setGotra] = useState('');
  const [village, setVillage] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPromoter, setGeneratedPromoter] = useState<PromoterRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState('');

  // Register Promoter callback
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorPrompt('कृपया प्रचारक का नाम अवश्य दर्ज करें।');
      return;
    }
    setErrorPrompt('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/promoters/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          gotra: gotra.trim(),
          village: village.trim(),
          mobile: mobile.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'पंजीकरण करने में विफलता हुई।');
      }

      const promoter = await response.json();
      setGeneratedPromoter(promoter);
      onRefresh(); // Refresh leaderboard data
    } catch (err: any) {
      setErrorPrompt(err.message || 'पंजीकरण के दौरान कोई अज्ञात त्रुटि आई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construct referral link URL
  const getReferralUrl = (promoter: PromoterRecord) => {
    const origin = window.location.origin;
    return `${origin}?ref=${promoter.id}`;
  };

  // Get WhatsApp Share message
  const getWhatsAppMsg = (promoter: PromoterRecord) => {
    const link = getReferralUrl(promoter);
    const identifierStr = promoter.gotra || promoter.village 
      ? ` (${[promoter.gotra, promoter.village].filter(Boolean).join(', ')})`
      : '';
    
    return `राम राम सा! 🚩 

मैं *श्री ${promoter.name}${identifierStr}* आपको हमारे समाज के नए एकीकृत *'श्री जणवा समाज मेवाड़ डिजिटल मंच'* पर आमंत्रित कर रहा हूँ। 

यहाँ समाज की बैठकों की तिथि, बालिकाओं हेतु नीतियां तथा समाज दान-दाताओं व सहयोग राशि लेखा-प्रणाली की लाइव पारदर्शिता देखी जा सकती है।

कृपया इस लिंक पर क्लिक कर जुड़ें व अपनी सहमति दर्ज करें:
👉 ${link}`;
  };

  // Copy Referral message to Clipboard
  const handleCopy = (promoter: PromoterRecord) => {
    const textToCopy = getWhatsAppMsg(promoter);
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => {
        console.error('Failed to copy refer link:', err);
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="referral-system-section">
      
      {/* LEFT COLUMN: Link Generation Panel */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-amber-200/50 shadow-sm p-5 md:p-6 space-y-5 flex flex-col justify-between">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-yellow-100 text-yellow-800 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-amber-950 text-base">🤝 डिजिटल प्रचारक रिफेरल लिंक जनरेटर</h3>
              <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider mt-0.5">Janwa Samaj Digital Promoter Network</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            समाज के प्रत्येक बंधु को इस मंच से जोड़ने के लिए अपना व्यक्तिगत निमंत्रण लिंक तैयार करें। जब भी कोई व्यक्ति आपके निमंत्रण लिंक से जुड़ेगा, कार्यक्रम में अपनी सहमति देगा, अथवा दान सबमिट करेगा, तो आपकी <span className="text-amber-800 font-bold">डिजिटल प्रचारक साख श्रेणी (Score)</span> में लाइव वृद्धि होगी।
          </p>
        </div>

        {!generatedPromoter ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wide">
                  प्रचारक का नाम (Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कन्हैयालाल जणवा"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-gray-800 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wide">
                  गोत्र (Gotra)
                </label>
                <input
                  type="text"
                  placeholder="उदा. खरोड़ / साजला"
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-gray-800 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wide">
                  गाँव / शहर (Village)
                </label>
                <input
                  type="text"
                  placeholder="उदा. पाली / चित्तौड़गढ़"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-gray-800 bg-gray-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wide">
                  मोबाइल नंबर (Mobile)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="उदा. 99285XXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-gray-800 bg-gray-50/50 text-sans"
                />
              </div>

            </div>

            {errorPrompt && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-1.5">
                <span>⚠️ {errorPrompt}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>लिंक तैयार किया जा रहा है...</>
              ) : (
                <>
                  <span>👉 मेरा व्यक्तिगत आमंत्रण लिंक बनाएं</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* RESULT / SHARING PANEL */
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/40 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-800 font-black tracking-wider uppercase bg-emerald-150 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>✓</span> लिंक सफलतापूर्वक सक्रिय हो गया है
              </span>
              <button
                onClick={() => {
                  setGeneratedPromoter(null);
                  setName('');
                  setGotra('');
                  setVillage('');
                  setMobile('');
                }}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold cursor-pointer underline decoration-dotted"
              >
                नया लिंक बनाएं
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-black block uppercase tracking-wider">आपका व्यक्तिगत रिफेरल लिंक:</span>
              <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-gray-200 shadow-3xs">
                <code className="text-xs text-amber-950 font-bold select-all truncate flex-1 tracking-wide font-sans bg-gray-50 p-1.5 rounded">{getReferralUrl(generatedPromoter)}</code>
                <button
                  onClick={() => handleCopy(generatedPromoter)}
                  className="p-1 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-xs flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "कॉपी हुआ" : "लिंक कॉपी करें"}</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-100/50 space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-amber-800 flex items-center gap-1 border-b border-gray-100 pb-1.5 select-none">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>व्हाट्सएप आमंत्रण संदेश पूर्वावलोकन:</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/50 p-2.5 rounded italic font-semibold line-clamp-4 select-none whitespace-pre-wrap">
                {getWhatsAppMsg(generatedPromoter)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(generatedPromoter)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-3xs"
              >
                {copied ? <Check className="w-4 h-4 text-green-700 animate-pulse" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "कॉपी कर लिया गया है!" : "सन्देश कॉपी करें"}</span>
              </button>
              
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getWhatsAppMsg(generatedPromoter))}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.01]"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp पर सीधे भेजें</span>
              </a>
            </div>

          </div>
        )}

        <div className="text-[9px] text-amber-800/80 leading-relaxed font-semibold p-3.5 bg-amber-50/30 rounded-xl border border-amber-100/40 border-dashed">
          💡 <strong>सुरक्षा सुझाव:</strong> आपका नाम और गांव का विवरण आमंत्रण पत्र को और अधिक विश्वसनीय बनाता है। व्हाट्सएप संदेश में आपका रिफेरल आईडी संलग्न रहता है जो पूर्ण रूप से सुरक्षित है।
        </div>
      </div>

      {/* RIGHT COLUMN: Leaderboard & Dynamic Ranking */}
      <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-2xl border border-amber-200/50 shadow-sm p-5 md:p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-150 text-amber-800 rounded-lg shrink-0">
              <Trophy className="w-5 h-5 text-yellow-600 animate-bounce" />
            </span>
            <div>
              <h3 className="font-extrabold text-amber-950 text-base">🎖️ श्री जणवा समाज मेवाड़ डिजिटल संप्रसारक</h3>
              <p className="text-[9px] text-amber-800 font-bold uppercase tracking-widest leading-none mt-0.5">Top Digital Promoters</p>
            </div>
          </div>
          <span className="text-[8px] uppercase font-black tracking-widest bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full select-none shadow-3xs">
            LIVE साख स्कोर
          </span>
        </div>

        {/* List of Promoters */}
        <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
          {promoters.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-400">
              कोई प्रचारक डेटा उपलब्ध नहीं है। अपना लिंक बनाकर सूची में स्थान पाएं!
            </div>
          ) : (
            promoters.map((prom, index) => {
              const totalScore = (prom.clicks || 0) + (prom.rsvpCount || 0) * 10 + (prom.donationCount || 0) * 50;
              const medals = ['🥇', '🥈', '🥉'];
              const identifierStr = [prom.gotra, prom.village].filter(Boolean).join(', ');

              return (
                <div 
                  key={prom.id} 
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                    index === 0 ? 'bg-amber-50/40 border-yellow-200 shadow-3xs' : 'bg-gray-50/30 border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-sm shrink-0 font-extrabold w-6 text-center select-none">
                      {index < 3 ? medals[index] : `${index + 1}`}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-gray-950 truncate flex items-center gap-1.5">
                        <span>{prom.name}</span>
                        {prom.clicks > 50 && (
                          <span className="inline-block px-1 bg-amber-100 text-amber-800 p-0 text-[8px] rounded font-black uppercase shadow-3xs shrink-0 select-none">सक्रिय प्रचारक</span>
                        )}
                      </div>
                      {identifierStr && (
                        <span className="text-[10px] text-gray-400 truncate block mt-0.5">{identifierStr}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-gray-500 font-bold flex items-center justify-end gap-1 font-sans">
                      <span>क्लिक: <strong className="text-gray-700">{prom.clicks}</strong></span>
                      <span className="text-gray-300">•</span>
                      <span>सहयोग: <strong className="text-amber-800">{prom.donationCount}</strong></span>
                    </div>
                    <div className="text-xs font-black text-amber-900 mt-0.5 tracking-tight font-sans flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{totalScore} <span className="text-[8px] font-bold text-gray-400">साख</span></span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        <div className="bg-gray-50 p-2.5 rounded-lg text-[9px] text-gray-400 leading-normal border border-gray-150">
          * रिफेरल स्कोर गणना: <strong>1 क्लिक</strong> = 1 साख, <strong>1 महासभा सहमति RSVP</strong> = 10 साख, <strong>1 सफल दान सहयोग</strong> = 50 साख। कृपया एकता और सामाजिक प्रगति को प्राथमिकता देवें।
        </div>

      </div>

    </div>
  );
}
