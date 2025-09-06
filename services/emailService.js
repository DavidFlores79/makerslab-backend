const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const handlebars = require('handlebars');
const path = require('path');

async function sendOrderConfirmationEmail(orderData, customerToEmail, settingsObject, templateFilenameWithoutExtension) {
  // settingsObject is still used for storeName, storeLogo etc.
  // Mail credentials now come from process.env
  try {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
      console.error('Mail server configuration is incomplete. Please check .env file.');
      throw new Error('Mail server configuration incomplete.');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: (process.env.MAIL_PORT === '465'), // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const templatePath = path.join(__dirname, `../templates/email/${templateFilenameWithoutExtension}.html`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    // APP_BASE_URL is used to construct absolute URLs for relative paths, e.g., for companyLogoUrl.
    // Example: APP_BASE_URL=http://localhost:3000
    const appBaseUrl = process.env.APP_BASE_URL || '';

    // Determine companyLogoUrl, applying APP_BASE_URL if the stored logo is relative
    let companyLogoDisplayUrl = settingsObject.storeLogo || 'https://via.placeholder.com/150?text=Company+Logo';
    if (settingsObject.storeLogo && settingsObject.storeLogo.startsWith('/') && appBaseUrl) {
      companyLogoDisplayUrl = `${appBaseUrl}${settingsObject.storeLogo}`;
    } else if (settingsObject.storeLogo && settingsObject.storeLogo.startsWith('/') && !appBaseUrl) {
      console.warn(`[emailService] APP_BASE_URL is not set. Relative companyLogoUrl "${settingsObject.storeLogo}" may not load in email.`);
    }


    const templateData = {
      companyLogoUrl: companyLogoDisplayUrl,
      orderId: orderData._id,
      customerName: orderData.customer ? orderData.customer.name : 'Valued Customer',
      customerEmail: customerToEmail, // Already passed as a parameter
      shippingAddress: orderData.address ? `${orderData.address.street}, ${orderData.address.city}, ${orderData.address.state} ${orderData.address.zip}, ${orderData.address.country}` : 'N/A',
      deliveryDate: orderData.deliveryDate ? new Date(orderData.deliveryDate).toLocaleDateString() : 'N/A',
      paymentMethod: orderData.payment_method,
      items: orderData.items.map(item => {
        // Product image URL is expected to be absolute as per user feedback.
        // If item.product.image is missing, use a placeholder.
        const productImage = item.product && item.product.image ? item.product.image : 'https://via.placeholder.com/50?text=No+Image';

        return {
          productName: item.product ? item.product.name : 'Product Name N/A',
          productImage: productImage,
          quantity: item.quantity,
          price: item.product && item.product.price ? parseFloat(item.product.price).toFixed(2) : 'N/A',
          subtotal: item.subtotal ? parseFloat(item.subtotal).toFixed(2) : 'N/A',
        };
      }),
      totalAmount: orderData.total ? parseFloat(orderData.total).toFixed(2) : 'N/A',
      orderStatus: orderData.status,
      orderStatusLowerCase: orderData.status ? orderData.status.toLowerCase() : 'pending',
      currentYear: new Date().getFullYear(),
      companyName: settingsObject.storeName || 'Our Store',
      companyAddress: settingsObject.storeAddress || '', // Use empty string as fallback
      footerContactEmail: process.env.MAIL_USERNAME || '',
    };

    const htmlContent = template(templateData);

    // Generate Plain Text Content
    let textContent = `Order Confirmation - Order ID: ${orderData._id}\n\n`;
    textContent += `Dear ${templateData.customerName},\n\n`;
    textContent += `Thank you for your order! Your order ID is: ${orderData._id}.\n\n`;
    textContent += `Customer Email: ${templateData.customerEmail}\n`;
    textContent += `Shipping Address: ${templateData.shippingAddress}\n`;
    textContent += `Expected Delivery Date: ${templateData.deliveryDate}\n`;
    textContent += `Payment Method: ${templateData.paymentMethod}\n`;
    textContent += `Order Status: ${templateData.orderStatus}\n\n`;
    textContent += `Order Details:\n`;
    templateData.items.forEach(item => {
      textContent += `- ${item.productName} (Qty: ${item.quantity}, Price: ${item.price}, Subtotal: ${item.subtotal})\n`;
    });
    textContent += `\nTotal Amount: ${templateData.totalAmount}\n\n`;
    textContent += `Thank you,\n${templateData.companyName}\n`;
    if (templateData.companyAddress) {
      textContent += `${templateData.companyAddress}\n`;
    }
    // Use templateData.footerContactEmail for plain text
    textContent += `Contact us: ${templateData.footerContactEmail}\n`;

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || settingsObject.storeName || 'My Store'}" <${process.env.MAIL_USERNAME}>`,
      to: customerToEmail,
      subject: `Order Confirmation - Your Order ${orderData._id} has been received!`,
      html: htmlContent,
      text: textContent, // Add plain text version
    };

    // Set Reply-To header
    if (settingsObject.storeContactEmail) {
      mailOptions.replyTo = settingsObject.storeContactEmail;
    } else if (process.env.MAIL_USERNAME) {
      // Fallback to MAIL_USERNAME if storeContactEmail is not set in settings
      // This assumes MAIL_USERNAME is a monitored inbox or an address that can accept replies.
      mailOptions.replyTo = process.env.MAIL_USERNAME;
    }


    if (process.env.MAIL_RECIPIENTS) {
      mailOptions.bcc = process.env.MAIL_RECIPIENTS.split(',').map(email => email.trim());
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${customerToEmail}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendNewUserWelcomeEmail,
};

// Helper function to create transporter (to avoid repetition)
// Note: This is defined after the main functions to ensure it's not hoisted incorrectly
// or called before process.env checks in the main functions.
// However, for cleaner code, it might be better at the top or in a separate utility.
// For this exercise, placing it here to keep the diff minimal for the main functions.
function createTransporter() {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
      const errorMessage = 'Mail server configuration is incomplete. Please check .env file.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: (process.env.MAIL_PORT === '465'), // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
}


async function sendOrderStatusUpdateEmail(orderData, customerToEmail, newStatus, settingsObject) {
  try {
    const transporter = createTransporter();
    const templatePath = path.join(__dirname, `../templates/email/orderStatusUpdate.html`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const appBaseUrl = process.env.APP_BASE_URL || '';
    let companyLogoDisplayUrl = settingsObject.storeLogo || 'https://via.placeholder.com/150?text=Company+Logo';
    if (settingsObject.storeLogo && settingsObject.storeLogo.startsWith('/') && appBaseUrl) {
      companyLogoDisplayUrl = `${appBaseUrl}${settingsObject.storeLogo}`;
    } else if (settingsObject.storeLogo && settingsObject.storeLogo.startsWith('/') && !appBaseUrl) {
      console.warn(`[emailService] APP_BASE_URL is not set. Relative companyLogoUrl "${settingsObject.storeLogo}" for Order Status Update may not load.`);
    }

    const templateData = {
      companyLogoUrl: companyLogoDisplayUrl,
      orderId: orderData._id,
      customerName: orderData.customer ? orderData.customer.name : 'Valued Customer',
      newStatus: newStatus,
      newStatusLowerCase: newStatus.toLowerCase(),
      currentYear: new Date().getFullYear(),
      companyName: settingsObject.storeName || 'Our Store',
      companyAddress: settingsObject.storeAddress || '',
      footerContactEmail: process.env.MAIL_USERNAME || '',
    };

    const htmlContent = template(templateData);

    let textContent = `Dear ${templateData.customerName},\n\n`;
    textContent += `The status of your order #${orderData._id} has been updated to: ${newStatus}.\n\n`;
    textContent += `Thank you for your continued support.\n\n`;
    textContent += `Regards,\n${templateData.companyName}\n`;
     if (templateData.companyAddress) {
      textContent += `${templateData.companyAddress}\n`;
    }
    // Use templateData.footerContactEmail for plain text
    textContent += `Contact us: ${templateData.footerContactEmail}\n`;


    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || settingsObject.storeName || 'My Store'}" <${process.env.MAIL_USERNAME}>`,
      to: customerToEmail,
      subject: `Order Status Update - Your Order #${orderData._id} is now ${newStatus}`,
      html: htmlContent,
      text: textContent,
    };

    if (settingsObject.storeContactEmail) {
      mailOptions.replyTo = settingsObject.storeContactEmail;
    } else if (process.env.MAIL_USERNAME) {
      mailOptions.replyTo = process.env.MAIL_USERNAME;
    }

    if (process.env.MAIL_RECIPIENTS) {
      mailOptions.bcc = process.env.MAIL_RECIPIENTS.split(',').map(email => email.trim());
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent successfully to ${customerToEmail} for order ${orderData._id}:`, info.messageId);
    return info;
  } catch (error) {
    console.error(`Error sending order status update email for order ${orderData._id}:`, error);
    throw error; // Re-throw to allow controller to handle
  }
}

async function sendNewUserWelcomeEmail(userData, settingsObject) {
  try {
    const transporter = createTransporter();
    const templatePath = path.join(__dirname, `../templates/email/newUserWelcome.html`);
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const appBaseUrl = process.env.APP_BASE_URL || '';
    let companyLogoDisplayUrl = settingsObject.storeLogo || 'https://via.placeholder.com/150?text=Company+Logo';
    if (settingsObject.storeLogo && settingsObject.storeLogo.startsWith('/') && appBaseUrl) {
      companyLogoDisplayUrl = `${appBaseUrl}${settingsObject.storeLogo}`;
    } else if (settingsObject.storeLogo && settingsObject.storeLogo.startsWith('/') && !appBaseUrl) {
      console.warn(`[emailService] APP_BASE_URL is not set. Relative companyLogoUrl "${settingsObject.storeLogo}" for Welcome Email may not load.`);
    }

    const templateData = {
      companyLogoUrl: companyLogoDisplayUrl,
      userName: userData.name,
      storeName: settingsObject.storeName || 'Our Store',
      storeUrl: appBaseUrl, // APP_BASE_URL can be used as the general store URL
      currentYear: new Date().getFullYear(),
      companyName: settingsObject.storeName || 'Our Store', // Using storeName as companyName for footer consistency here
      companyAddress: settingsObject.storeAddress || '',
      footerContactEmail: process.env.MAIL_USERNAME || '',
    };

    const htmlContent = template(templateData);

    let textContent = `Hi ${templateData.userName},\n\n`;
    textContent += `Welcome to ${templateData.storeName}! We're thrilled to have you join our community.\n\n`;
    if (templateData.storeUrl) {
      textContent += `Start exploring now: ${templateData.storeUrl}\n\n`;
    }
    textContent += `Happy shopping!\n\n`;
    textContent += `Best regards,\nThe ${templateData.storeName} Team\n`;
     if (templateData.companyAddress) {
      textContent += `${templateData.companyAddress}\n`;
    }
    // Use templateData.footerContactEmail for plain text
    textContent += `Contact us: ${templateData.footerContactEmail}\n`;

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || settingsObject.storeName || 'My Store'}" <${process.env.MAIL_USERNAME}>`,
      to: userData.email,
      subject: `Welcome to ${templateData.storeName}!`,
      html: htmlContent,
      text: textContent,
    };

    if (settingsObject.storeContactEmail) {
      mailOptions.replyTo = settingsObject.storeContactEmail;
    } else if (process.env.MAIL_USERNAME) {
      mailOptions.replyTo = process.env.MAIL_USERNAME;
    }

    if (process.env.MAIL_RECIPIENTS) {
      mailOptions.bcc = process.env.MAIL_RECIPIENTS.split(',').map(email => email.trim());
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${userData.email}:`, info.messageId);
    return info;
  } catch (error) {
    console.error(`Error sending new user welcome email to ${userData.email}:`, error);
    throw error; // Re-throw to allow controller to handle
  }
}
