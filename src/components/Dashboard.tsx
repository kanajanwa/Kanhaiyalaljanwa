import React from 'react';
import { CommunityPost, CommunityEvent, DonationCause, DonationRecord } from '../types.js';
import { Award, BookOpen, Star, Calendar, Landmark, Users, TrendingUp, HeartHandshake, Eye } from 'lucide-react';
import samajLogo from '../assets/images/janwa_samaj_logo_new_1779345129482.png';
import ReferralPanel from './ReferralPanel.js';

interface DashboardProps {
  posts: CommunityPost[];
  events: CommunityEvent[];
  causes: DonationCause[];
  donations: DonationRecord[];
  setActiveTab: (tab: 'dashboard' | 'posts' | 'events' | 'donations') => void;
  promoters?: any[];
  onRefreshPromoters?: () => void;
}

export default function Dashboard({ 
  posts, 
  events, 
  causes, 
  donations, 
  setActiveTab,
  promoters = [],
  onRefreshPromoters = () => {}
}: DashboardProps) {
  
  // Dynamic Calculations (Only count APPROVED/VERIFIED donations)
  const approvedDonations = donations.filter(d => d.status === 'स्वीकृत');
  const totalRaisedSum = approvedDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalContributorsCount = approvedDonations.length;

  const latestPost = posts[0];
  const nextEvent = events[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic News Updates Marquee Ticker */}
      <div className="bg-yellow-50 border-y border-yellow-200/60 py-2.5 px-4 overflow-hidden rounded-xl">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="bg-red-600 text-white font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded shrink-0 animate-pulse select-none">
            ताज़ा सूचना
          </span>
          <p className="text-xs text-amber-900 font-bold tracking-wide truncate">
            🔥 आगामी जणवा समाज मेवाड़ महासभा व स्नेह मिलन बैठक 10 जून 2026 को पाली धर्मशाला परिसर में आयोजित होगी। अपनी सहमति 'कार्यक्रम & महासभा' अनुभाग में दें।
          </p>
        </div>
      </div>

      {/* Main Grid Banner / Visual Focus */}
      <div className="relative rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 overflow-hidden text-white shadow-lg border border-amber-600/30">
        
        {/* Abstract cultural line background styling */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left max-w-xl flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-300 p-1.5 rounded-2xl border-2 border-yellow-400 shrink-0 w-24 h-24 md:w-36 md:h-36 shadow-xl select-none hidden sm:block">
              <img 
                src={samajLogo} 
                alt="श्री जणवा समाज मेवाड़ डिजिटल मंच" 
                className="w-full h-full object-contain rounded-xl bg-amber-950/10"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-3.5 flex-1">
              <h1 className="text-2xl sm:text-3xl font-black leading-tight text-yellow-300 filter drop-shadow-sm">
                श्री जणवा समाज मेवाड़ डिजिटल मंच
              </h1>
              <p className="text-xs sm:text-sm text-yellow-100/95 leading-relaxed font-semibold">
                यह हमारे श्री जणवा समाज मेवाड़ का अपना अधिकृत डिजिटल मंच है। यहाँ समाज के समग्र उत्थान के लिए विभिन्न रचनात्मक सामाजिक गतिविधियों की जानकारी दी जाती है, समाज को कुरुतियों से बचाने हेतु जागरूकता अभियान प्रसारित किये जाते हैं तथा पूर्ण पारदर्शिता के साथ सहयोग राशि का हिसाब रखा जाता है।
              </p>
              <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-2">
                <button
                  onClick={() => setActiveTab('posts')}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-extrabold text-xs rounded-lg transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  जागरूकता गतिविधियों से जुड़ें
                </button>
                <button
                  onClick={() => setActiveTab('donations')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-lg border border-white/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  सहयोग राशि देवें / लेखा देखें
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats side card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 w-full md:w-80 space-y-4">
            <h3 className="text-xs font-bold text-yellow-300 uppercase tracking-widest text-center border-b border-white/10 pb-2">
              समाज सहयोग कोष रिपोर्ट
            </h3>
            
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-[10px] text-yellow-100 block uppercase font-bold">सत्यापित सहयोग कोष राशि:</span>
                <span className="text-2xl font-black text-white">{formatCurrency(totalRaisedSum)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <div className="text-center border-r border-white/10">
                  <span className="text-[9px] text-yellow-100 block uppercase">भामाशाह संख्या</span>
                  <span className="text-base font-bold text-white">{totalContributorsCount}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-yellow-100 block uppercase">सक्रिय प्रोजेक्ट</span>
                  <span className="text-base font-bold text-white">{causes.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid counters summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex flex-row items-center gap-3">
          <div className="bg-amber-100/60 p-2 text-amber-700 rounded-lg shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">कुल पारदर्शी सहयोग</span>
            <span className="font-bold text-sm text-gray-800">{formatCurrency(totalRaisedSum)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex flex-row items-center gap-3">
          <div className="bg-blue-100/60 p-2 text-blue-700 rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">सक्रिय समाज भामाशाह</span>
            <span className="font-bold text-sm text-gray-800">{totalContributorsCount} सदस्य</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex flex-row items-center gap-3">
          <div className="bg-emerald-100/60 p-2 text-emerald-700 rounded-lg shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">जागरूकता संदेश</span>
            <span className="font-bold text-sm text-gray-800">{posts.length} पोस्ट्स</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex flex-row items-center gap-3">
          <div className="bg-purple-100/60 p-2 text-purple-700 rounded-lg shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">संयोजित प्रोग्राम</span>
            <span className="font-bold text-sm text-gray-800">{events.length} कार्यक्रम</span>
          </div>
        </div>

      </div>

      {/* समाज के पावन स्थल एवं केंद्रीय परिसर (Main Highlights) */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 p-6 rounded-2xl border border-amber-200/60 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-amber-200/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚩</span>
            <div>
              <h2 className="text-lg font-black text-amber-950 font-sans tracking-tight">श्री जणवा समाज मेवाड़ - आस्था एवं संस्कृति के पावन केंद्र</h2>
              <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest mt-0.5">Community Heritage & Central Landmarks</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200 text-xs text-amber-900 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            मुख्य परिसर (Main Campus)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: आसावरा माता धर्मशाला परिसर */}
          <div className="bg-white p-4.5 rounded-xl border border-amber-100 shadow-3xs hover:border-amber-300 hover:shadow-xs transition-all duration-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌸</span>
              <h3 className="font-extrabold text-amber-950 text-sm">आसावरा माता धर्मशाला परिसर</h3>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed font-semibold">
              यह समाजजनों हेतु सुसज्जित, विशाल और सर्वसुविधायुक्त धर्मशाला परिसर है। यहाँ विवाह समारोहों, सामाजिक बैठकों और विभिन्न उत्सवों के लिए उत्तम व्यवस्थाएं उपलब्ध हैं।
            </p>
          </div>

          {/* Card 2: चारभुजा मन्दिर */}
          <div className="bg-white p-4.5 rounded-xl border border-amber-100 shadow-3xs hover:border-amber-300 hover:shadow-xs transition-all duration-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔱</span>
              <h3 className="font-extrabold text-amber-950 text-sm">प्रभु श्री चारभुजा मन्दिर</h3>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed font-semibold">
              परम श्रद्धेय श्री चारभुजा नाथ जी का भव्य एवं अलौकिक मंदिर जहाँ नित्य पूजा-अर्चना और मंगल आरती से संपूर्ण परिसर दिव्यता और सकारात्मक ऊर्जा से सराबोर रहता है।
            </p>
          </div>

          {/* Card 3: हिंगलाज माता मन्दिर */}
          <div className="bg-white p-4.5 rounded-xl border border-amber-100 shadow-3xs hover:border-amber-300 hover:shadow-xs transition-all duration-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <h3 className="font-extrabold text-amber-950 text-sm">माँ हिंगलाज देवी मन्दिर</h3>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed font-semibold">
              आदिशक्ति माँ हिंगलाज का पावन मंदिर जो समाज के गौरवमय इतिहास, अखंड श्रद्धा और भक्ति भाव का मुख्य आध्यात्मिक केंद्र बिंदु है।
            </p>
          </div>
        </div>

        <div className="bg-amber-100/40 p-3 rounded-xl border border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-bold">
            <span className="text-base text-red-600">📍</span>
            <span>स्थान (Venue Address): <span className="text-amber-800 font-extrabold">देसूरी रोड, बाली पाली (राजस्थान)</span></span>
          </div>
          <span className="text-[10px] text-amber-700/80 font-bold">श्री जणवा समाज मेवाड़</span>
        </div>
      </div>

      {/* Dynamic Digital Promoter Network & Referral Panel */}
      <ReferralPanel 
        promoters={promoters} 
        onRefresh={onRefreshPromoters} 
      />

      {/* Two Column details: Latest Post, upcoming event, portals guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - Guide instructions */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-gradient-to-b from-gray-50 to-white p-5 rounded-2xl border border-amber-100/60 space-y-4">
            <h3 className="font-extrabold text-gray-800 text-sm border-b border-amber-100 pb-2">पोर्टल उपयोग मार्गदर्शन (How it works)</h3>
            
            <div className="space-y-3.5 text-xs text-gray-600">
              <div className="flex gap-2.5">
                <div className="bg-amber-100 font-black text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-gray-800">सामाजिक जागरूकता</h4>
                  <p className="mt-0.5 leading-relaxed">शिक्षा, स्वास्थ्य या नशामुक्ति से रिलेटेड समाज संदेश लिख सकते हैं या हमारे जेमिनी एआई कॉपायलट से तैयार करवा सकते हैं।</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="bg-amber-100 font-black text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-gray-800">प्रोग्राम व महासभा पंजीकरण</h4>
                  <p className="mt-0.5 leading-relaxed">समाज के आगामी स्नेह मिलन या सम्मेलनों का पूरा ब्यौरा देखकर अपनी भोजन व उपस्थिति की सहमति पत्र लाइव सबमिट करें।</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="bg-amber-100 font-black text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-bold text-gray-800">सहयोग राशि विवरण</h4>
                  <p className="mt-0.5 leading-relaxed">छात्रावास या शिक्षा कोष की लक्ष्य प्रगति देखकर अपनी स्वेच्छा से भेजी गई दान राशि को सबमिट कर पारदर्शी सहयोग रसीद व गौरव सूची में नाम देखें।</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right - Previews of Latest Activity & Events */}
        <div className="space-y-5 lg:col-span-2">
          
          {/* Latest awareness article card */}
          {latestPost && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span className="text-amber-700 font-extrabold">ताज़ा सामाजिक जागृति पोस्ट</span>
                  <span>{latestPost.date}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-base">{latestPost.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{latestPost.content}</p>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-gray-50 pt-3 text-[11px] text-gray-500">
                <span>दुआरा: <strong>{latestPost.author}</strong> {latestPost.gotra && `(${latestPost.gotra})`}</span>
                
                <button
                  onClick={() => setActiveTab('posts')}
                  className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                >
                  सभी संदेश पढ़ें
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Closest Upcoming Event summary */}
          {nextEvent && (
            <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span className="text-amber-700 font-extrabold">आगामी विशेष कार्यक्रम (Scheduled Event)</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">{nextEvent.category}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-base">{nextEvent.title}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <strong>दिनांक:</strong> {nextEvent.date}
                </div>
                <div>
                  <strong>समय:</strong> {nextEvent.time}
                </div>
                <div className="md:col-span-2">
                  <strong>आयोजन स्थल:</strong> {nextEvent.venue}
                </div>
                {nextEvent.organizer && (
                  <div className="md:col-span-2 text-amber-900 font-semibold">
                    संयोजक: {nextEvent.organizer}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-700 font-semibold">{nextEvent.rsvpList?.length} समाज जनों ने शामिल होने की सहमति दी है</span>
                <button
                  onClick={() => setActiveTab('events')}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all text-[11px] cursor-pointer"
                >
                  सहमति/RSVP दर्ज कराएं
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
