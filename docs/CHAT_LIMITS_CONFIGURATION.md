# Chat Limits Configuration System

## Overview
The chat system now has three configurable limits that can be managed from the admin panel:

1. **maxMessagesInDB** - Maximum messages stored in database per conversation
2. **maxMessagesToAI** - Maximum messages sent as context to AI (from stored messages)
3. **maxUserMessagesPerDay** - Maximum messages a user can send per day

## Database Models

### Configuration Model
Located in: `models/configuration.model.js`

The `chatLimits` field contains:
```javascript
chatLimits: {
    maxMessagesInDB: {
        type: Number,
        default: 30,
        min: 10,
        max: 100
    },
    maxMessagesToAI: {
        type: Number,
        default: 20,
        min: 5,
        max: 50
    },
    maxUserMessagesPerDay: {
        type: Number,
        default: 100,
        min: 10,
        max: 1000
    }
}
```

### UserChatUsage Model
Located in: `models/user_chat_usage.model.js`

Tracks daily message usage per user:
```javascript
{
    userId: String,
    date: Date,
    messageCount: Number,
    conversationId: String
}
```

## API Endpoints

### Get Current Configuration
```
GET /api/configuration
```
Returns all configuration including `chatLimits`.

### Update Configuration
```
PUT /api/configuration
```
Body example:
```json
{
    "chatLimits": {
        "maxMessagesInDB": 50,
        "maxMessagesToAI": 30,
        "maxUserMessagesPerDay": 200
    }
}
```

### Get User Chat Usage Stats
```
GET /api/chat/usage/stats
Headers: Authorization: Bearer <token>
```
Response:
```json
{
    "limits": {
        "maxMessagesInDB": 30,
        "maxMessagesToAI": 20,
        "maxUserMessagesPerDay": 100
    },
    "usage": {
        "messagesUsedToday": 45,
        "remaining": 55,
        "percentage": 45
    },
    "date": "2025-11-16T00:00:00.000Z"
}
```

### Send Message
```
POST /api/chat/message
```
Now returns usage information:
```json
{
    "assistant": "Response from AI...",
    "usage": {
        "messagesUsedToday": 46,
        "dailyLimit": 100,
        "remaining": 54
    }
}
```

If daily limit is reached, returns 429:
```json
{
    "error": "Daily message limit reached",
    "limit": 100,
    "used": 100,
    "message": "Has alcanzado el límite diario de 100 mensajes. Intenta mañana."
}
```

## How It Works

### Message Storage (maxMessagesInDB)
- All messages are stored in the database
- When limit is reached, oldest messages are removed
- System message (with module instructions + user name) is ALWAYS preserved
- Example: If limit is 30, stores 1 system + 29 user/assistant messages

### Context Sent to AI (maxMessagesToAI)
- Controls how many messages are sent to OpenAI for context
- Should be ≤ maxMessagesInDB
- Reduces token usage and API costs
- System message is ALWAYS included
- Example: If limit is 20, sends 1 system + 19 recent messages

### Daily User Limit (maxUserMessagesPerDay)
- Tracks total messages sent by user per day (all conversations)
- Resets at midnight (00:00:00 local time)
- Prevents abuse and controls API costs
- Tracked in `UserChatUsage` collection

## Admin Panel Integration

The Angular admin panel should provide a form to configure these values:

```typescript
interface ChatLimits {
  maxMessagesInDB: number;      // Range: 10-100
  maxMessagesToAI: number;       // Range: 5-50
  maxUserMessagesPerDay: number; // Range: 10-1000
}
```

### Recommended UI
1. **Slider inputs** with min/max constraints
2. **Help text** explaining each setting
3. **Warning** if maxMessagesToAI > maxMessagesInDB
4. **Preview** showing example cost implications

### Example Angular Component
```typescript
updateChatLimits() {
  const config = {
    chatLimits: {
      maxMessagesInDB: this.maxMessagesInDB,
      maxMessagesToAI: this.maxMessagesToAI,
      maxUserMessagesPerDay: this.maxUserMessagesPerDay
    }
  };
  
  this.configService.updateConfiguration(config).subscribe({
    next: (response) => {
      this.toastr.success('Chat limits updated successfully');
    },
    error: (error) => {
      this.toastr.error('Failed to update chat limits');
    }
  });
}
```

## Best Practices

### Recommended Values

#### For Development/Testing:
- maxMessagesInDB: 20
- maxMessagesToAI: 10
- maxUserMessagesPerDay: 50

#### For Production (Small Scale):
- maxMessagesInDB: 30
- maxMessagesToAI: 20
- maxUserMessagesPerDay: 100

#### For Production (Large Scale):
- maxMessagesInDB: 50
- maxMessagesToAI: 30
- maxUserMessagesPerDay: 200

### Important Notes

1. **maxMessagesToAI should be ≤ maxMessagesInDB**
   - Otherwise you'll send messages that aren't stored

2. **Higher limits = Higher costs**
   - More context to AI = more tokens = higher OpenAI costs
   - Monitor usage and adjust accordingly

3. **Daily limits per user type**
   - Consider different limits for free vs paid users
   - Could add role-based limits in the future

4. **System message always included**
   - Contains module instructions + user name
   - Never trimmed or removed
   - Doesn't count towards limits

## Migration

If you have existing conversations, they will continue to work. The limits will apply on the next message sent.

No database migration is needed - the Configuration model update handles defaults automatically.

## Monitoring

To monitor chat usage:
1. Check UserChatUsage collection for daily usage patterns
2. Monitor OpenAI API costs and token usage
3. Adjust limits based on actual usage and budget

## Future Enhancements

Potential improvements:
- Role-based limits (admin, premium user, free user)
- Weekly/monthly limits in addition to daily
- Automatic limit increases for verified users
- Analytics dashboard showing usage trends
- Rate limiting per conversation (X messages per minute)
