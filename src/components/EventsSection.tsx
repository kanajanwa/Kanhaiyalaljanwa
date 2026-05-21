import React, { useState } from 'react';
import { CommunityEvent } from '../types.js';
import { Calendar, Clock, MapPin, Phone, User, Users, Plus, CheckCircle2 } from 'lucide-react';

interface EventsSectionProps {
  events: CommunityEvent[];
  onAddEvent: (event: { title: string; description: string; date: string; time: string; venue: string; organizer: string; contact: string; category: string }) => Promise<void>;
  onRsvpEvent: (id: string, rsvp: { name: string; gotra?: string; contact?: string }) => Promise<void>;
}

export default function EventsSection({ events, onAddEvent, onRsvpEvent }: EventsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState<any>('बैठक');

  // RSVP Form State
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpGotra, setRsvpGotra] = useState('');
  const [rsvpContact, setRsvpContact] = useState('');
  const [rsvpSuccessMsg, setRsvpSuccessMsg] = useState('');

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !venue) {
      alert("कृपया आवश्यक फ़ील्ड (शीर्षक, विवरण, तिथि, स्थान) भरें।");
      return;
    }
    await onAddEvent({ title, description, date, time, venue, organizer, contact, category });
    
    // reset
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setVenue('');
    setOrganizer('');
    setContact('');
    setCategory('बैठक');
    setShowAddForm(false);
  };

  const handleRsvpSubmit = async (e: React.FormEvent, eventId: string) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      alert("कृपया अपना नाम लिखें!");
      return;
    }

    try {
      await onRsvpEvent(eventId, {
        name: rsvpName,
        gotra: rsvpGotra,
        contact: rsvpContact
      });
      setRsvpSuccessMsg("सहमति सफलतापूर्वक दर्ज कर ली गई है! धन्यवाद।");
      setRsvpName('');
      setRsvpGotra('');
      setRsvpContact('');
      setTimeout(() => {
        setRsvpSuccessMsg('');
      }, 5000);
    } catch (err: any) {
      alert(err.message || 'असुविधा के लिए खेद है, कृपया दोबारा प्रयास करें।');
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'बैठक': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'स्नेह-मिलन': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'खेलकूद': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'सम्मान-समारोह': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default: return 'bg-purple-50 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-800">समाज के नवीन प्रोग्राम और महासभाएं</h2>
          <p className="text-sm text-gray-500">जणवा समाज के सभी सामूहिक समारोहों, धार्मिक उत्सवों और महासभा बैठकों का लेखा-जोखा</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'फार्म बंद करें' : 'नया प्रोग्राम जोड़ें'}
        </button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <form onSubmit={handleAddEventSubmit} className="bg-white p-6 rounded-2xl border-2 border-amber-200/60 shadow-sm space-y-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-amber-900 border-b border-amber-100 pb-2">नए कार्यक्रम निमंत्रण की प्रविष्टि करें</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">प्रोग्राम शीर्षक *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="जैसे: जणवा समाज नवोदय स्नेह मिलन"
                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">विशेष श्रेणी</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="बैठक">बैठक / महासभा</option>
                <option value="स्नेह-मिलन">स्नेह-मिलन / भोजनोत्सव</option>
                <option value="खेलकूद">खेलकूद व सांस्कृतिक</option>
                <option value="सम्मान-समारोह">सम्मान-समारोह (Talents)</option>
                <option value="सांस्कृतिक">सांस्कृतिक उत्सव / भजन संध्या</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">कार्यक्रम तिथि *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">निर्धारित समय (Time)</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="जैसे: प्रातः 10:00 बजे से सायं 4:00 तक"
                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">आयोजन स्थल *</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="जैसे: श्री रामदेव देवस्थान प्रांगण, गाँव कपासन"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">आयोजक संस्था / मुख्य संयोजक</label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="जैसे: युवा जागृति समिति"
                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">संयोजक संपर्क सूत्र (Mobile)</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="जैसे: 9876543210"
                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">विवरण व निमंत्रण संदेश *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="कार्यक्रम का क्या उद्देश्य है, कौन मुख्य अतिथि आ रहे हैं, कोई विशेष निर्देश इत्यादि यहाँ दर्ज करें..."
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            कार्यक्रम निमंत्रण प्रकाशित करें
          </button>
        </form>
      )}

      {/* Events Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full text-center bg-white p-12 rounded-2xl border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-gray-700 font-bold block mt-2">कोई कार्यक्रम नियोजित नहीं है</h3>
            <p className="text-xs text-gray-400">समाज का नया प्रोग्राम जोड़ने के लिए ऊपर 'नया प्रोग्राम जोड़ें' बटन का उपयोग करें।</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl border border-amber-100/50 shadow-xs hover:shadow-md hover:border-amber-200 transition-all overflow-hidden flex flex-col justify-between">
              
              {/* Card top banner */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(event.category)}`}>
                    {event.category}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-bold text-amber-600">{event.rsvpList?.length || 0} सहमति</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{event.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{event.description}</p>
                </div>

                {/* Practical Meta items */}
                <div className="space-y-2 bg-amber-50/40 p-3 rounded-lg text-xs text-gray-600 border border-amber-100/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium text-gray-800">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex flex-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-tight font-semibold text-gray-700">{event.venue}</span>
                  </div>
                  {(event.organizer || event.contact) && (
                    <div className="flex items-start gap-2 border-t border-amber-100/40 pt-2 mt-2 font-medium text-gray-500">
                      <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-gray-700">{event.organizer}</div>
                        {event.contact && <div className="text-[10px]">मोबाइल: {event.contact}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance and RSVPs action tray */}
              <div className="bg-gray-50/70 border-t border-gray-100 p-4 space-y-4">
                
                {/* Accordion trigger buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                    className="flex-1 py-1.5 md:py-2 text-center text-xs font-bold ring-1 ring-amber-500 text-amber-700 hover:bg-amber-100/40 rounded-lg transition-all cursor-pointer"
                  >
                    {selectedEventId === event.id ? 'सहमति फॉर्म बंद करें' : 'शामिल होने की सहमति दें'}
                  </button>
                </div>

                {/* Active Interactive RSVP box */}
                {selectedEventId === event.id && (
                  <div className="bg-white p-3.5 rounded-lg border border-amber-100 mt-2 space-y-3 animate-fade-in">
                    
                    {rsvpSuccessMsg ? (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{rsvpSuccessMsg}</span>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleRsvpSubmit(e, event.id)} className="space-y-2.5">
                        <h4 className="text-xs font-bold text-gray-800">हाँ, मैं भी इस प्रोग्राम में शामिल होऊंगा:</h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="अपना नाम *"
                            value={rsvpName}
                            onChange={(e) => setRsvpName(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <input
                            type="text"
                            placeholder="गोत्र (Gotra)"
                            value={rsvpGotra}
                            onChange={(e) => setRsvpGotra(e.target.value)}
                            className="text-xs px-2.5 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="सम्पर्क सूत्र (Mobile)"
                            value={rsvpContact}
                            onChange={(e) => setRsvpContact(e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          
                          <button
                            type="submit"
                            className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition-all cursor-pointer"
                          >
                            पुष्टि करें
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Show live RSVP delegates list */}
                    {event.rsvpList && event.rsvpList.length > 0 && (
                      <div className="border-t border-gray-100 pt-2.5">
                        <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">सहमति देने वाले समाज बंधु ({event.rsvpList.length}):</h5>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {event.rsvpList.map((rsvp, idx) => (
                            <span key={idx} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50/70 border border-amber-100 text-[10px] text-amber-900 rounded font-medium">
                              <User className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              <span>{rsvp.name}</span>
                              {rsvp.gotra && <span className="text-gray-400 text-[9px]">({rsvp.gotra})</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
