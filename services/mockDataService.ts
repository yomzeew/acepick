// Mock Data Service for Acepick App - Complete Offline Testing
// This provides realistic mock data for all API endpoints when server is down

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'client' | 'professional' | 'delivery';
  phone: string;
  avatar?: string;
  profile: {
    id: number;
    avatar: string;
    birthDate: string | null;
    bvn: string | null;
    bvnVerified: boolean | null;
    count: number;
    createdAt: string;
    fcmToken: string;
    firstName: string;
    lastName: string;
    notified: boolean;
    position: string | null;
    rate: number;
    store: boolean;
    switch: boolean;
    totalDisputes: number;
    totalExpense: number;
    totalJobs: number;
    totalJobsApproved: number;
    totalJobsCanceled: number;
    totalJobsCompleted: number;
    totalJobsDeclined: number;
    totalJobsOngoing: number;
    totalJobsPending: number;
    totalReview: number;
    updatedAt: string;
    userId: string;
    verified: boolean;
    location: string;
    bio?: string;
    skills?: string[];
    rating: number;
  };
  location: {
    id: number;
    address: string;
    createdAt: string;
    latitude: number;
    lga: string;
    longitude: number;
    state: string;
    updatedAt: string;
    userId: string;
    zipcode: string | null;
  };
  wallet: {
    id: string;
    createdAt: string;
    currency: string;
    currentBalance: number;
    pin: string | null;
    previousBalance: number;
    status: string;
    updatedAt: string;
    userId: string;
  };
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockJob {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  client: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
  };
  professional?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    profession: string;
  };
  budget: number;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

export interface MockDelivery {
  id: string;
  orderNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  client: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
  };
  deliveryPartner?: {
    id: string;
    fullName: string;
    phone: string;
    vehicle: string;
  };
  package: {
    description: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  pickupLocation: string;
  deliveryLocation: string;
  estimatedDelivery: string;
  price: number;
  createdAt: string;
}

export interface MockReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  serviceType: string;
  date: string;
  helpful: number;
}

export interface MockChat {
  id: string;
  participants: {
    id: string;
    fullName: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
  }[];
  messages: {
    id: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file';
    timestamp: string;
    isRead: boolean;
  }[];
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Mock Data Collections
export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'client@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    role: 'client',
    phone: '+1234567890',
    avatar: 'https://picsum.photos/seed/user1/200/200',
    profile: {
      id: 1,
      avatar: 'https://picsum.photos/seed/user1/200/200',
      birthDate: null,
      bvn: null,
      bvnVerified: null,
      count: 0,
      createdAt: '2024-01-15T10:00:00Z',
      fcmToken: 'mock_fcm_token_1',
      firstName: 'John',
      lastName: 'Doe',
      notified: true,
      position: null,
      rate: 4.5,
      store: false,
      switch: false,
      totalDisputes: 0,
      totalExpense: 0,
      totalJobs: 12,
      totalJobsApproved: 10,
      totalJobsCanceled: 1,
      totalJobsCompleted: 8,
      totalJobsDeclined: 1,
      totalJobsOngoing: 2,
      totalJobsPending: 1,
      totalReview: 12,
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '1',
      verified: true,
      location: 'Lagos, Nigeria',
      bio: 'Looking for reliable professionals for home repairs',
      skills: [],
      rating: 4.5,
    },
    location: {
      id: 1,
      address: '123 Main Street, Lagos, Nigeria',
      createdAt: '2024-01-15T10:00:00Z',
      latitude: 6.5244,
      lga: 'Lagos Mainland',
      longitude: 3.3792,
      state: 'Lagos',
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '1',
      zipcode: null,
    },
    wallet: {
      id: 'wallet_1',
      createdAt: '2024-01-15T10:00:00Z',
      currency: 'NGN',
      currentBalance: 50000,
      pin: null,
      previousBalance: 45000,
      status: 'active',
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '1',
    },
    fcmToken: 'mock_fcm_token_1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    email: 'pro@example.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    fullName: 'Mike Wilson',
    role: 'professional',
    phone: '+1234567891',
    avatar: 'https://picsum.photos/seed/user2/200/200',
    profile: {
      id: 2,
      avatar: 'https://picsum.photos/seed/user2/200/200',
      birthDate: null,
      bvn: null,
      bvnVerified: null,
      count: 0,
      createdAt: '2024-01-10T10:00:00Z',
      fcmToken: 'mock_fcm_token_2',
      firstName: 'Mike',
      lastName: 'Wilson',
      notified: true,
      position: 'Electrician',
      rate: 4.8,
      store: false,
      switch: false,
      totalDisputes: 1,
      totalExpense: 0,
      totalJobs: 28,
      totalJobsApproved: 25,
      totalJobsCanceled: 1,
      totalJobsCompleted: 20,
      totalJobsDeclined: 2,
      totalJobsOngoing: 3,
      totalJobsPending: 2,
      totalReview: 28,
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '2',
      verified: true,
      location: 'Abuja, Nigeria',
      bio: 'Experienced electrician with 10+ years of experience',
      skills: ['Electrical', 'Wiring', 'Installation', 'Repair'],
      rating: 4.8,
    },
    location: {
      id: 2,
      address: '456 Oak Avenue, Abuja, Nigeria',
      createdAt: '2024-01-10T10:00:00Z',
      latitude: 9.0765,
      lga: 'Abuja Municipal',
      longitude: 7.3986,
      state: 'Abuja',
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '2',
      zipcode: null,
    },
    wallet: {
      id: 'wallet_2',
      createdAt: '2024-01-10T10:00:00Z',
      currency: 'NGN',
      currentBalance: 150000,
      pin: null,
      previousBalance: 125000,
      status: 'active',
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '2',
    },
    fcmToken: 'mock_fcm_token_2',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '3',
    email: 'delivery@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    role: 'delivery',
    phone: '+1234567892',
    avatar: 'https://picsum.photos/seed/user3/200/200',
    profile: {
      id: 3,
      avatar: 'https://picsum.photos/seed/user3/200/200',
      birthDate: null,
      bvn: null,
      bvnVerified: null,
      count: 0,
      createdAt: '2024-01-05T10:00:00Z',
      fcmToken: 'mock_fcm_token_3',
      firstName: 'Sarah',
      lastName: 'Johnson',
      notified: true,
      position: 'Delivery Partner',
      rate: 4.9,
      store: false,
      switch: false,
      totalDisputes: 0,
      totalExpense: 0,
      totalJobs: 45,
      totalJobsApproved: 43,
      totalJobsCanceled: 0,
      totalJobsCompleted: 40,
      totalJobsDeclined: 2,
      totalJobsOngoing: 3,
      totalJobsPending: 2,
      totalReview: 45,
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '3',
      verified: true,
      location: 'Port Harcourt, Nigeria',
      bio: 'Reliable delivery partner with own vehicle',
      skills: ['Delivery', 'Logistics', 'Customer Service'],
      rating: 4.9,
    },
    location: {
      id: 3,
      address: '789 Pine Road, Port Harcourt, Nigeria',
      createdAt: '2024-01-05T10:00:00Z',
      latitude: 4.8156,
      lga: 'Port Harcourt Municipal',
      longitude: 7.0498,
      state: 'Rivers',
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '3',
      zipcode: null,
    },
    wallet: {
      id: 'wallet_3',
      createdAt: '2024-01-05T10:00:00Z',
      currency: 'NGN',
      currentBalance: 80000,
      pin: null,
      previousBalance: 65000,
      status: 'active',
      updatedAt: '2024-03-15T10:00:00Z',
      userId: '3',
    },
    fcmToken: 'mock_fcm_token_3',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
];

export const mockJobs: MockJob[] = [
  {
    id: '1',
    title: 'Electrical Wiring Installation',
    description: 'Need professional electrician to install wiring in new 3-bedroom apartment',
    category: 'Electrical',
    status: 'pending',
    client: {
      id: '1',
      fullName: 'John Doe',
      avatar: 'https://picsum.photos/seed/user1/200/200',
      rating: 4.5,
    },
    budget: 50000,
    location: 'Lagos, Nigeria',
    coordinates: { latitude: 6.5244, longitude: 3.3792 },
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
    images: ['https://picsum.photos/seed/job1/400/300'],
  },
  {
    id: '2',
    title: 'Plumbing Repair',
    description: 'Fix leaking pipe in bathroom and install new fixtures',
    category: 'Plumbing',
    status: 'in_progress',
    client: {
      id: '1',
      fullName: 'John Doe',
      avatar: 'https://picsum.photos/seed/user1/200/200',
      rating: 4.5,
    },
    professional: {
      id: '2',
      fullName: 'Mike Wilson',
      avatar: 'https://picsum.photos/seed/user2/200/200',
      rating: 4.8,
      profession: 'Electrician',
    },
    budget: 35000,
    location: 'Lagos, Nigeria',
    coordinates: { latitude: 6.5244, longitude: 3.3792 },
    createdAt: '2024-03-14T10:00:00Z',
    updatedAt: '2024-03-15T09:00:00Z',
    images: ['https://picsum.photos/seed/job2/400/300'],
  },
  {
    id: '3',
    title: 'Furniture Assembly',
    description: 'Assemble new bedroom furniture set',
    category: 'Carpentry',
    status: 'completed',
    client: {
      id: '1',
      fullName: 'John Doe',
      avatar: 'https://picsum.photos/seed/user1/200/200',
      rating: 4.5,
    },
    professional: {
      id: '4',
      fullName: 'David Chen',
      avatar: 'https://picsum.photos/seed/user4/200/200',
      rating: 4.7,
      profession: 'Carpenter',
    },
    budget: 25000,
    location: 'Lagos, Nigeria',
    coordinates: { latitude: 6.5244, longitude: 3.3792 },
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2024-03-12T16:00:00Z',
    images: ['https://picsum.photos/seed/job3/400/300'],
  },
];

export const mockDeliveries: MockDelivery[] = [
  {
    id: '1',
    orderNumber: 'DEL-001',
    status: 'pending',
    client: {
      id: '1',
      fullName: 'John Doe',
      phone: '+1234567890',
      address: '123 Main Street, Lagos, Nigeria',
    },
    package: {
      description: 'Electronics Package',
      weight: 2.5,
      dimensions: { length: 30, width: 20, height: 15 },
    },
    pickupLocation: 'Victoria Island, Lagos',
    deliveryLocation: 'Ikoyi, Lagos',
    estimatedDelivery: '2024-03-15T18:00:00Z',
    price: 2500,
    createdAt: '2024-03-15T12:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'DEL-002',
    status: 'in_transit',
    client: {
      id: '5',
      fullName: 'Emma Davis',
      phone: '+1234567893',
      address: '456 Oak Avenue, Abuja, Nigeria',
    },
    deliveryPartner: {
      id: '3',
      fullName: 'Sarah Johnson',
      phone: '+1234567892',
      vehicle: 'Motorcycle',
    },
    package: {
      description: 'Food Delivery',
      weight: 1.2,
      dimensions: { length: 25, width: 25, height: 10 },
    },
    pickupLocation: 'Central Market, Abuja',
    deliveryLocation: 'Gwarimpa, Abuja',
    estimatedDelivery: '2024-03-15T17:30:00Z',
    price: 1500,
    createdAt: '2024-03-15T13:30:00Z',
  },
  {
    id: '3',
    orderNumber: 'DEL-003',
    status: 'delivered',
    client: {
      id: '6',
      fullName: 'Robert Brown',
      phone: '+1234567894',
      address: '789 Pine Road, Port Harcourt, Nigeria',
    },
    deliveryPartner: {
      id: '3',
      fullName: 'Sarah Johnson',
      phone: '+1234567892',
      vehicle: 'Motorcycle',
    },
    package: {
      description: 'Document Package',
      weight: 0.5,
      dimensions: { length: 30, width: 20, height: 5 },
    },
    pickupLocation: 'Rivers State Secretariat',
    deliveryLocation: 'GRA Phase 2, Port Harcourt',
    estimatedDelivery: '2024-03-15T15:00:00Z',
    price: 1000,
    createdAt: '2024-03-15T11:00:00Z',
  },
];

export const mockReviews: MockReview[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Excellent service! Very professional and knowledgeable. Fixed my electrical issues quickly and efficiently.',
    serviceType: 'Electrical',
    date: '2024-02-20',
    helpful: 12,
  },
  {
    id: '2',
    userId: '5',
    userName: 'Emma Davis',
    rating: 4,
    comment: 'Good work overall. Arrived on time and completed the job as expected. Would recommend.',
    serviceType: 'Plumbing',
    date: '2024-02-18',
    helpful: 8,
  },
  {
    id: '3',
    userId: '6',
    userName: 'Robert Brown',
    rating: 5,
    comment: 'Outstanding craftsmanship! Attention to detail is impressive. Very satisfied with the results.',
    serviceType: 'Carpentry',
    date: '2024-02-15',
    helpful: 15,
  },
  {
    id: '4',
    userId: '7',
    userName: 'Lisa Anderson',
    rating: 4,
    comment: 'Very reliable delivery partner. Package arrived on time and in perfect condition.',
    serviceType: 'Delivery',
    date: '2024-02-12',
    helpful: 6,
  },
];

export const mockChats: MockChat[] = [
  {
    id: '1',
    participants: [
      {
        id: '1',
        fullName: 'John Doe',
        avatar: 'https://picsum.photos/seed/user1/200/200',
        isOnline: true,
      },
      {
        id: '2',
        fullName: 'Mike Wilson',
        avatar: 'https://picsum.photos/seed/user2/200/200',
        isOnline: false,
        lastSeen: '2024-03-15T14:30:00Z',
      },
    ],
    messages: [
      {
        id: '1',
        senderId: '1',
        content: 'Hi, I need help with electrical wiring',
        type: 'text',
        timestamp: '2024-03-15T09:00:00Z',
        isRead: true,
      },
      {
        id: '2',
        senderId: '2',
        content: 'Hello! I can help you with that. What specific electrical work do you need?',
        type: 'text',
        timestamp: '2024-03-15T09:05:00Z',
        isRead: true,
      },
      {
        id: '3',
        senderId: '1',
        content: 'I need to install wiring in my new apartment',
        type: 'text',
        timestamp: '2024-03-15T09:10:00Z',
        isRead: true,
      },
    ],
    lastMessage: 'I need to install wiring in my new apartment',
    lastMessageTime: '2024-03-15T09:10:00Z',
    unreadCount: 0,
  },
  {
    id: '2',
    participants: [
      {
        id: '1',
        fullName: 'John Doe',
        avatar: 'https://picsum.photos/seed/user1/200/200',
        isOnline: true,
      },
      {
        id: '3',
        fullName: 'Sarah Johnson',
        avatar: 'https://picsum.photos/seed/user3/200/200',
        isOnline: true,
      },
    ],
    messages: [
      {
        id: '1',
        senderId: '3',
        content: 'Your package is ready for pickup',
        type: 'text',
        timestamp: '2024-03-15T12:00:00Z',
        isRead: true,
      },
      {
        id: '2',
        senderId: '1',
        content: 'Great! When can you deliver it?',
        type: 'text',
        timestamp: '2024-03-15T12:15:00Z',
        isRead: true,
      },
    ],
    lastMessage: 'Great! When can you deliver it?',
    lastMessageTime: '2024-03-15T12:15:00Z',
    unreadCount: 0,
  },
];

// Mock API Functions
export class MockDataService {
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication
  static async login(email: string, password: string) {
    await this.delay(800);
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      return {
        success: true,
        data: {
          user,
          token: `mock_token_${user.id}`,
        },
      };
    }
    throw new Error('Invalid credentials');
  }

  static async register(userData: any) {
    await this.delay(1000);
    const newUser: MockUser = {
      id: (mockUsers.length + 1).toString(),
      email: userData.email,
      firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
      lastName: userData.lastName || userData.fullName?.split(' ')[1] || '',
      fullName: userData.fullName,
      role: userData.role,
      phone: userData.phone,
      avatar: userData.avatar || null,
      profile: {
        id: mockUsers.length + 1,
        avatar: userData.avatar || '',
        birthDate: null,
        bvn: null,
        bvnVerified: null,
        count: 0,
        createdAt: new Date().toISOString(),
        fcmToken: userData.fcmToken || '',
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.fullName?.split(' ')[1] || '',
        notified: false,
        position: null,
        rate: 0,
        store: false,
        switch: false,
        totalDisputes: 0,
        totalExpense: 0,
        totalJobs: 0,
        totalJobsApproved: 0,
        totalJobsCanceled: 0,
        totalJobsCompleted: 0,
        totalJobsDeclined: 0,
        totalJobsOngoing: 0,
        totalJobsPending: 0,
        totalReview: 0,
        updatedAt: new Date().toISOString(),
        userId: (mockUsers.length + 1).toString(),
        verified: false,
        location: userData.location || '',
        bio: '',
        skills: [],
        rating: 0,
      },
      location: {
        id: mockUsers.length + 1,
        address: userData.address || '',
        createdAt: new Date().toISOString(),
        latitude: 0,
        lga: userData.lga || '',
        longitude: 0,
        state: userData.state || '',
        updatedAt: new Date().toISOString(),
        userId: (mockUsers.length + 1).toString(),
        zipcode: null,
      },
      wallet: {
        id: `wallet_${mockUsers.length + 1}`,
        createdAt: new Date().toISOString(),
        currency: 'NGN',
        currentBalance: 0,
        pin: null,
        previousBalance: 0,
        status: 'active',
        updatedAt: new Date().toISOString(),
        userId: (mockUsers.length + 1).toString(),
      },
      fcmToken: userData.fcmToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return {
      success: true,
      data: {
        user: newUser,
        token: `mock_token_${newUser.id}`,
      },
    };
  }

  // Jobs
  static async getJobs(filters?: any) {
    await this.delay(600);
    let jobs = [...mockJobs];
    
    if (filters?.category) {
      jobs = jobs.filter(job => job.category === filters.category);
    }
    if (filters?.status) {
      jobs = jobs.filter(job => job.status === filters.status);
    }
    if (filters?.location) {
      jobs = jobs.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    
    return {
      success: true,
      data: jobs,
    };
  }

  static async getJobById(id: string) {
    await this.delay(400);
    const job = mockJobs.find(j => j.id === id);
    if (!job) throw new Error('Job not found');
    return {
      success: true,
      data: job,
    };
  }

  static async createJob(jobData: any) {
    await this.delay(800);
    const newJob: MockJob = {
      id: (mockJobs.length + 1).toString(),
      ...jobData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockJobs.push(newJob);
    return {
      success: true,
      data: newJob,
    };
  }

  // Deliveries
  static async getDeliveries(status?: string) {
    await this.delay(600);
    let deliveries = [...mockDeliveries];
    
    if (status) {
      deliveries = deliveries.filter(d => d.status === status);
    }
    
    return {
      success: true,
      data: deliveries,
    };
  }

  static async getDeliveryById(id: string) {
    await this.delay(400);
    const delivery = mockDeliveries.find(d => d.id === id);
    if (!delivery) throw new Error('Delivery not found');
    return {
      success: true,
      data: delivery,
    };
  }

  // Reviews
  static async getReviews(userId?: string) {
    await this.delay(500);
    let reviews = [...mockReviews];
    
    if (userId) {
      reviews = reviews.filter(r => r.userId === userId);
    }
    
    return {
      success: true,
      data: reviews,
    };
  }

  static async createReview(reviewData: any) {
    await this.delay(700);
    const newReview: MockReview = {
      id: (mockReviews.length + 1).toString(),
      ...reviewData,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
    };
    mockReviews.push(newReview);
    return {
      success: true,
      data: newReview,
    };
  }

  // Chat
  static async getChats(userId: string) {
    await this.delay(600);
    const userChats = mockChats.filter(chat => 
      chat.participants.some(p => p.id === userId)
    );
    
    return {
      success: true,
      data: userChats,
    };
  }

  static async getChatById(chatId: string) {
    await this.delay(400);
    const chat = mockChats.find(c => c.id === chatId);
    if (!chat) throw new Error('Chat not found');
    return {
      success: true,
      data: chat,
    };
  }

  static async sendMessage(chatId: string, message: any) {
    await this.delay(300);
    const chat = mockChats.find(c => c.id === chatId);
    if (!chat) throw new Error('Chat not found');
    
    const newMessage = {
      id: (chat.messages.length + 1).toString(),
      ...message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = message.content;
    chat.lastMessageTime = newMessage.timestamp;
    
    return {
      success: true,
      data: newMessage,
    };
  }

  // Wallet
  static async getWallet(userId: string) {
    await this.delay(400);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    return {
      success: true,
      data: user.wallet,
    };
  }

  static async fundWallet(userId: string, amount: number) {
    await this.delay(800);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    user.wallet.currentBalance += amount;
    user.wallet.previousBalance = user.wallet.currentBalance - amount;
    
    return {
      success: true,
      data: user.wallet,
    };
  }

  // Profile
  static async updateProfile(userId: string, profileData: any) {
    await this.delay(600);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    Object.assign(user.profile, profileData);
    user.updatedAt = new Date().toISOString();
    
    return {
      success: true,
      data: user,
    };
  }

  // Notifications
  static async getNotifications(userId: string) {
    await this.delay(500);
    const notifications = [
      {
        id: '1',
        title: 'New Job Request',
        message: 'You have a new job request for electrical wiring',
        type: 'job',
        read: false,
        createdAt: '2024-03-15T10:00:00Z',
      },
      {
        id: '2',
        title: 'Payment Received',
        message: 'You received a payment of ₦5,000',
        type: 'payment',
        read: true,
        createdAt: '2024-03-14T15:30:00Z',
      },
    ];
    
    return {
      success: true,
      data: notifications,
    };
  }

  // Settings
  static async updateSettings(userId: string, settings: any) {
    await this.delay(400);
    return {
      success: true,
      data: settings,
    };
  }

  // Search
  static async searchProfessionals(query: string, category?: string) {
    await this.delay(600);
    const professionals = mockUsers.filter(u => u.role === 'professional');
    
    let results = professionals.filter(p => 
      p.fullName.toLowerCase().includes(query.toLowerCase()) ||
      p.profile.bio?.toLowerCase().includes(query.toLowerCase()) ||
      p.profile.skills?.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
    );
    
    if (category) {
      results = results.filter(p => 
        p.profile.skills?.some(skill => skill.toLowerCase() === category.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: results,
    };
  }

  // FAQ
  static async getFAQs() {
    await this.delay(400);
    return {
      success: true,
      data: [
        {
          id: '1',
          question: 'How do I create a job request?',
          answer: 'To create a job request, go to the Jobs tab and tap on "Create Job". Fill in the required details including job title, description, category, and budget.',
          category: 'Jobs',
        },
        {
          id: '2',
          question: 'How do I become a professional?',
          answer: 'To become a professional, go to Profile > Switch to Professional and follow the verification process. You\'ll need to provide your skills and certifications.',
          category: 'Profile',
        },
        {
          id: '3',
          question: 'How do payments work?',
          answer: 'Payments are processed securely through the app. Clients fund their wallet and pay professionals upon job completion. Delivery partners receive payments for successful deliveries.',
          category: 'Payments',
        },
        {
          id: '4',
          question: 'How do I contact support?',
          answer: 'You can contact support through the Profile > Support section. We offer email, phone, and WhatsApp support options.',
          category: 'Support',
        },
      ],
    };
  }

  // Legal Documents
  static async getLegalDocuments() {
    await this.delay(400);
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'Terms of Service',
          content: '# Terms of Service\n\n## 1. Acceptance of Terms\n\nBy using Acepick, you agree to these terms...\n\n## 2. User Responsibilities\n\nUsers must provide accurate information...',
          category: 'Terms',
        },
        {
          id: '2',
          title: 'Privacy Policy',
          content: '# Privacy Policy\n\n## Information We Collect\n\nWe collect information to provide better services...\n\n## How We Use Information\n\nWe use collected information to...',
          category: 'Privacy',
        },
      ],
    };
  }
}

// Mock Hook for easy integration
export const useMockData = () => {
  return {
    users: mockUsers,
    jobs: mockJobs,
    deliveries: mockDeliveries,
    reviews: mockReviews,
    chats: mockChats,
    service: MockDataService,
  };
};

export default MockDataService;
