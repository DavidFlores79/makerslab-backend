# Legal Documents API

This API provides endpoints to manage Terms and Conditions and Privacy Policy documents in multiple languages (English and Spanish).

## Features

- ✅ Multi-language support (English and Spanish)
- ✅ Version control for legal documents
- ✅ Active/Inactive status management
- ✅ Public endpoint for fetching active documents (no auth required)
- ✅ Protected admin endpoints for CRUD operations
- ✅ Automatic deactivation of old versions when activating new ones
- ✅ Track who created/updated documents

## Data Model

### LegalDocument Schema

```javascript
{
  type: String, // 'terms_and_conditions' or 'privacy_policy'
  language: String, // 'en' or 'es'
  title: String,
  content: String,
  version: String, // e.g., '1.0', '1.1', '2.0'
  isActive: Boolean,
  effectiveDate: Date,
  createdBy: ObjectId, // Reference to User
  updatedBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get Active Legal Documents
```
GET /api/legal/active
```

**Query Parameters:**
- `type` (optional): Filter by document type (`terms_and_conditions` or `privacy_policy`)
- `language` (optional): Filter by language (`en` or `es`)

**Examples:**
```bash
# Get all active documents
GET /api/legal/active

# Get active Terms and Conditions in English
GET /api/legal/active?type=terms_and_conditions&language=en

# Get all active documents in Spanish
GET /api/legal/active?language=es

# Get Privacy Policy in both languages
GET /api/legal/active?type=privacy_policy
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "terms_and_conditions",
      "language": "en",
      "title": "Terms and Conditions",
      "content": "Full content here...",
      "version": "1.0",
      "isActive": true,
      "effectiveDate": "2025-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "type": "terms_and_conditions",
      "language": "es",
      "title": "Términos y Condiciones",
      "content": "Contenido completo aquí...",
      "version": "1.0",
      "isActive": true,
      "effectiveDate": "2025-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Protected Endpoints (Authentication Required)

All endpoints below require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

#### Get All Legal Documents
```
GET /api/legal
```

**Query Parameters:**
- `type` (optional): Filter by document type (`terms_and_conditions` or `privacy_policy`)
- `language` (optional): Filter by language (`en` or `es`)
- `isActive` (optional): Filter by active status (`true` or `false`)

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "terms_and_conditions",
      "language": "en",
      "title": "Terms and Conditions",
      "content": "Full content here...",
      "version": "1.0",
      "isActive": true,
      "effectiveDate": "2025-01-01T00:00:00.000Z",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "updatedBy": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Legal Document by ID
```
GET /api/legal/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "terms_and_conditions",
    "language": "en",
    "title": "Terms and Conditions",
    "content": "Full content here...",
    "version": "1.0",
    "isActive": true,
    "effectiveDate": "2025-01-01T00:00:00.000Z",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Create Legal Document
```
POST /api/legal
```

**Request Body:**
```json
{
  "type": "terms_and_conditions",
  "language": "en",
  "title": "Terms and Conditions",
  "content": "Full content of the terms and conditions...",
  "version": "1.0",
  "effectiveDate": "2025-01-01T00:00:00.000Z"
}
```

**Validation Rules:**
- `type`: Required, must be `terms_and_conditions` or `privacy_policy`
- `language`: Required, must be `en` or `es`
- `title`: Required, 3-200 characters
- `content`: Required, minimum 10 characters
- `version`: Optional, 1-20 characters
- `effectiveDate`: Optional, must be valid ISO 8601 date

**Response:**
```json
{
  "success": true,
  "message": "Legal document created successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "terms_and_conditions",
    "language": "en",
    "title": "Terms and Conditions",
    "content": "Full content of the terms and conditions...",
    "version": "1.0",
    "isActive": false,
    "effectiveDate": "2025-01-01T00:00:00.000Z",
    "createdBy": "507f1f77bcf86cd799439013",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Update Legal Document
```
PUT /api/legal/:id
```

**Request Body:**
```json
{
  "title": "Updated Terms and Conditions",
  "content": "Updated content...",
  "version": "1.1"
}
```

All fields are optional. Only include the fields you want to update.

**Response:**
```json
{
  "success": true,
  "message": "Legal document updated successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "terms_and_conditions",
    "language": "en",
    "title": "Updated Terms and Conditions",
    "content": "Updated content...",
    "version": "1.1",
    "isActive": false,
    "effectiveDate": "2025-01-01T00:00:00.000Z",
    "createdBy": "507f1f77bcf86cd799439013",
    "updatedBy": "507f1f77bcf86cd799439014",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### Activate Legal Document
```
PATCH /api/legal/:id/activate
```

This endpoint will:
1. Set the specified document as `isActive: true`
2. Automatically deactivate all other documents with the same `type` and `language`

**Response:**
```json
{
  "success": true,
  "message": "Legal document activated successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "terms_and_conditions",
    "language": "en",
    "isActive": true,
    ...
  }
}
```

---

#### Deactivate Legal Document
```
PATCH /api/legal/:id/deactivate
```

**Response:**
```json
{
  "success": true,
  "message": "Legal document deactivated successfully.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "terms_and_conditions",
    "language": "en",
    "isActive": false,
    ...
  }
}
```

---

#### Delete Legal Document
```
DELETE /api/legal/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Legal document deleted successfully."
}
```

---

## Usage Examples

### Frontend Integration

#### React Example
```javascript
// Fetch active terms and conditions in user's language
const fetchTerms = async (language = 'en') => {
  const response = await fetch(
    `${API_URL}/api/legal/active?type=terms_and_conditions&language=${language}`
  );
  const data = await response.json();
  return data.data[0]; // Returns the active document
};

// Fetch privacy policy
const fetchPrivacyPolicy = async (language = 'en') => {
  const response = await fetch(
    `${API_URL}/api/legal/active?type=privacy_policy&language=${language}`
  );
  const data = await response.json();
  return data.data[0];
};
```

#### Admin Panel - Create New Document
```javascript
const createLegalDocument = async (token, documentData) => {
  const response = await fetch(`${API_URL}/api/legal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(documentData)
  });
  return await response.json();
};

// Usage
await createLegalDocument(authToken, {
  type: 'terms_and_conditions',
  language: 'en',
  title: 'Terms and Conditions',
  content: 'Full content here...',
  version: '1.0',
  effectiveDate: new Date().toISOString()
});
```

#### Admin Panel - Activate Document
```javascript
const activateDocument = async (token, documentId) => {
  const response = await fetch(`${API_URL}/api/legal/${documentId}/activate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

---

## Workflow for Updating Legal Documents

1. **Create a new version** of the document (POST /api/legal)
   - The new document is created with `isActive: false`

2. **Review and test** the new document
   - Fetch it by ID to verify content

3. **Activate the new version** (PATCH /api/legal/:id/activate)
   - This automatically deactivates the old version
   - Users immediately see the new version

4. **Keep old versions** for historical reference
   - Old versions remain in the database with `isActive: false`

---

## Error Responses

```json
// 400 Bad Request - Validation Error
{
  "success": false,
  "message": "Validation error.",
  "errors": [
    "Document type must be \"terms_and_conditions\" or \"privacy_policy\""
  ]
}

// 404 Not Found
{
  "success": false,
  "message": "Legal document not found."
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Internal server error."
}
```

---

## Best Practices

1. **Always maintain both languages**: Create documents in both English and Spanish
2. **Use semantic versioning**: e.g., `1.0`, `1.1`, `2.0`
3. **Set effective dates**: Use future dates when planning document updates
4. **Test before activating**: Create and review documents before making them active
5. **Keep historical versions**: Don't delete old versions, they serve as an audit trail

---

## Database Indexes

The model includes the following indexes for optimal performance:
- `{ type: 1, language: 1, isActive: 1 }` - Compound index for quick active document lookups
- `type` - Individual index for filtering by document type
- `language` - Individual index for filtering by language
- `isActive` - Individual index for filtering by status
