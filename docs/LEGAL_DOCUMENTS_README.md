# Legal Documents Feature - Complete Implementation

## 📖 Overview

This implementation provides a complete REST API for managing Terms and Conditions and Privacy Policy documents with multi-language support (English and Spanish). Documents can be versioned, activated/deactivated, and stored in MongoDB for easy updates.

---

## 🎯 Features

✅ **Multi-language Support** - English (`en`) and Spanish (`es`)  
✅ **Document Types** - Terms and Conditions & Privacy Policy  
✅ **Version Control** - Track different versions of legal documents  
✅ **Active/Inactive Status** - Control which version is visible to users  
✅ **Public API** - Unauthenticated endpoint for fetching active documents  
✅ **Admin API** - Protected endpoints for CRUD operations  
✅ **Audit Trail** - Track who created/updated documents  
✅ **Database Indexes** - Optimized queries for performance  
✅ **Validation** - Comprehensive input validation  
✅ **Seed Script** - Quick setup with sample data

---

## 📁 Files Created

```
models/
  └── legal_document.model.js          # Mongoose schema and model

controllers/
  └── legal_documents.controller.js    # Business logic and API handlers

routes/
  └── legal_documents.routes.js        # Express routes configuration

validators/
  └── legal_document.validator.js      # Input validation rules

scripts/
  └── seedLegalDocuments.js            # Database seeder script

docs/
  ├── LEGAL_DOCUMENTS_API.md           # Complete API documentation
  ├── LEGAL_DOCUMENTS_QUICKSTART.md    # Quick start guide
  └── LEGAL_DOCUMENTS_README.md        # This file
```

---

## 🚀 Getting Started

### 1. Install Dependencies
All required dependencies should already be installed:
- `mongoose` - MongoDB ODM
- `express-validator` - Input validation

### 2. Seed Initial Data
Populate the database with sample legal documents:

```bash
node scripts/seedLegalDocuments.js
```

This creates 4 documents:
- Terms and Conditions (English & Spanish)
- Privacy Policy (English & Spanish)

### 3. Test the API
```bash
# Test public endpoint
curl http://localhost:PORT/api/legal/active?language=en

# Test with authenticated request (admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:PORT/api/legal
```

---

## 🌐 API Endpoints

### Public Endpoints (No Authentication)

```
GET /api/legal/active
```
Fetch active legal documents. Supports query parameters:
- `type`: `terms_and_conditions` or `privacy_policy`
- `language`: `en` or `es`

**Examples:**
```bash
GET /api/legal/active                                    # All active documents
GET /api/legal/active?language=en                        # All active English docs
GET /api/legal/active?type=privacy_policy&language=es    # Spanish privacy policy
```

### Protected Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/legal` | Get all documents (with filters) |
| GET | `/api/legal/:id` | Get specific document by ID |
| POST | `/api/legal` | Create new document |
| PUT | `/api/legal/:id` | Update existing document |
| PATCH | `/api/legal/:id/activate` | Activate document (deactivates others) |
| PATCH | `/api/legal/:id/deactivate` | Deactivate document |
| DELETE | `/api/legal/:id` | Delete document |

---

## 📊 Data Model

```javascript
{
  type: String,              // 'terms_and_conditions' or 'privacy_policy'
  language: String,          // 'en' or 'es'
  title: String,             // Document title
  content: String,           // Full document content (HTML/Markdown supported)
  version: String,           // Version identifier (e.g., '1.0', '2.0')
  isActive: Boolean,         // Whether document is currently active
  effectiveDate: Date,       // When document becomes effective
  createdBy: ObjectId,       // User who created the document
  updatedBy: ObjectId,       // User who last updated the document
  createdAt: Date,           // Auto-generated timestamp
  updatedAt: Date            // Auto-generated timestamp
}
```

---

## 🔄 Workflow

### Creating and Activating a New Document

1. **Create Draft**
   ```bash
   POST /api/legal
   Body: {
     "type": "terms_and_conditions",
     "language": "en",
     "title": "Terms and Conditions v2.0",
     "content": "Updated content...",
     "version": "2.0"
   }
   ```
   → Document created with `isActive: false`

2. **Review**
   ```bash
   GET /api/legal/:id
   ```
   → Verify content is correct

3. **Activate**
   ```bash
   PATCH /api/legal/:id/activate
   ```
   → Makes document active and automatically deactivates previous versions

4. **Verify**
   ```bash
   GET /api/legal/active?type=terms_and_conditions&language=en
   ```
   → Check that new version is being served to users

---

## 💻 Frontend Integration

### React Example

```jsx
import { useState, useEffect } from 'react';

function TermsAndConditions({ language = 'en' }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/legal/active?type=terms_and_conditions&language=${language}`)
      .then(res => res.json())
      .then(data => {
        setDocument(data.data[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [language]);

  if (loading) return <div>Loading...</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <div className="legal-document">
      <h1>{document.title}</h1>
      <p className="version">Version {document.version}</p>
      <p className="effective-date">
        Effective: {new Date(document.effectiveDate).toLocaleDateString()}
      </p>
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: document.content }}
      />
    </div>
  );
}

export default TermsAndConditions;
```

### Vue.js Example

```vue
<template>
  <div class="legal-document" v-if="document">
    <h1>{{ document.title }}</h1>
    <p class="version">Version {{ document.version }}</p>
    <p class="effective-date">
      Effective: {{ formatDate(document.effectiveDate) }}
    </p>
    <div class="content" v-html="document.content"></div>
  </div>
  <div v-else>Loading...</div>
</template>

<script>
export default {
  data() {
    return {
      document: null,
    };
  },
  async mounted() {
    const type = 'privacy_policy';
    const language = this.$i18n.locale || 'en';
    
    const response = await fetch(
      `/api/legal/active?type=${type}&language=${language}`
    );
    const data = await response.json();
    this.document = data.data[0];
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>
```

---

## 🔒 Security

- **Public endpoint** (`/api/legal/active`) is rate-limited and returns only active documents
- **Admin endpoints** require JWT authentication
- **Input validation** prevents malicious data
- **Sanitization** via express-mongo-sanitize and xss-clean middleware
- **User tracking** via `createdBy` and `updatedBy` fields

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# Get active documents
curl http://localhost:3000/api/legal/active?language=en

# Get all documents (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/legal

# Create new document (requires auth)
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "terms_and_conditions",
       "language": "en",
       "title": "Terms and Conditions",
       "content": "Sample content",
       "version": "1.0"
     }' \
     http://localhost:3000/api/legal

# Activate document (requires auth)
curl -X PATCH \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/legal/DOCUMENT_ID/activate
```

### Postman Collection

Import these requests into Postman:

1. **Get Active Documents**
   - Method: GET
   - URL: `{{baseUrl}}/api/legal/active?language=en`

2. **Get All Documents**
   - Method: GET
   - URL: `{{baseUrl}}/api/legal`
   - Headers: `Authorization: Bearer {{token}}`

3. **Create Document**
   - Method: POST
   - URL: `{{baseUrl}}/api/legal`
   - Headers: `Authorization: Bearer {{token}}`
   - Body (JSON):
   ```json
   {
     "type": "terms_and_conditions",
     "language": "en",
     "title": "Terms and Conditions",
     "content": "Your content here",
     "version": "1.0"
   }
   ```

---

## 📝 Best Practices

1. **Always maintain both languages** - Create documents in English and Spanish
2. **Use semantic versioning** - `1.0`, `1.1`, `2.0`, etc.
3. **Set future effective dates** - When planning scheduled updates
4. **Test before activating** - Review documents thoroughly
5. **Keep old versions** - Never delete for audit trail
6. **Use Markdown/HTML** - Format content for better readability
7. **Add effective dates** - Important for legal compliance

---

## 🐛 Troubleshooting

### Documents not appearing in frontend
- Check that documents are active: `GET /api/legal?isActive=true`
- Verify language code matches: `en` or `es` (not `en-US`, `es-ES`)
- Check network tab for API errors

### Cannot create document
- Ensure JWT token is valid
- Verify all required fields are provided
- Check validation error messages

### Multiple active documents of same type/language
- Use activate endpoint to ensure only one is active
- Check database for isActive status

---

## 📚 Additional Resources

- **Full API Documentation**: `docs/LEGAL_DOCUMENTS_API.md`
- **Quick Start Guide**: `docs/LEGAL_DOCUMENTS_QUICKSTART.md`
- **Mongoose Documentation**: https://mongoosejs.com/
- **Express Validator**: https://express-validator.github.io/

---

## 🎉 Summary

You now have a complete legal documents management system with:

✅ RESTful API endpoints  
✅ Multi-language support  
✅ Version control  
✅ Public and protected routes  
✅ Database persistence  
✅ Input validation  
✅ Seed data  
✅ Complete documentation  

**Need help?** Check the full API documentation in `docs/LEGAL_DOCUMENTS_API.md`

---

**Built with ❤️ for MakersLab**
