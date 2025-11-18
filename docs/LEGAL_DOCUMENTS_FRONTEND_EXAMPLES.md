# Legal Documents - Frontend Examples

## 📱 React/Next.js Components

### 1. Terms and Conditions Page

```jsx
// pages/terms.js or app/terms/page.js (Next.js)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TermsAndConditions() {
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    fetchTerms(language);
  }, [language]);

  const fetchTerms = async (lang) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/legal/active?type=terms_and_conditions&language=${lang}`
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setDocument(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Document not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Language Selector */}
      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 rounded ${
            language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('es')}
          className={`px-4 py-2 rounded ${
            language === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Español
        </button>
      </div>

      {/* Document Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{document.title}</h1>
        <div className="flex gap-4 text-gray-600">
          <span>Version: {document.version}</span>
          <span>•</span>
          <span>
            Effective: {new Date(document.effectiveDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Document Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: document.content }}
      />

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
```

---

### 2. Privacy Policy Page

```jsx
// pages/privacy.js or app/privacy/page.js (Next.js)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PrivacyPolicy() {
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    fetchPrivacy(language);
  }, [language]);

  const fetchPrivacy = async (lang) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/legal/active?type=privacy_policy&language=${lang}`
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setDocument(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Document not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Language Selector */}
      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 rounded ${
            language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('es')}
          className={`px-4 py-2 rounded ${
            language === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Español
        </button>
      </div>

      {/* Document Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{document.title}</h1>
        <div className="flex gap-4 text-gray-600">
          <span>Version: {document.version}</span>
          <span>•</span>
          <span>
            Effective: {new Date(document.effectiveDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Document Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: document.content }}
      />

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
```

---

### 3. Reusable Legal Document Component

```jsx
// components/LegalDocument.jsx
import { useState, useEffect } from 'react';

export default function LegalDocument({ type, language = 'en', showLanguageSelector = true }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(language);

  useEffect(() => {
    fetchDocument(currentLang);
  }, [currentLang, type]);

  const fetchDocument = async (lang) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/legal/active?type=${type}&language=${lang}`
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setDocument(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-8">
        <p className="text-red-600">Document not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {showLanguageSelector && (
        <div className="mb-6 flex justify-end gap-2">
          <button
            onClick={() => setCurrentLang('en')}
            className={`px-4 py-2 rounded ${
              currentLang === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setCurrentLang('es')}
            className={`px-4 py-2 rounded ${
              currentLang === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Español
          </button>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{document.title}</h1>
        <div className="flex gap-4 text-gray-600">
          <span>Version: {document.version}</span>
          <span>•</span>
          <span>
            Effective: {new Date(document.effectiveDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: document.content }}
      />
    </div>
  );
}

// Usage:
// <LegalDocument type="terms_and_conditions" language="en" />
// <LegalDocument type="privacy_policy" language="es" />
```

---

### 4. Footer Component with Legal Links

```jsx
// components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">MakersLab</h3>
            <p className="text-gray-400">
              Building the future, one project at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MakersLab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

---

### 5. Registration Modal with Terms Acceptance

```jsx
// components/RegisterModal.jsx
import { useState } from 'react';

export default function RegisterModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    acceptTerms: false,
  });
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    // Submit registration...
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1 mr-2"
                required
              />
              <span className="text-sm text-gray-700">
                I accept the{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-500 hover:underline"
                >
                  Terms and Conditions
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="text-blue-500 hover:underline"
                >
                  Privacy Policy
                </button>
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Register
            </button>
          </div>
        </form>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <LegalDocumentModal
          type="terms_and_conditions"
          onClose={() => setShowTerms(false)}
        />
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <LegalDocumentModal
          type="privacy_policy"
          onClose={() => setShowPrivacy(false)}
        />
      )}
    </div>
  );
}

// Modal to display legal documents
function LegalDocumentModal({ type, onClose }) {
  const [document, setDocument] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/legal/active?type=${type}&language=en`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setDocument(data.data[0]);
        }
      });
  }, [type]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        {document ? (
          <>
            <h2 className="text-2xl font-bold mb-4">{document.title}</h2>
            <div 
              className="prose"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
          </>
        ) : (
          <p>Loading...</p>
        )}
        
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

---

### 6. Custom Hook for Legal Documents

```jsx
// hooks/useLegalDocument.js
import { useState, useEffect } from 'react';

export function useLegalDocument(type, language = 'en') {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [type, language]);

  const fetchDocument = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/legal/active?type=${type}&language=${language}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setDocument(data.data[0]);
      } else {
        setError('Document not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { document, loading, error, refetch: fetchDocument };
}

// Usage:
// const { document, loading, error } = useLegalDocument('terms_and_conditions', 'en');
```

---

## 🎨 Styling Examples

### Tailwind CSS
Already shown in examples above.

### CSS Modules

```css
/* styles/LegalDocument.module.css */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.meta {
  color: #666;
  font-size: 0.9rem;
}

.content {
  line-height: 1.8;
  font-size: 1.1rem;
}

.content h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.content p {
  margin-bottom: 1rem;
}
```

---

These examples provide complete, production-ready components for integrating legal documents into your frontend application!
