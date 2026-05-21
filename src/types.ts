export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  gotra?: string;
  village?: string;
  date: string;
  category: 'शिक्षा' | 'स्वास्थ्य' | 'कृषि-व्यापार' | 'नशामुक्ति' | 'सामान्य';
  likes: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  contact: string;
  category: 'बैठक' | 'स्नेह-मिलन' | 'खेलकूद' | 'सम्मान-समारोह' | 'सांस्कृतिक';
  rsvpList: Array<{ name: string; gotra?: string; contact?: string }>;
}

export interface DonationCause {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  active: boolean;
  category: 'भवन-निर्माण' | 'शिक्षा-मदद' | 'चिकित्सा-मदद' | 'सामान्य-कोष' | 'धार्मिक-योगदान' | 'रक्तदान-मदद';
}

export interface DonationRecord {
  id: string;
  causeId: string;
  donorName: string;
  gotra?: string;
  village?: string;
  amount: number;
  date: string;
  mobile?: string;
  transactionId?: string;
  message?: string;
  status: 'स्वीकृत' | 'लंबित';
  screenshot?: string;
  promoterId?: string;
}

export interface DbSchema {
  posts: CommunityPost[];
  events: CommunityEvent[];
  causes: DonationCause[];
  donations: DonationRecord[];
  promoters?: PromoterRecord[];
}

export interface PromoterRecord {
  id: string;
  name: string;
  gotra?: string;
  village?: string;
  mobile?: string;
  clicks: number;
  rsvpCount: number;
  donationCount: number;
  totalDonationAmount: number;
  dateCreated: string;
}

