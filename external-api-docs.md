# External Event API Documentation

Your partner can now post events to EventConnect using the external API endpoint. This API is designed specifically for web crawl jobs and doesn't require authentication.

## API Endpoint

**POST** `/api/external/events`

**Base URL:** Your Replit app URL (e.g., `https://your-app.replit.app`)

## Request Format

### Headers
```
Content-Type: application/json
```

### Required Fields
```json
{
  "title": "Event Title",
  "description": "Event description",
  "category": "Music | Sports | Arts | Food | Tech",
  "date": "2025-07-15",
  "time": "19:00:00",
  "location": "Event location address"
}
```

### Optional Fields
```json
{
  "organizerEmail": "organizer@example.com",
  "source": "EventBrite",
  "sourceUrl": "https://eventbrite.com/event/123",
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "price": "25.00",
  "isFree": false,
  "eventImageUrl": "https://example.com/image.jpg",
  "maxAttendees": 100,
  "capacity": 150,
  "parkingInfo": "Free parking available",
  "meetingPoint": "Main entrance",
  "duration": "2 hours",
  "whatToBring": "Comfortable shoes",
  "specialNotes": "Additional event information",
  "requirements": "18+ only",
  "contactInfo": "contact@example.com",
  "cancellationPolicy": "Full refund if cancelled 24h before"
}
```

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "eventId": 123,
  "message": "Event created successfully",
  "event": {
    "id": 123,
    "title": "Event Title",
    "organizerId": "external_1234567890_abc123",
    // ... other event fields
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid event data",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["title"],
      "message": "Required"
    }
  ]
}
```

## Example Usage

### cURL Example
```bash
curl -X POST https://your-app.replit.app/api/external/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Jazz Night at Blue Note",
    "description": "An evening of smooth jazz featuring local artists",
    "category": "Music",
    "date": "2025-07-15",
    "time": "20:00:00",
    "location": "Blue Note Jazz Club, 123 Music St, San Francisco, CA",
    "organizerEmail": "events@bluenote.com",
    "source": "Blue Note Website",
    "sourceUrl": "https://bluenote.com/events/jazz-night",
    "price": "35.00",
    "isFree": false,
    "duration": "3 hours"
  }'
```

### Python Example
```python
import requests
import json

url = "https://your-app.replit.app/api/external/events"

event_data = {
    "title": "Tech Meetup: AI in Web Development",
    "description": "Join us for a discussion on AI tools in modern web development",
    "category": "Tech",
    "date": "2025-07-20",
    "time": "18:30:00",
    "location": "TechHub, 456 Innovation Dr, San Francisco, CA",
    "organizerEmail": "admin@techhub.com",
    "source": "Meetup.com",
    "sourceUrl": "https://meetup.com/tech-ai-meetup",
    "isFree": True,
    "maxAttendees": 50
}

headers = {"Content-Type": "application/json"}

response = requests.post(url, headers=headers, data=json.dumps(event_data))

if response.status_code == 201:
    result = response.json()
    print(f"Event created successfully! ID: {result['eventId']}")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

const createEvent = async (eventData) => {
  try {
    const response = await axios.post(
      'https://your-app.replit.app/api/external/events',
      eventData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Event created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const eventData = {
  title: "Food Festival Downtown",
  description: "A celebration of local cuisine with 20+ food vendors",
  category: "Food",
  date: "2025-07-25",
  time: "11:00:00",
  location: "Downtown Plaza, 789 Main St, San Francisco, CA",
  source: "City Events",
  isFree: true
};

createEvent(eventData);
```

## Field Details

### Required Fields
- **title**: String (max 255 chars) - Event name
- **description**: String - Detailed event description
- **category**: String - Must be one of: "Music", "Sports", "Arts", "Food", "Tech"
- **date**: String - Format: "YYYY-MM-DD"
- **time**: String - Format: "HH:MM:SS" (24-hour format)
- **location**: String (max 255 chars) - Event address

### Optional Fields
- **organizerEmail**: String - If provided, will link to existing user or create new organizer
- **source**: String - Name of the source website (e.g., "EventBrite", "Meetup")
- **sourceUrl**: String - Original event URL
- **latitude/longitude**: String - GPS coordinates for precise location
- **price**: String - Event price (e.g., "25.00")
- **isFree**: Boolean - Whether the event is free (defaults to true if price is "0.00")
- **eventImageUrl**: String - URL to event image
- **maxAttendees**: Integer - Maximum number of attendees
- **capacity**: Integer - Venue capacity
- **parkingInfo**: String - Parking instructions
- **meetingPoint**: String - Where to meet for the event
- **duration**: String - How long the event lasts
- **whatToBring**: String - Items attendees should bring
- **specialNotes**: String - Additional notes (source info will be appended)
- **requirements**: String - Age limits or other requirements
- **contactInfo**: String - Contact information
- **cancellationPolicy**: String - Cancellation terms

## Organizer Handling

The API automatically handles organizer creation:

1. **If organizerEmail is provided:**
   - Searches for existing user with that email
   - If found, uses that user as organizer
   - If not found, creates new user with that email

2. **If organizerEmail is not provided:**
   - Creates a default external organizer
   - Uses email format: `external-{timestamp}@eventconnect.app`

## Rate Limiting & Best Practices

- No authentication required, but don't abuse the endpoint
- Include source information to track where events come from
- Use proper date/time formats to avoid parsing errors
- Validate data before sending to reduce error responses
- Handle HTTP errors gracefully in your crawl job

## Testing the API

You can test the API immediately using any HTTP client. The endpoint is live and ready to receive events from your partner's web crawl job.

Replace `https://your-app.replit.app` with your actual Replit app URL when sharing this documentation with your partner.