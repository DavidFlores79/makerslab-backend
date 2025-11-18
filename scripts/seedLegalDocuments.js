/**
 * Seed Script for Legal Documents
 * 
 * This script creates initial legal documents (Terms and Conditions & Privacy Policy)
 * in both English and Spanish.
 * 
 * Usage:
 *   node scripts/seedLegalDocuments.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LegalDocument = require('../models/legal_document.model');

const legalDocuments = [
    // Terms and Conditions - English
    {
        type: 'terms_and_conditions',
        language: 'en',
        title: 'Terms and Conditions',
        content: `
# Terms and Conditions

**Effective Date:** January 1, 2025

## 1. Introduction
Welcome to MakersLab. These Terms and Conditions govern your use of our services. By accessing or using our platform, you agree to be bound by these terms.

## 2. User Responsibilities
- You must provide accurate information when creating an account
- You are responsible for maintaining the security of your account
- You must not use the service for any illegal purposes
- You must not violate any laws in your jurisdiction

## 3. Service Usage
- Our services are provided "as is" without warranties
- We reserve the right to modify or discontinue services at any time
- You may not share your account credentials with others
- You must comply with all applicable laws and regulations

## 4. Payment Terms
- All fees are stated in USD unless otherwise specified
- Payments are non-refundable unless otherwise stated
- We reserve the right to change pricing with notice
- Failure to pay may result in service suspension

## 5. Intellectual Property
- All content and materials are owned by MakersLab or its licensors
- You may not reproduce, distribute, or create derivative works
- Your user content remains your property
- You grant us a license to use your content for service operation

## 6. Limitation of Liability
- We are not liable for indirect, incidental, or consequential damages
- Our liability is limited to the amount you paid in the last 12 months
- Some jurisdictions do not allow liability limitations

## 7. Termination
- We may terminate or suspend your account at any time
- You may terminate your account by contacting us
- Upon termination, you lose access to all services and data

## 8. Changes to Terms
- We may update these terms at any time
- We will notify you of significant changes
- Continued use constitutes acceptance of new terms

## 9. Contact Information
For questions about these terms, please contact us at support@makerslab.com

## 10. Governing Law
These terms are governed by the laws of [Your Jurisdiction].
        `,
        version: '1.0',
        isActive: true,
        effectiveDate: new Date('2025-01-01')
    },

    // Terms and Conditions - Spanish
    {
        type: 'terms_and_conditions',
        language: 'es',
        title: 'Términos y Condiciones',
        content: `
# Términos y Condiciones

**Fecha de Vigencia:** 1 de enero de 2025

## 1. Introducción
Bienvenido a MakersLab. Estos Términos y Condiciones rigen el uso de nuestros servicios. Al acceder o utilizar nuestra plataforma, usted acepta estar sujeto a estos términos.

## 2. Responsabilidades del Usuario
- Debe proporcionar información precisa al crear una cuenta
- Es responsable de mantener la seguridad de su cuenta
- No debe utilizar el servicio para fines ilegales
- No debe violar ninguna ley en su jurisdicción

## 3. Uso del Servicio
- Nuestros servicios se proporcionan "tal cual" sin garantías
- Nos reservamos el derecho de modificar o descontinuar servicios en cualquier momento
- No puede compartir las credenciales de su cuenta con otros
- Debe cumplir con todas las leyes y regulaciones aplicables

## 4. Términos de Pago
- Todas las tarifas se indican en USD a menos que se especifique lo contrario
- Los pagos no son reembolsables a menos que se indique lo contrario
- Nos reservamos el derecho de cambiar los precios con previo aviso
- La falta de pago puede resultar en la suspensión del servicio

## 5. Propiedad Intelectual
- Todo el contenido y materiales son propiedad de MakersLab o sus licenciantes
- No puede reproducir, distribuir o crear obras derivadas
- Su contenido de usuario sigue siendo de su propiedad
- Nos otorga una licencia para usar su contenido para la operación del servicio

## 6. Limitación de Responsabilidad
- No somos responsables de daños indirectos, incidentales o consecuentes
- Nuestra responsabilidad se limita al monto que pagó en los últimos 12 meses
- Algunas jurisdicciones no permiten limitaciones de responsabilidad

## 7. Terminación
- Podemos terminar o suspender su cuenta en cualquier momento
- Puede terminar su cuenta contactándonos
- Al terminar, pierde el acceso a todos los servicios y datos

## 8. Cambios en los Términos
- Podemos actualizar estos términos en cualquier momento
- Le notificaremos de cambios significativos
- El uso continuo constituye aceptación de los nuevos términos

## 9. Información de Contacto
Para preguntas sobre estos términos, contáctenos en support@makerslab.com

## 10. Ley Aplicable
Estos términos se rigen por las leyes de [Su Jurisdicción].
        `,
        version: '1.0',
        isActive: true,
        effectiveDate: new Date('2025-01-01')
    },

    // Privacy Policy - English
    {
        type: 'privacy_policy',
        language: 'en',
        title: 'Privacy Policy',
        content: `
# Privacy Policy

**Effective Date:** January 1, 2025

## 1. Introduction
At MakersLab, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.

## 2. Information We Collect

### Personal Information
- Name and contact information
- Email address
- Payment information
- Account credentials

### Usage Information
- IP address and device information
- Browser type and version
- Pages visited and time spent
- Referral source

### Cookies and Tracking
- We use cookies to enhance user experience
- You can disable cookies in your browser settings
- Some features may not work without cookies

## 3. How We Use Your Information
- To provide and maintain our services
- To process payments and transactions
- To send important notifications
- To improve our services
- To prevent fraud and abuse
- To comply with legal obligations

## 4. Information Sharing
We do not sell your personal information. We may share information with:
- Service providers who assist in operations
- Law enforcement when required by law
- Business partners with your consent
- In connection with business transfers

## 5. Data Security
- We implement industry-standard security measures
- Data is encrypted in transit and at rest
- Regular security audits are conducted
- However, no method is 100% secure

## 6. Your Rights
You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your data
- Object to processing
- Data portability
- Withdraw consent

## 7. Data Retention
- We retain your data as long as your account is active
- We may retain some data for legal obligations
- You can request deletion at any time

## 8. Children's Privacy
- Our services are not intended for children under 13
- We do not knowingly collect data from children
- Parents can contact us to request deletion

## 9. International Transfers
- Your data may be transferred internationally
- We ensure adequate safeguards are in place
- By using our services, you consent to transfers

## 10. Changes to Privacy Policy
- We may update this policy periodically
- We will notify you of significant changes
- Continued use constitutes acceptance

## 11. Contact Us
For privacy concerns, contact us at:
- Email: privacy@makerslab.com
- Address: [Your Address]

## 12. GDPR Compliance
For EU users, we comply with GDPR requirements including:
- Lawful basis for processing
- Data protection officer contact
- Right to lodge a complaint with supervisory authority
        `,
        version: '1.0',
        isActive: true,
        effectiveDate: new Date('2025-01-01')
    },

    // Privacy Policy - Spanish
    {
        type: 'privacy_policy',
        language: 'es',
        title: 'Política de Privacidad',
        content: `
# Política de Privacidad

**Fecha de Vigencia:** 1 de enero de 2025

## 1. Introducción
En MakersLab, tomamos su privacidad en serio. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información.

## 2. Información que Recopilamos

### Información Personal
- Nombre e información de contacto
- Dirección de correo electrónico
- Información de pago
- Credenciales de cuenta

### Información de Uso
- Dirección IP e información del dispositivo
- Tipo y versión del navegador
- Páginas visitadas y tiempo invertido
- Fuente de referencia

### Cookies y Seguimiento
- Utilizamos cookies para mejorar la experiencia del usuario
- Puede desactivar las cookies en la configuración de su navegador
- Algunas funciones pueden no funcionar sin cookies

## 3. Cómo Usamos Su Información
- Para proporcionar y mantener nuestros servicios
- Para procesar pagos y transacciones
- Para enviar notificaciones importantes
- Para mejorar nuestros servicios
- Para prevenir fraude y abuso
- Para cumplir con obligaciones legales

## 4. Compartir Información
No vendemos su información personal. Podemos compartir información con:
- Proveedores de servicios que ayudan en las operaciones
- Autoridades legales cuando lo requiera la ley
- Socios comerciales con su consentimiento
- En relación con transferencias comerciales

## 5. Seguridad de Datos
- Implementamos medidas de seguridad estándar de la industria
- Los datos están encriptados en tránsito y en reposo
- Se realizan auditorías de seguridad regulares
- Sin embargo, ningún método es 100% seguro

## 6. Sus Derechos
Tiene derecho a:
- Acceder a su información personal
- Corregir información inexacta
- Solicitar la eliminación de sus datos
- Oponerse al procesamiento
- Portabilidad de datos
- Retirar el consentimiento

## 7. Retención de Datos
- Conservamos sus datos mientras su cuenta esté activa
- Podemos conservar algunos datos por obligaciones legales
- Puede solicitar la eliminación en cualquier momento

## 8. Privacidad de Niños
- Nuestros servicios no están destinados a niños menores de 13 años
- No recopilamos datos de niños a sabiendas
- Los padres pueden contactarnos para solicitar la eliminación

## 9. Transferencias Internacionales
- Sus datos pueden transferirse internacionalmente
- Aseguramos que existan salvaguardas adecuadas
- Al usar nuestros servicios, consiente las transferencias

## 10. Cambios en la Política de Privacidad
- Podemos actualizar esta política periódicamente
- Le notificaremos de cambios significativos
- El uso continuo constituye aceptación

## 11. Contáctenos
Para inquietudes de privacidad, contáctenos en:
- Correo electrónico: privacy@makerslab.com
- Dirección: [Su Dirección]

## 12. Cumplimiento del RGPD
Para usuarios de la UE, cumplimos con los requisitos del RGPD incluyendo:
- Base legal para el procesamiento
- Contacto del oficial de protección de datos
- Derecho a presentar una queja ante la autoridad supervisora
        `,
        version: '1.0',
        isActive: true,
        effectiveDate: new Date('2025-01-01')
    }
];

const seedLegalDocuments = async () => {
    try {
        // Connect to MongoDB
        const DB_URI = process.env.MONGODB;
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing documents (optional - comment out if you want to keep existing data)
        // await LegalDocument.deleteMany({});
        // console.log('🗑️  Cleared existing legal documents');

        // Insert new documents
        const created = await LegalDocument.insertMany(legalDocuments);
        console.log(`✅ Successfully created ${created.length} legal documents:`);
        
        created.forEach(doc => {
            console.log(`   - ${doc.title} (${doc.language.toUpperCase()}) - ${doc.type}`);
        });

        console.log('\n✨ Seed completed successfully!');
        
        // Disconnect
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding legal documents:', error);
        process.exit(1);
    }
};

// Run the seed
seedLegalDocuments();
