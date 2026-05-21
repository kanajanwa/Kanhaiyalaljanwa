import React from 'react';
import { Home, Tag, Calendar, HeartHandshake } from 'lucide-react';
import samajLogo from '../assets/images/janwa_samaj_logo_new_1779345129482.png';

interface NavigationProps {
  activeTab: 'dashboard' | 'posts' | 'events' | 'donations';
  setActiveTab: (tab: 'dashboard' | 'posts' | 'events' | 'donations') => void;
  postsCount: number;
  eventsCount: number;
}

export default function Navigation({ activeTab, setActiveTab, postsCount, eventsCount }: NavigationProps) {
  
  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'मुख्य पृष्ठ',
      engLabel: 'Home',
      icon: Home
    },
    {
      id: 'posts' as const,
      label: 'सामाजिक जागरूकता',
      engLabel: 'Social Awareness',
      icon: Tag,
      badge: postsCount
    },
    {
      id: 'events' as const,
      label: 'कार्यक्रम & महासभा',
      engLabel: 'Programs & Events',
      icon: Calendar,
      badge: eventsCount
    },
    {
      id: 'donations' as const,
      label: 'सहयोग राशि (दान)',
      engLabel: 'Cooperation & Fund',
      icon: HeartHandshake
    }
  ];

  return (
    <header className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 text-white shadow-md border-b-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main top bar branding */}
        <div className="py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="bg-gradient-to-br from-amber-100 via-white to-amber-200 p-0.5 rounded-full border-2 border-yellow-300 inline-flex items-center justify-center shadow-xl hover:scale-105 hover:rotate-6 transition-all duration-300 shrink-0 w-20 h-20 md:w-28 md:h-28 select-none overflow-hidden">
              <img 
                src={samajLogo} 
                alt="श्री जणवा समाज मेवाड़ डिजिटल मंच" 
                className="w-full h-full object-contain rounded-full bg-amber-950/20"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-2xl md:text-3xl font-black uppercase tracking-wide bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 bg-clip-text text-transparent filter drop-shadow">
                  श्री जणवा समाज मेवाड़ डिजिटल मंच
                </span>
              </div>
              <p className="text-xs text-yellow-100 italic mt-1 font-medium tracking-wide">
                - सामाजिक विकास, जागरूकता एवं पारदर्शी सहयोग राशि प्रबंधन पोर्टल -
              </p>
            </div>
          </div>
          
          {/* Quick contact / Slogan tag */}
          <div className="hidden lg:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl text-xs border border-white/15">
            <div className="text-right">
              <span className="text-yellow-300 block font-bold text-[10px] uppercase">एकता • प्रगति • शिक्षा</span>
              <span className="text-[11px] text-white">"संगठन ही परम शक्ति है"</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto select-none scrollbar-none border-t border-white/10 pt-1">
          <nav className="flex space-x-1 min-w-full pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 py-3 px-3 md:px-4 text-center rounded-t-xl transition-all relative flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2 border-b-2 font-bold cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-amber-900 border-yellow-400 shadow-xs'
                      : 'text-amber-50 hover:text-white hover:bg-white/10 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-amber-200'}`} />
                  <div className="text-center md:text-left">
                    <span className="text-xs md:text-sm block">{item.label}</span>
                    <span className="text-[9px] font-normal block opacity-80 uppercase tracking-tight hidden sm:block">{item.engLabel}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 md:top-2.5 right-1.5 bg-yellow-400 text-amber-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
}
