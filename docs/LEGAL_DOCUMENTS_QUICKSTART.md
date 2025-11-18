# Legal Documents - Quick Start Guide

## 🚀 Quick Setup

### 1. Seed Initial Data
Run this command to populate the database with initial Terms and Conditions and Privacy Policy in both languages:

```bash
node scripts/seedLegalDocuments.js
```

This will create:
- ✅ Terms and Conditions (English)
- ✅ Terms and Conditions (Spanish)
- ✅ Privacy Policy (English)
- ✅ Privacy Policy (Spanish)

---

## 📡 API Endpoints Summary

### Public Endpoint (No Auth)
```
GET /api/legal/active              # Get all active documents
GET /api/legal/active?language=en  # Get active documents in English
GET /api/legal/active?language=es  # Get active documents in Spanish
GET /api/legal/active?type=terms_and_conditions&language=en
```

### Admin Endpoints (Auth Required)
```
GET    /api/legal                  # Get all documents
GET    /api/legal/:id              # Get document by ID
POST   /api/legal                  # Create new document
PUT    /api/legal/:id              # Update document
PATCH  /api/legal/:id/activate     # Activate document
PATCH  /api/legal/:id/deactivate   # Deactivate document
DELETE /api/legal/:id              # Delete document
```

---

## 🔑 Document Types

- `terms_and_conditions` - Terms and Conditions
- `privacy_policy` - Privacy Policy

## 🌍 Supported Languages

- `en` - English
- `es` - Spanish (Español)

---

## 📝 Creating a New Document

```bash
POST /api/legal
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "type": "terms_and_conditions",
  "language": "en",
  "title": "Terms and Conditions",
  "content": "Full content here...",
  "version": "1.0",
  "effectiveDate": "2025-01-01T00:00:00.000Z"
}
```

---

## 🔄 Updating Process

1. **Create new version** (isActive: false by default)
2. **Review** the document
3. **Activate** when ready → automatically deactivates old version
4. **Old versions** remain in DB for audit trail

---

## 💡 Frontend Usage

### React/Next.js Example

```javascript
// Fetch active terms
const getTerms = async (lang = 'en') => {
  const res = await fetch(
    `/api/legal/active?type=terms_and_conditions&language=${lang}`
  );
  const data = await res.json();
  return data.data[0];
};

// Fetch privacy policy
const getPrivacy = async (lang = 'en') => {
  const res = await fetch(
    `/api/legal/active?type=privacy_policy&language=${lang}`
  );
  const data = await res.json();
  return data.data[0];
};
```

### Display Component
```jsx
function LegalDocument({ type, language }) {
  const [doc, setDoc] = useState(null);
  
  useEffect(() => {
    fetch(`/api/legal/active?type=${type}&language=${language}`)
      .then(res => res.json())
      .then(data => setDoc(data.data[0]));
  }, [type, language]);
  
  if (!doc) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{doc.title}</h1>
      <p>Version: {doc.version}</p>
      <p>Effective: {new Date(doc.effectiveDate).toLocaleDateString()}</p>
      <div dangerouslySetInnerHTML={{ __html: doc.content }} />
    </div>
  );
}
```

---

## 📋 Files Created

- `models/legal_document.model.js` - Mongoose model
- `controllers/legal_documents.controller.js` - Business logic
- `routes/legal_documents.routes.js` - API routes
- `validators/legal_document.validator.js` - Validation rules
- `scripts/seedLegalDocuments.js` - Database seeder
- `docs/LEGAL_DOCUMENTS_API.md` - Full API documentation

---

## ✅ Testing

### Test Public Endpoint
```bash
# Using curl
curl http://localhost:3000/api/legal/active?language=en

# Using Postman
GET http://localhost:3000/api/legal/active?language=en
```

### Test Admin Endpoints
```bash
# Get all documents
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/legal

# Create document
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"terms_and_conditions","language":"en","title":"Test","content":"Test content"}' \
     http://localhost:3000/api/legal
```

---

## 🎯 Common Use Cases

### 1. Website Footer
Show links to current Terms and Privacy Policy

### 2. Registration Flow
Display terms for user acceptance before signup

### 3. Settings Page
Allow users to review current policies

### 4. Admin Panel
Manage and update legal documents

### 5. Mobile App
Fetch and display legal information

---

## 🔒 Security Notes

- Public endpoint returns only active documents
- Admin endpoints require JWT authentication
- createdBy/updatedBy track document changes
- Validation prevents invalid document types/languages

---

## 📊 Database Indexes

The model uses these indexes for performance:
- Compound: `{type, language, isActive}`
- Individual: `type`, `language`, `isActive`

---

## 🆘 Support

For issues or questions, check the full documentation:
- `docs/LEGAL_DOCUMENTS_API.md`

---

**Happy Coding! 🎉**
