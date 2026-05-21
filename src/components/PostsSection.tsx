import React, { useState } from 'react';
import { CommunityPost } from '../types.js';
import { Heart, Sparkles, User, MapPin, Tag, Plus, Check, AlertCircle } from 'lucide-react';

interface PostsSectionProps {
  posts: CommunityPost[];
  onAddPost: (post: { title: string; content: string; author: string; gotra: string; village: string; category: string }) => Promise<void>;
  onLikePost: (id: string) => Promise<void>;
}

export default function PostsSection({ posts, onAddPost, onLikePost }: PostsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // New State variables
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [gotra, setGotra] = useState('');
  const [village, setVillage] = useState('');
  const [category, setCategory] = useState<string>('सामान्य');

  // AI draft state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Submit hander
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert("कृपया शीर्षक, विवरण और लेखक का नाम भरें।");
      return;
    }
    await onAddPost({ title, content, author, gotra, village, category });
    
    // Clear Form
    setTitle('');
    setContent('');
    setAuthor('');
    setGotra('');
    setVillage('');
    setCategory('सामान्य');
    setShowAddForm(false);
  };

  // Generate draft with Gemini
  const handleAiDraft = async () => {
    if (!aiPrompt.trim()) {
      setAiError("कृपया कोई विषय या प्रॉम्प्ट दर्ज करें (जैसे: 'शिक्षा का महत्व')");
      return;
    }
    setIsAiLoading(true);
    setAiError('');
    setAiSuccessMessage('');

    try {
      const response = await fetch('/api/ai/draft-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, category })
      });

      if (!response.ok) {
        throw new Error('AI से रिस्पांस पाने में समस्या हुई।');
      }

      const data = await response.json();
      if (data.title && data.content) {
        setTitle(data.title);
        setContent(data.content);
        setAiSuccessMessage(data.offline ? "स्मार्ट स्थानीय ड्राफ्ट तैयार है!" : "जेमिनी एआई ने संदेश ड्राफ्ट कर दिया है!");
      } else {
        throw new Error('अमान्य एआई प्रतिक्रिया डेटा।');
      }
    } catch (err: any) {
      setAiError(err.message || "ड्राफ्ट तैयार करने में असमर्थ। कृपया पुनः प्रयास करें।");
    } finally {
      setIsAiLoading(false);
    }
  };

  const categories = [
    { key: 'all', label: 'सभी संदेश' },
    { key: 'शिक्षा', label: 'शिक्षा & करियर' },
    { key: 'स्वास्थ्य', label: 'स्वास्थ्य & शिविर' },
    { key: 'कृषि-व्यापार', label: 'कृषि & व्यापार' },
    { key: 'नशामुक्ति', label: 'व्यसन मुक्ति अभियान' },
    { key: 'सामान्य', label: 'सामान्य चर्चा' }
  ];

  const filteredPosts = categoryFilter === 'all' 
    ? posts 
    : posts.filter(p => p.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-amber-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">सामाजिक जागरूकता गतिविधियां</h2>
          <p className="text-sm text-gray-500">समाज को जागरूक और एकजुट बनाने सम्बन्धी अपने विचार और समाचार साझा करें</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'फार्म बंद करें' : 'नया संदेश लिखें'}
        </button>
      </div>

      {/* Write New Post Section */}
      {showAddForm && (
        <div className="bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 p-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Real Form Inputs */}
            <form onSubmit={handleSubmitPost} className="space-y-4 bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 border-b border-amber-100 pb-2">नया पोस्ट विवरण दर्ज करें</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">लेखक का नाम *</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="जैसे: कन्हैयालाल जणवा"
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">श्रेणी (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="सामान्य">सामान्य चर्चा</option>
                    <option value="शिक्षा">शिक्षा & करियर</option>
                    <option value="स्वास्थ्य">स्वास्थ्य & शिविर</option>
                    <option value="कृषि-व्यापार">कृषि & व्यापार</option>
                    <option value="नशामुक्ति">व्यसन मुक्ति अभियान</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">गोत्र (Gotra)</label>
                  <input
                    type="text"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="जैसे: पचार, खरोड़"
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">मूल गाँव (Village)</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="जैसे: पाली, कपासन"
                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">शीर्षक (Title) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="संदेश का मुख्य शीर्षक दर्ज करें"
                  className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">सविस्तार विवरण (Content Description) *</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="यहाँ सामाजिक जागरूकता, संदेश, या कोई समाचार विस्तार से लिखें..."
                  className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-all shadow-xs cursor-pointer"
              >
                मंच पर पोस्ट प्रकाशित करें (Publish)
              </button>
            </form>

            {/* AI Assistant Drafting Panel */}
            <div className="bg-gradient-to-b from-amber-600/10 to-orange-600/5 p-5 rounded-xl border border-amber-200 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
                  <h4>जेमिनी एआई सृजन सहायक (AI Copilot)</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  चिंता न करें यदि आप सुंदर हिंदी आलेख नहीं लिख पा रहे हैं! बस नीचे एक छोटा संकेत/प्रॉम्प्ट लिखें (जैसे: "बालक-बालिकाओं के लिए करियर गाइडेंस शिविर हेतु आमंत्रण"), फिर AI खुद एक उत्कृष्ट सम्बोधनयुक्त हिंदी लेख तैयार कर देगा।
                </p>

                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">AI के लिए विषय लिखिए:</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    placeholder="उदा: समाज में शिक्षा के प्रति जागरूकता और व्यसनों को पूरी तरह छोड़ने के महत्व पर एक अपील लिखें।"
                    className="w-full text-xs p-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                  />
                </div>

                {aiError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                {aiSuccessMessage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{aiSuccessMessage}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isAiLoading}
                onClick={handleAiDraft}
                className={`w-full mt-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  isAiLoading ? 'opacity-80 cursor-wait' : ''
                }`}
              >
                {isAiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    एआई हिंदी आलेख लिख रहा है...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    एआई से संदेश का सुंदर प्रारूप तैयार कराएं
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-3.5 py-1.5 text-xs whitespace-nowrap font-medium rounded-full cursor-pointer transition-all border ${
              categoryFilter === cat.key
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center space-y-3">
            <Tag className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-gray-700 font-bold text-lg">कोई गतिविधि नहीं मिली</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              इस श्रेणी में अभी तक कोई सामाजिक पोस्ट दर्ज नहीं है। आप पहल करते हुए "नया संदेश लिखें" पर क्लिक कर पहला जागरूकता पोस्ट दर्ज करें!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 rounded-2xl border border-amber-50 shadow-xs hover:shadow-md hover:border-amber-100 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                </div>
                <button
                  onClick={() => onLikePost(post.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-full text-xs font-semibold transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-rose-600/30" />
                  <span>{post.likes}</span>
                </button>
              </div>

              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Author signature footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-3 text-[11px] text-gray-500">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-gray-800">{post.author}</span>
                    {post.gotra && (
                      <span className="text-gray-400">({post.gotra})</span>
                    )}
                  </div>
                  {post.village && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>गाँव: {post.village}</span>
                    </div>
                  )}
                </div>
                <span>दिनांक: {post.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
