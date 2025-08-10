const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: 'user-1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    customAvatarUrl: null,
    animeAvatarSeed: 'john-doe-123',
    location: 'San Francisco, CA',
    interests: ['Technology', 'Software Development'],
    personality: ['Innovative', 'Friendly'],
    aiSignature: 'Tech enthusiast and problem solver',
    skippedEvents: [],
    eventsShownSinceSkip: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    customAvatarUrl: null,
    animeAvatarSeed: 'jane-smith-456',
    location: 'New York, NY',
    interests: ['Music', 'Live Events'],
    personality: ['Creative', 'Outgoing'],
    aiSignature: 'Music lover and event organizer',
    skippedEvents: [],
    eventsShownSinceSkip: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockEvents = [
  {
    id: 1,
    title: 'Tech Meetup 2024',
    description: 'Join us for an exciting tech meetup where we\'ll discuss the latest trends in software development, AI, and cloud computing. Network with fellow developers and learn from industry experts.',
    category: 'Technology',
    subCategory: 'Software Development',
    date: '2024-08-15',
    time: '18:00:00',
    location: 'San Francisco, CA',
    latitude: '37.7749',
    longitude: '-122.4194',
    price: '0.00',
    isFree: true,
    eventImageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
    organizerId: 'user-1',
    maxAttendees: 50,
    capacity: 50,
    parkingInfo: 'Street parking available',
    meetingPoint: 'Main entrance',
    duration: '2 hours',
    whatToBring: 'Laptop, business cards',
    specialNotes: 'Free coffee and snacks provided',
    requirements: 'Basic programming knowledge',
    contactInfo: 'tech@example.com',
    cancellationPolicy: '24 hours notice required',
    isActive: true,
    isPrivateChat: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: mockUsers[0],
    rsvpCount: 15,
    userRsvpStatus: 'going',
  },
  {
    id: 2,
    title: 'Music Festival',
    description: 'A day filled with amazing live music performances from local and international artists. Experience different genres from rock to jazz to electronic music.',
    category: 'Music',
    subCategory: 'Live Performance',
    date: '2024-08-20',
    time: '14:00:00',
    location: 'Central Park, NY',
    latitude: '40.7829',
    longitude: '-73.9654',
    price: '25.00',
    isFree: false,
    eventImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    organizerId: 'user-2',
    maxAttendees: 200,
    capacity: 200,
    parkingInfo: 'Public parking available',
    meetingPoint: 'Main stage area',
    duration: '6 hours',
    whatToBring: 'Comfortable shoes, water bottle',
    specialNotes: 'Food vendors on site',
    requirements: 'All ages welcome',
    contactInfo: 'music@example.com',
    cancellationPolicy: 'No refunds',
    isActive: true,
    isPrivateChat: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: mockUsers[1],
    rsvpCount: 45,
    userRsvpStatus: 'maybe',
  },
  {
    id: 3,
    title: 'Food & Wine Tasting',
    description: 'Experience the finest wines and gourmet food from around the world. Learn about wine pairing, food preparation techniques, and culinary traditions.',
    category: 'Food & Drink',
    subCategory: 'Wine Tasting',
    date: '2024-08-25',
    time: '19:00:00',
    location: 'Downtown Restaurant District',
    latitude: '40.7589',
    longitude: '-73.9851',
    price: '75.00',
    isFree: false,
    eventImageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    organizerId: 'user-1',
    maxAttendees: 30,
    capacity: 30,
    parkingInfo: 'Valet parking available',
    meetingPoint: 'Restaurant lobby',
    duration: '3 hours',
    whatToBring: 'Appetite for fine dining',
    specialNotes: 'Dress code: Business casual',
    requirements: 'Must be 21+',
    contactInfo: 'food@example.com',
    cancellationPolicy: '48 hours notice required',
    isActive: true,
    isPrivateChat: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: mockUsers[0],
    rsvpCount: 8,
    userRsvpStatus: null,
  },
];

const mockRsvps = [
  { id: 1, eventId: 1, userId: 'user-1', status: 'going', hasLeftChat: false, createdAt: new Date() },
  { id: 2, eventId: 2, userId: 'user-1', status: 'maybe', hasLeftChat: false, createdAt: new Date() },
];

// Auth middleware (simplified)
const isAuthenticated = (req, res, next) => {
  // For mock server, always authenticate as user-1
  req.user = { claims: { sub: 'user-1' } };
  next();
};

// Routes
app.get('/api/auth/user', isAuthenticated, (req, res) => {
  const user = mockUsers.find(u => u.id === req.user.claims.sub);
  res.json(user);
});

app.get('/api/events', isAuthenticated, (req, res) => {
  const { category, timeFilter, limit = 20 } = req.query;
  let filteredEvents = [...mockEvents];
  
  if (category && category !== 'All') {
    filteredEvents = filteredEvents.filter(event => event.category === category);
  }
  
  if (timeFilter === 'upcoming') {
    const now = new Date();
    filteredEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.date + 'T' + event.time);
      return eventDate > now;
    });
  }
  
  // Add user's RSVP status to events
  const eventsWithRsvp = filteredEvents.map(event => {
    const userRsvp = mockRsvps.find(rsvp => 
      rsvp.eventId === event.id && rsvp.userId === req.user.claims.sub
    );
    return {
      ...event,
      userRsvpStatus: userRsvp ? userRsvp.status : null,
    };
  });
  
  res.json(eventsWithRsvp.slice(0, parseInt(limit)));
});

app.get('/api/events/browse', (req, res) => {
  const { category, timeFilter, limit = 100 } = req.query;
  let filteredEvents = [...mockEvents];
  
  if (category && category !== 'All') {
    filteredEvents = filteredEvents.filter(event => event.category === category);
  }
  
  if (timeFilter === 'upcoming') {
    const now = new Date();
    filteredEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.date + 'T' + event.time);
      return eventDate > now;
    });
  }
  
  res.json(filteredEvents.slice(0, parseInt(limit)));
});

app.get('/api/events/:id', isAuthenticated, (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = mockEvents.find(e => e.id === eventId);
  
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  
  const userRsvp = mockRsvps.find(rsvp => 
    rsvp.eventId === eventId && rsvp.userId === req.user.claims.sub
  );
  
  const eventWithRsvp = {
    ...event,
    userRsvpStatus: userRsvp ? userRsvp.status : null,
  };
  
  res.json(eventWithRsvp);
});

app.post('/api/events/:id/rsvp', isAuthenticated, (req, res) => {
  const eventId = parseInt(req.params.id);
  const { status } = req.body;
  const userId = req.user.claims.sub;
  
  if (!['going', 'maybe', 'not_going'].includes(status)) {
    return res.status(400).json({ message: 'Invalid RSVP status' });
  }
  
  const existingRsvpIndex = mockRsvps.findIndex(rsvp => 
    rsvp.eventId === eventId && rsvp.userId === userId
  );
  
  if (existingRsvpIndex >= 0) {
    mockRsvps[existingRsvpIndex].status = status;
    mockRsvps[existingRsvpIndex].updatedAt = new Date();
  } else {
    const newRsvp = {
      id: mockRsvps.length + 1,
      eventId,
      userId,
      status,
      hasLeftChat: false,
      createdAt: new Date(),
    };
    mockRsvps.push(newRsvp);
  }
  
  res.json({ success: true, message: 'RSVP updated successfully' });
});

app.get('/api/events/:id/rsvp-status', isAuthenticated, (req, res) => {
  const eventId = parseInt(req.params.id);
  const userId = req.user.claims.sub;
  
  const userRsvp = mockRsvps.find(rsvp => 
    rsvp.eventId === eventId && rsvp.userId === userId
  );
  
  if (!userRsvp) {
    return res.status(404).json({ message: 'No RSVP found' });
  }
  
  res.json(userRsvp);
});

app.get('/api/users/me/events/attending', isAuthenticated, (req, res) => {
  const userId = req.user.claims.sub;
  const userRsvps = mockRsvps.filter(rsvp => rsvp.userId === userId);
  
  const attendingEvents = userRsvps.map(rsvp => {
    const event = mockEvents.find(e => e.id === rsvp.eventId);
    return {
      ...event,
      rsvp_status: rsvp.status,
    };
  });
  
  res.json(attendingEvents);
});

app.get('/api/users/profile', isAuthenticated, (req, res) => {
  const user = mockUsers.find(u => u.id === req.user.claims.sub);
  res.json(user);
});

app.post('/api/users/profile', isAuthenticated, (req, res) => {
  const { firstName, lastName, location, interests, personality } = req.body;
  const userIndex = mockUsers.findIndex(u => u.id === req.user.claims.sub);
  
  if (userIndex >= 0) {
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      firstName: firstName || mockUsers[userIndex].firstName,
      lastName: lastName || mockUsers[userIndex].lastName,
      location: location || mockUsers[userIndex].location,
      interests: interests || mockUsers[userIndex].interests,
      personality: personality || mockUsers[userIndex].personality,
      updatedAt: new Date(),
    };
  }
  
  res.json(mockUsers[userIndex]);
});

app.post('/api/users/avatar', isAuthenticated, (req, res) => {
  const { profileImageUrl } = req.body;
  const userIndex = mockUsers.findIndex(u => u.id === req.user.claims.sub);
  
  if (userIndex >= 0) {
    mockUsers[userIndex].profileImageUrl = profileImageUrl;
    mockUsers[userIndex].updatedAt = new Date();
  }
  
  res.json({ success: true, message: 'Avatar updated successfully' });
});

app.post('/api/login', (req, res) => {
  // Mock login - always return success
  res.json({ success: true, message: 'Login successful' });
});

app.get('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Mock server running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET /api/auth/user');
  console.log('- GET /api/events');
  console.log('- GET /api/events/browse');
  console.log('- GET /api/events/:id');
  console.log('- POST /api/events/:id/rsvp');
  console.log('- GET /api/events/:id/rsvp-status');
  console.log('- GET /api/users/me/events/attending');
  console.log('- GET /api/users/profile');
  console.log('- POST /api/users/profile');
  console.log('- POST /api/users/avatar');
});
