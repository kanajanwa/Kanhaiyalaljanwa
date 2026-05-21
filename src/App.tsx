import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PostsSection from './components/PostsSection';
import EventsSection from './components/EventsSection';
import DonationsSection from './components/DonationsSection';
import { CommunityPost, CommunityEvent, DonationCause, DonationRecord } from './types';
import { HeartHandshake, Loader2, IndianRupee, AlertCircle } from 'lucide-react';

export default function App() {
  // Main Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'events' | 'donations'>('dashboard');

  // Database lists state
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [promoters, setPromoters] = useState<any[]>([]);

  // Referral Tracking states
  const [referredByStr, setReferredByStr] = useState<string | null>(null);
  const [referredByPromId, setReferredByPromId] = useState<string | null>(null);

  // Page state
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all db contents
  const fetchDatabase = async () => {
    try {
      const response = await fetch('/api/db');
      if (!response.ok) {
        throw new Error('डाटा प्राप्त करने में असफलता हुई।');
      }
      const data = await response.json();
      setPosts(data.posts || []);
      setEvents(data.events || []);
      setCauses(data.causes || []);
      setDonations(data.donations || []);
      setPromoters(data.promoters || []);
      setErrorMsg('');
    } catch (err: any) {
      console.error("API Fetch database error:", err);
      setErrorMsg(err.message || 'सर्वर से कनेक्ट करने में त्रुटि आई। कृपया रिफ्रेश करें।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();

    // Parse URL query referral parameters
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const gotra = params.get('gotra');
    const village = params.get('village');

    if (ref) {
      if (ref.startsWith('prom_')) {
        setReferredByPromId(ref);
        localStorage.setItem('samaj_promoter_id', ref);

        // Notify server that a dynamic referral click occurred
        fetch('/api/promoters/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: ref })
        })
        .then(() => fetchDatabase()) // reload promoters score live
        .catch(err => console.error("Error logging promoter click:", err));
      } else {
        // Direct custom text refer link (fallback)
        let customRef = ref;
        if (gotra || village) {
          const detail = [gotra, village].filter(Boolean).join(', ');
          customRef += ` (${detail})`;
        }
        setReferredByStr(customRef);
        localStorage.setItem('samaj_referred_by_string', customRef);
      }
    } else {
      // Rehydrate referral details from local storage
      const savedId = localStorage.getItem('samaj_promoter_id');
      const savedStr = localStorage.getItem('samaj_referred_by_string');
      if (savedId) setReferredByPromId(savedId);
      if (savedStr) setReferredByStr(savedStr);
    }
  }, []);

  // Handler: Add a post
  const handleAddPost = async (newPostData: { title: string; content: string; author: string; gotra: string; village: string; category: string }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPostData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'पोस्ट प्रकाशित करने में त्रुटि।');
      }

      await fetchDatabase();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Like a post
  const handleLikePost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('लाइक करने में असमर्थ।');
      }
      
      // Fast optimistic state update
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    } catch (err: any) {
      console.error(err);
    }
  };

  // Handler: Add an Event
  const handleAddEvent = async (newEventData: { title: string; description: string; date: string; time: string; venue: string; organizer: string; contact: string; category: string }) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEventData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'कार्यक्रम प्रकाशित करने में त्रुटि।');
      }

      await fetchDatabase();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: RSVP an Event
  const handleRsvpEvent = async (id: string, rsvpData: { name: string; gotra?: string; contact?: string }) => {
    const payload = { ...rsvpData, promoterId: referredByPromId || '' };
    const response = await fetch(`/api/events/${id}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'सहमति दर्ज करने में त्रुटि हुई।');
    }

    await fetchDatabase();
  };

  // Handler: Add a Donation/Cooperation record
  const handleAddDonation = async (newDonationData: { causeId: string; donorName: string; gotra: string; village: string; amount: number; mobile: string; transactionId: string; message: string; instantApprove?: boolean; screenshot?: string }) => {
    const payload = { ...newDonationData, promoterId: referredByPromId || '' };
    const response = await fetch('/api/donations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'सहयोग प्रविष्टि सहेजने में त्रुटि आई।');
    }

    await fetchDatabase();
  };

  // Handler: Admin verify a Donation
  const handleVerifyDonation = async (id: string) => {
    const response = await fetch(`/api/donations/${id}/verify`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'सत्यापित करने में असमर्थ।');
    }

    await fetchDatabase();
  };

  const activeReferrer = referredByPromId 
    ? promoters.find(p => p.id === referredByPromId)?.name 
    : referredByStr;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
      
      {/* Top Navigation Panel */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        postsCount={posts.length}
        eventsCount={events.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:py-8 space-y-6">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
            <p className="text-sm font-bold text-gray-500">श्री जणवा समाज मेवाड़ डिजिटल मंच लोड हो रहा है...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl space-y-3 max-w-lg mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="font-extrabold text-red-900 text-base">सर्वर लोडिंग त्रुटि</h3>
            <p className="text-xs text-red-700">{errorMsg}</p>
            <button
              onClick={() => { setIsLoading(true); fetchDatabase(); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs cursor-pointer"
            >
              दोबारा प्रयास करें
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Welcome Invitation Notification Alert */}
            {activeReferrer && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-xl flex items-center justify-between gap-4 animate-fade-in shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">🤝</span>
                  <div>
                    <p className="text-xs font-black text-amber-950">राम राम सा! आप विशेष रूप से आमंत्रित हैं</p>
                    <p className="text-xs text-amber-900 mt-0.5">
                      आपको आपके आदरणीय <strong>श्री {activeReferrer}</strong> जी के निमंत्रण संदेश द्वारा इस मंच पर प्रेषित किया गया है।
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setReferredByPromId(null);
                    setReferredByStr(null);
                    localStorage.removeItem('samaj_promoter_id');
                    localStorage.removeItem('samaj_referred_by_string');
                  }}
                  className="text-[10px] text-gray-400 hover:text-gray-600 font-extrabold cursor-pointer border border-gray-200 hover:bg-white rounded-md px-2 py-1 transition-all shrink-0"
                >
                  आमंत्रण बंद करें ✕
                </button>
              </div>
            )}

            <div className="transition-all duration-300">
              {activeTab === 'dashboard' && (
                <Dashboard
                  posts={posts}
                  events={events}
                  causes={causes}
                  donations={donations}
                  setActiveTab={setActiveTab}
                  promoters={promoters}
                  onRefreshPromoters={fetchDatabase}
                />
              )}

            {activeTab === 'posts' && (
              <PostsSection
                posts={posts}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
              />
            )}

            {activeTab === 'events' && (
              <EventsSection
                events={events}
                onAddEvent={handleAddEvent}
                onRsvpEvent={handleRsvpEvent}
              />
            )}

            {activeTab === 'donations' && (
              <DonationsSection
                causes={causes}
                donations={donations}
                onAddDonation={handleAddDonation}
                onVerifyDonation={handleVerifyDonation}
                onRefreshDatabase={fetchDatabase}
              />
            )}
          </div>
          </div>
        )}

      </main>

      {/* cultural design footer */}
      <footer className="bg-amber-950 text-amber-100 border-t border-yellow-500/40 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <div className="flex justify-center items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-yellow-300 animate-pulse" />
            <span className="font-bold text-base text-yellow-300 tracking-wide">श्री जणवा समाज मेवाड़ नवोदय विकास समिति</span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed max-w-2xl mx-auto">
            "संगठन ही प्रगति का आधार है। हम सब मिलकर समाज को स्वच्छ, शिक्षित व नशामुक्त मार्ग की ओर अग्रसर करें।"
          </p>
          <div className="border-t border-white/5 pt-3 mt-3 text-[10px] text-amber-200/50">
            &copy; {new Date().getFullYear()} अखिल भारतीय जणवा समाज मेवाड़ विकास महासभा. सर्वाधिकार सुरक्षित।
          </div>
        </div>
      </footer>

    </div>
  );
}
