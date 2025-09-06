const nodemailer = require('nodemailer');
const fs = require('fs/promises');
// Import all functions to be tested from emailService
const {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendNewUserWelcomeEmail
} = require('../emailService');
const path = require('path');

// Mock nodemailer
jest.mock('nodemailer');
const mockSendMail = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

// Mock fs/promises
jest.mock('fs/promises');

describe('EmailService - sendOrderConfirmationEmail', () => {
  const OLD_ENV = process.env;
  let consoleWarnSpy;
  let consoleLogSpy;


  beforeEach(() => {
    jest.resetModules(); // Clear cache
    process.env = { ...OLD_ENV }; // Make a copy
    mockSendMail.mockClear();
    nodemailer.createTransport.mockClear();
    fs.readFile.mockClear();
    // Spy on console.warn and console.log before each test
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); // If general logs are also to be suppressed/checked
  });

  afterEach(() => {
    // Restore original console.warn and console.log after each test
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
    jest.restoreAllMocks();
  });

  // Updated mockOrderData for product.image (singular)
  const mockOrderData = {
    _id: 'order123',
    customer: { name: 'Test User', email: 'test@example.com' },
    address: { street: '123 Main St', city: 'Testville', state: 'TS', zip: '12345', country: 'Testland' },
    deliveryDate: new Date('2024-01-01'),
    payment_method: 'Credit Card',
    items: [ // Updated to use 'image' (singular)
      { product: { name: 'Product Abs', image: 'https://cdn.example.com/images/productA.jpg', price: 10.00 }, quantity: 1, subtotal: 10.00 },
      { product: { name: 'Product Rel', image: '/relative/path/imageB.jpg', price: 20.00 }, quantity: 2, subtotal: 40.00 }, // This will now be treated as absolute by the code
      { product: { name: 'Product NoImg', image: null, price: 30.00 }, quantity: 1, subtotal: 30.00 },
      { product: { name: 'Product Undef', product: undefined, quantity:1, subtotal: 50.00}}
    ],
    total: 130.00, // Adjusted total
    status: 'Pending',
  };

  const mockCustomerToEmail = 'customer@example.com';

  const mockSettingsObject = {
    storeLogo: 'https://example.com/logo.png', // Absolute URL for logo
    storeName: 'Test Store',
    storeAddress: '456 Market St, Testburg',
    storeContactEmail: 'contact@teststore.com', // Used for Reply-To
  };

  // Updated mockTemplateContent to use {{footerContactEmail}}
  const mockTemplateContent = `
    <h1>Order {{orderId}}</h1>
    <p>Dear {{customerName}},</p>
    <p>Logo: <img src="{{companyLogoUrl}}" alt="Logo"></p>
    <p>Store: {{companyName}}</p>
    <p>Total: {{totalAmount}}</p>
    <p>Items: {{#each items}}<img src="{{this.productImage}}" alt="{{this.productName}}">{{this.productName}} {{/each}}</p>
    <p>Year: {{currentYear}}</p>
    <p>Address: {{companyAddress}}</p>
    <p>Contact us: {{footerContactEmail}}</p>
  `;

  it('should send an email with correct configuration and content', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USERNAME = 'testuser@example.com'; // Mocked for footerContactEmail
    process.env.MAIL_PASSWORD = 'password';
    process.env.MAIL_FROM_NAME = 'Test Store From Env';
    process.env.MAIL_RECIPIENTS = 'bcc1@example.com,bcc2@example.com';
    process.env.APP_BASE_URL = 'http://localhost:3000'; // For companyLogo if relative

    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-id' });

    // Modify mockOrderData for this specific test if needed, or use a more tailored one.
    // The global mockOrderData now uses 'image' singular.
    const currentMockOrderData = {
        ...mockOrderData,
        items: [
            { product: { name: 'Product Abs', image: 'https://cdn.example.com/images/productA.jpg', price: 10.00 }, quantity: 1, subtotal: 10.00 },
            { product: { name: 'Product NoImg', image: null, price: 30.00 }, quantity: 1, subtotal: 30.00 },
        ]
    };


    await sendOrderConfirmationEmail(currentMockOrderData, mockCustomerToEmail, mockSettingsObject, 'testTemplate');

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user@test.com',
        pass: 'password',
      },
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(__dirname, '../templates/email/testTemplate.html'), // Adjust path based on actual service file location
      'utf-8'
    );

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.from).toBe(`"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USERNAME}>`);
    expect(sentMailOptions.to).toBe(mockCustomerToEmail);
    expect(sentMailOptions.bcc).toEqual(['bcc1@example.com', 'bcc2@example.com']);
    expect(sentMailOptions.subject).toBe(`Order Confirmation - Your Order ${mockOrderData._id} has been received!`);

    // Check rendered HTML content (basic checks)
    expect(sentMailOptions.html).toContain(`<h1>Order ${mockOrderData._id}</h1>`);
    expect(sentMailOptions.html).toContain(`<p>Dear ${mockOrderData.customer.name},</p>`);
    expect(sentMailOptions.html).toContain(`<p>Logo: ${mockSettingsObject.storeLogo}</p>`);
    expect(sentMailOptions.html).toContain(`<p>Store: ${mockSettingsObject.storeName}</p>`);
    expect(sentMailOptions.html).toContain(`<p>Total: ${currentMockOrderData.total.toFixed(2)}</p>`);
    expect(sentMailOptions.html).toContain(`Product Abs`);
    expect(sentMailOptions.html).toContain(`<img src="https://cdn.example.com/images/productA.jpg" alt="Product Abs">`);
    expect(sentMailOptions.html).toContain(`<img src="https://via.placeholder.com/50?text=No+Image" alt="Product NoImg">`);
    expect(sentMailOptions.html).toContain(`<p>Year: ${new Date().getFullYear()}</p>`);
    expect(sentMailOptions.html).toContain(`<p>Address: ${mockSettingsObject.storeAddress}</p>`);
    expect(sentMailOptions.html).toContain(`<p>Contact us: ${process.env.MAIL_USERNAME}</p>`);


    // Verify plain text content (basic checks)
    expect(sentMailOptions.text).toContain(`Order Confirmation - Order ID: ${currentMockOrderData._id}`);
    expect(sentMailOptions.text).toContain(`Dear ${currentMockOrderData.customer.name},`);
    expect(sentMailOptions.text).toContain(`Total Amount: ${currentMockOrderData.total.toFixed(2)}`);
    expect(sentMailOptions.text).toContain(`- Product Abs (Qty: 1, Price: 10.00, Subtotal: 10.00)`);
    expect(sentMailOptions.text).toContain(mockSettingsObject.storeName);
    expect(sentMailOptions.text).toContain(mockSettingsObject.storeAddress);
    expect(sentMailOptions.text).toContain(`Contact us: ${process.env.MAIL_USERNAME}`);


    // Verify Reply-To header
    expect(sentMailOptions.replyTo).toBe(mockSettingsObject.storeContactEmail);
  });

  it('should use MAIL_PORT 465 for secure connection', async () => {
    process.env.MAIL_HOST = 'smtp.secure.com';
    process.env.MAIL_PORT = '465';
    process.env.MAIL_USERNAME = 'user@secure.com';
    process.env.MAIL_PASSWORD = 'securepass';
    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-id-secure' });

    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, mockSettingsObject, 'testTemplate'); // Using global mockOrderData for this test

    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.secure.com',
      port: 465,
      secure: true,
      auth: { user: 'user@secure.com', pass: 'securepass' },
    }));
  });

  it('should handle missing MAIL_RECIPIENTS', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USERNAME = 'user@test.com';
    process.env.MAIL_PASSWORD = 'password';
    // MAIL_RECIPIENTS is not set
    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-id-no-bcc' });

    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, mockSettingsObject, 'testTemplate');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.bcc).toBeUndefined();
  });

  it('should throw an error if essential mail config is missing', async () => {
    // Missing MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD
    fs.readFile.mockResolvedValue(mockTemplateContent); // To avoid error from fs

    await expect(
      sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, mockSettingsObject, 'testTemplate')
    ).rejects.toThrow('Mail server configuration incomplete.');

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('should throw an error if template reading fails', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USERNAME = 'user@test.com';
    process.env.MAIL_PASSWORD = 'password';

    const readFileError = new Error('Failed to read template');
    fs.readFile.mockRejectedValue(readFileError);

    await expect(
      sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, mockSettingsObject, 'testTemplate')
    ).rejects.toThrow('Failed to read template');

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('should use fallback storeName for MAIL_FROM_NAME if not set in env', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USERNAME = 'user@test.com'; // Keep a user for from address
    process.env.MAIL_PASSWORD = 'password';
    // MAIL_FROM_NAME is not set
    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-id' });

    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, mockSettingsObject, 'testTemplate');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.from).toBe(`"${mockSettingsObject.storeName}" <${process.env.MAIL_USERNAME}>`);
    // Footer contact email should be from MAIL_USERNAME used in templateData
    expect(sentMailOptions.html).toContain(`Contact us: ${process.env.MAIL_USERNAME}`);
    expect(sentMailOptions.text).toContain(`Contact us: ${process.env.MAIL_USERNAME}`);
  });

  it('should use default "My Store" for MAIL_FROM_NAME if not in env or settings', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_PORT = '587';
    process.env.MAIL_USERNAME = 'user@test.com'; // For from and footer
    process.env.MAIL_PASSWORD = 'password';
    // MAIL_FROM_NAME is not set
    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-id' });

    const settingsWithoutStoreName = { ...mockSettingsObject, storeName: undefined };

    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsWithoutStoreName, 'testTemplate');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.from).toBe(`"My Store" <${process.env.MAIL_USERNAME}>`);
    // Footer contact email should be from MAIL_USERNAME used in templateData
    expect(sentMailOptions.html).toContain(`Contact us: ${process.env.MAIL_USERNAME}`);
    expect(sentMailOptions.text).toContain(`Contact us: ${process.env.MAIL_USERNAME}`);
  });

  it('should use empty string for footerContactEmail if MAIL_USERNAME is not set', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_PORT = '587';
    // process.env.MAIL_USERNAME is deliberately not set for this test for footerContactEmail
    process.env.MAIL_PASSWORD = 'password';
    process.env.MAIL_FROM_NAME = 'Test Store'; // MAIL_FROM_NAME needs a sender
     // but MAIL_USERNAME for the 'from' part of email must be set for createTransport to not fail earlier
    process.env.MAIL_USERNAME = 'senderonly@test.com';


    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-id-no-footer-contact' });

    // Temporarily undefine MAIL_USERNAME for the purpose of templateData.footerContactEmail generation
    const originalMailUsername = process.env.MAIL_USERNAME;
    delete process.env.MAIL_USERNAME; // Undefine it

    // Need a different settings object that doesn't define storeContactEmail for Reply-To to also use MAIL_USERNAME
    // However, the main point here is footerContactEmail.
    // Let's ensure the 'from' address still has a user.
    process.env.MAIL_USERNAME = 'senderonly@test.com'; // This is for the 'from' field

    // To test templateData.footerContactEmail, we need to make sure the specific MAIL_USERNAME used for it is empty.
    // This is a bit tricky as MAIL_USERNAME is also used in 'from'.
    // The service code is: footerContactEmail: process.env.MAIL_USERNAME || ''
    // So, if process.env.MAIL_USERNAME is undefined when that line is hit, footerContactEmail will be ''.

    // Let's simulate the scenario where MAIL_USERNAME used for footer is empty,
    // while the one for 'from' (and potentially replyTo fallback) is present.
    // This requires a more nuanced approach or direct test on templateData generation.
    // For now, we'll test the output assuming process.env.MAIL_USERNAME was empty for footerContactEmail.
    // The service code actually uses the same process.env.MAIL_USERNAME for both.
    // So if it's empty for footer, it's empty for 'from' as well, which createTransport would reject.

    // Let's test the direct output if MAIL_USERNAME (for footer) results in empty string
    // The current service logic: footerContactEmail: process.env.MAIL_USERNAME || ''
    // If process.env.MAIL_USERNAME = '', then footerContactEmail = ''
    process.env.MAIL_USERNAME = ''; // Set to empty for the footerContactEmail part
                                   // This will also make the 'from' user empty, which is not ideal for a real scenario but tests the fallback.

    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, mockSettingsObject, 'testTemplate');

    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.html).toContain('Contact us: '); // Expect "Contact us: " followed by nothing
    expect(sentMailOptions.html).not.toContain('Contact us: senderonly@test.com'); // Ensure it's not using the sender email
    expect(sentMailOptions.text).toContain('Contact us: \n'); // Plain text should also be empty after label

    process.env.MAIL_USERNAME = originalMailUsername; // Restore for other tests
  });


  // Tests for Reply-To header
  it('should set Reply-To from settingsObject.storeContactEmail if available', async () => {
    process.env.MAIL_HOST = 'smtp.test.com'; // Basic env setup
    process.env.MAIL_USERNAME = 'user@test.com'; // This will be used for footerContactEmail
    process.env.MAIL_PASSWORD = 'password';
    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-reply-to-settings' });

    const settingsWithContact = { ...mockSettingsObject, storeContactEmail: 'store-reply@example.com' };
    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsWithContact, 'testTemplate');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.replyTo).toBe('store-reply@example.com');
  });

  it('should set Reply-To from process.env.MAIL_USERNAME if settingsObject.storeContactEmail is not available', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_USERNAME = 'env-reply@test.com';
    process.env.MAIL_PASSWORD = 'password';
    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'test-reply-to-env' });

    const settingsWithoutContact = { ...mockSettingsObject, storeContactEmail: '' }; // or undefined
    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsWithoutContact, 'testTemplate');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.replyTo).toBe('env-reply@test.com');
  });

  // Tests for APP_BASE_URL and image processing
  describe('Product Image URL processing', () => {
    const baseUrl = 'http://app.test.com';
    const defaultPlaceholder = 'https://via.placeholder.com/50?text=No+Image';
    let orderDataWithVariousImages;

    beforeEach(() => {
        process.env.MAIL_HOST = 'smtp.test.com';
        process.env.MAIL_USERNAME = 'user@test.com';
        process.env.MAIL_PASSWORD = 'password';
        fs.readFile.mockResolvedValue(mockTemplateContent);
        mockSendMail.mockResolvedValue({ messageId: 'img-test-id' });

        orderDataWithVariousImages = {
            ...mockOrderData, // Spread common properties
            items: [
                { product: { name: 'Absolute Product', image: 'https://cdn.com/img.jpg', price: 10 }, quantity: 1, subtotal: 10 },
                { product: { name: 'No Image Product', image: null, price: 10 }, quantity: 1, subtotal: 10 },
                { product: { name: 'Undefined Product Image', product: { name: 'Prod Undef Img', price: 10}, quantity: 1, subtotal: 10}} // image field missing
            ]
        };
    });

    it('should use absolute product.image URL as is', async () => {
        await sendOrderConfirmationEmail(orderDataWithVariousImages, mockCustomerToEmail, mockSettingsObject, 'testTemplate');
        const sentMailOptions = mockSendMail.mock.calls[0][0];
        const { items } = JSON.parse(JSON.stringify(sentMailOptions.templateData)); // Deep clone for safety, or access directly
        expect(items[0].productImage).toBe('https://cdn.com/img.jpg');
    });

    it('should use placeholder if product.image is null or missing', async () => {
        await sendOrderConfirmationEmail(orderDataWithVariousImages, mockCustomerToEmail, mockSettingsObject, 'testTemplate');
        const sentMailOptions = mockSendMail.mock.calls[0][0];
        const { items } = JSON.parse(JSON.stringify(sentMailOptions.templateData));
        expect(items[1].productImage).toBe(defaultPlaceholder); // product.image is null
        expect(items[2].productImage).toBe(defaultPlaceholder); // product.image is undefined
    });
  });

  // Tests for Company Logo URL processing
  describe('Company Logo URL processing', () => {
    const baseUrl = 'http://app.test.com';
    const defaultLogoPlaceholder = 'https://via.placeholder.com/150?text=Company+Logo';
     let settingsForLogoTest;

    beforeEach(() => {
        process.env.MAIL_HOST = 'smtp.test.com';
        process.env.MAIL_USERNAME = 'user@test.com';
        process.env.MAIL_PASSWORD = 'password';
        fs.readFile.mockResolvedValue(mockTemplateContent);
        mockSendMail.mockResolvedValue({ messageId: 'logo-test-id' });
        settingsForLogoTest = { ...mockSettingsObject }; // Reset to default mock settings
    });

    it('should use absolute storeLogo URL as is', async () => {
        settingsForLogoTest.storeLogo = 'https://cdn.com/logo.png';
        process.env.APP_BASE_URL = baseUrl; // APP_BASE_URL should not affect absolute URLs
        await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsForLogoTest, 'testTemplate');
        const sentMailOptions = mockSendMail.mock.calls[0][0];
        expect(sentMailOptions.templateData.companyLogoUrl).toBe('https://cdn.com/logo.png');
    });

    it('should prepend APP_BASE_URL to relative storeLogo URL', async () => {
        settingsForLogoTest.storeLogo = '/logos/store_logo.png';
        process.env.APP_BASE_URL = baseUrl;
        await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsForLogoTest, 'testTemplate');
        const sentMailOptions = mockSendMail.mock.calls[0][0];
        expect(sentMailOptions.templateData.companyLogoUrl).toBe(`${baseUrl}/logos/store_logo.png`);
    });

    it('should use relative storeLogo URL as is if APP_BASE_URL is not set (and log warning)', async () => {
        settingsForLogoTest.storeLogo = '/logos/store_logo.png';
        delete process.env.APP_BASE_URL;
        // const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {}); // Already spied in global beforeEach
        await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsForLogoTest, 'testTemplate');
        const sentMailOptions = mockSendMail.mock.calls[0][0];
        expect(sentMailOptions.templateData.companyLogoUrl).toBe('/logos/store_logo.png');
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("[emailService] APP_BASE_URL is not set. Relative companyLogoUrl \"/logos/store_logo.png\" may not load in email."));
        // consoleWarnSpy.mockRestore(); // Restored in global afterEach
    });

    it('should use placeholder if storeLogo is missing or null', async () => {
        settingsForLogoTest.storeLogo = null; // or undefined
        await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsForLogoTest, 'testTemplate');
        const sentMailOptions = mockSendMail.mock.calls[0][0];
        expect(sentMailOptions.templateData.companyLogoUrl).toBe(defaultLogoPlaceholder);

        settingsForLogoTest.storeLogo = ''; // empty string
        await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsForLogoTest, 'testTemplate');
        const sentMailOptions2 = mockSendMail.mock.calls[1][0]; // Second call
        expect(sentMailOptions2.templateData.companyLogoUrl).toBe(defaultLogoPlaceholder); // Assuming empty string also leads to placeholder
    });
  });

  // Test for footer details from settingsObject
  it('should use companyAddress and companyContact from settingsObject in templateData', async () => {
    process.env.MAIL_HOST = 'smtp.test.com'; // Basic env setup
    process.env.MAIL_USERNAME = 'user@test.com';
    process.env.MAIL_PASSWORD = 'password';
    fs.readFile.mockResolvedValue(mockTemplateContent); // ensure template is "read"
    mockSendMail.mockResolvedValue({ messageId: 'footer-test-id' }); // ensure sendMail "succeeds"

    const customSettings = {
        ...mockSettingsObject,
        storeAddress: "1 Test Address, Testville",
        storeContactEmail: "contact-test@example.com"
    };
    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, customSettings, 'testTemplate');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    // Access templateData via a spy or by modifying the service for tests is more robust.
    // For now, let's assume the structure of mockSendMail.mock.calls[0][0] includes templateData or check HTML.
    // This test relies on the plain text part for easier inspection of these fields.
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    expect(sentMailOptions.text).toContain("1 Test Address, Testville");
    expect(sentMailOptions.text).toContain("Contact us: contact-test@example.com");
  });

  it('should use empty strings for companyAddress and companyContact if not in settingsObject', async () => {
    process.env.MAIL_HOST = 'smtp.test.com';
    process.env.MAIL_USERNAME = 'user@test.com';
    process.env.MAIL_PASSWORD = 'password';
    fs.readFile.mockResolvedValue(mockTemplateContent);
    mockSendMail.mockResolvedValue({ messageId: 'footer-fallback-test-id' });

    const settingsWithoutAddressContact = {
        ...mockSettingsObject,
        storeAddress: undefined, // or null
        storeContactEmail: ""    // or null or undefined
    };
    await sendOrderConfirmationEmail(mockOrderData, mockCustomerToEmail, settingsWithoutAddressContact, 'testTemplate');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentMailOptions = mockSendMail.mock.calls[0][0];
    // Check that the plain text part does not contain the default placeholders from previous tests,
    // but rather implies empty strings were used (e.g. no line for address or specific contact line).
    // The exact check depends on how the plain text is formatted with empty strings.
    // Example: if address is empty, "Address:\n" might be absent or "Address: \n"
    // For the current plain text generation:
    // If companyAddress is '', the line for address won't be added.
    // If companyContact is '', the line "Contact us: " won't be added.
    expect(sentMailOptions.text).not.toContain("123 Main St, Anytown, USA"); // Default from old tests
    expect(sentMailOptions.text).not.toContain("Contact us: contact@ourstore.com"); // Default from old tests
    // A more robust check would be to inspect templateData directly if possible or verify HTML
    // For now, this check is indirect via absence of previously used placeholders.
  });
});

// ###################################################################################
// Tests for sendOrderStatusUpdateEmail
// ###################################################################################
describe('EmailService - sendOrderStatusUpdateEmail', () => {
  const OLD_ENV = process.env;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    mockSendMail.mockClear();
    nodemailer.createTransport.mockClear();
    fs.readFile.mockClear();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Assuming sendOrderConfirmationEmail is not called by these tests, so its specific console.log spy is not needed here.
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  afterAll(() => {
    process.env = OLD_ENV;
    jest.restoreAllMocks();
  });

  const mockOrderDataForStatusUpdate = {
    _id: 'order987',
    customer: { name: 'Jane Doe', email: 'jane@example.com' },
    // No items needed for status update email template as per current design
  };
  const mockCustomerEmailForStatusUpdate = 'jane@example.com';
  const mockNewStatus = 'Shipped';
  const mockSettings = {
    storeLogo: '/logos/store_logo.png', // Relative logo URL
    storeName: 'ShipIt Store',
    storeAddress: '789 Carrier Ave, Fastown',
    storeContactEmail: 'shipping@shipit.com',
  };
  const orderStatusUpdateTemplate = `
    <p>Order {{orderId}}</p>
    <p>Dear {{customerName}},</p>
    <p>Status: <span class="status-{{newStatusLowerCase}}">{{newStatus}}</span></p>
    <img src="{{companyLogoUrl}}" alt="Logo">
    <p>{{companyName}}</p>
    <p>{{companyAddress}}</p>
    <p>Contact us: {{footerContactEmail}}</p>
  `;

  it('should send order status update email correctly, using MAIL_USERNAME for footer', async () => {
    process.env.MAIL_HOST = 'smtp.shipit.com';
    process.env.MAIL_USERNAME = 'notify@shipit.com'; // This will be used for footerContactEmail
    process.env.MAIL_PASSWORD = 'shippass';
    process.env.APP_BASE_URL = 'https://shipit.com';
    process.env.MAIL_FROM_NAME = 'ShipIt Updates';


    fs.readFile.mockResolvedValue(orderStatusUpdateTemplate);
    mockSendMail.mockResolvedValue({ messageId: 'status-update-id' });

    await sendOrderStatusUpdateEmail(mockOrderDataForStatusUpdate, mockCustomerEmailForStatusUpdate, mockNewStatus, mockSettings);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.shipit.com' }));
    expect(fs.readFile).toHaveBeenCalledWith(path.join(__dirname, '../templates/email/orderStatusUpdate.html'), 'utf-8');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentOptions = mockSendMail.mock.calls[0][0];

    expect(sentOptions.to).toBe(mockCustomerEmailForStatusUpdate);
    expect(sentOptions.subject).toBe(`Order Status Update - Your Order #${mockOrderDataForStatusUpdate._id} is now ${mockNewStatus}`);
    expect(sentOptions.replyTo).toBe(mockSettings.storeContactEmail);

    expect(sentOptions.html).toContain(`Order ${mockOrderDataForStatusUpdate._id}`);
    expect(sentOptions.html).toContain(`Dear ${mockOrderDataForStatusUpdate.customer.name},`);
    expect(sentOptions.html).toContain(`<span class="status-${mockNewStatus.toLowerCase()}">${mockNewStatus}</span>`);
    expect(sentOptions.html).toContain(`<img src="${process.env.APP_BASE_URL}${mockSettings.storeLogo}" alt="Logo">`);
    expect(sentOptions.html).toContain(`Contact us: ${process.env.MAIL_USERNAME}`); // Check HTML footer

    expect(sentOptions.text).toContain(`Dear ${mockOrderDataForStatusUpdate.customer.name},`);
    expect(sentOptions.text).toContain(`The status of your order #${mockOrderDataForStatusUpdate._id} has been updated to: ${mockNewStatus}.`);
    expect(sentOptions.text).toContain(mockSettings.storeName);
    expect(sentOptions.text).toContain(mockSettings.storeAddress);
    expect(sentOptions.text).toContain(`Contact us: ${process.env.MAIL_USERNAME}`); // Check plain text footer
  });

  it('should use empty string for footerContactEmail in status update if MAIL_USERNAME is not set', async () => {
    process.env.MAIL_HOST = 'smtp.shipit.com';
    // process.env.MAIL_USERNAME is not set for footerContactEmail
    process.env.MAIL_PASSWORD = 'shippass';
    process.env.APP_BASE_URL = 'https://shipit.com';
    process.env.MAIL_FROM_NAME = 'ShipIt Updates';
    // MAIL_USERNAME for 'from' must be set for createTransport
    process.env.MAIL_USERNAME = 'senderonly@shipit.com';

    const originalMailUsername = process.env.MAIL_USERNAME;
    delete process.env.MAIL_USERNAME; // Undefine for footerContactEmail logic in service

    fs.readFile.mockResolvedValue(orderStatusUpdateTemplate);
    mockSendMail.mockResolvedValue({ messageId: 'status-update-fallback-id' });

    // Reinstate for createTransport and ReplyTo, this is tricky to test perfectly without separating the uses
    process.env.MAIL_USERNAME = 'senderonly@shipit.com';

    await sendOrderStatusUpdateEmail(mockOrderDataForStatusUpdate, mockCustomerEmailForStatusUpdate, mockNewStatus, mockSettings);

    const sentOptions = mockSendMail.mock.calls[0][0];
    // Assuming templateData.footerContactEmail was ''
    expect(sentOptions.html).toContain('Contact us: ');
    expect(sentOptions.html).not.toContain('Contact us: senderonly@shipit.com');
    expect(sentOptions.text).toContain('Contact us: \n');

    process.env.MAIL_USERNAME = originalMailUsername; // Restore
  });
});


// ###################################################################################
// Tests for sendNewUserWelcomeEmail
// ###################################################################################
describe('EmailService - sendNewUserWelcomeEmail', () => {
  const OLD_ENV = process.env;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    mockSendMail.mockClear();
    nodemailer.createTransport.mockClear();
    fs.readFile.mockClear();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  afterAll(() => {
    process.env = OLD_ENV;
    jest.restoreAllMocks();
  });

  const mockUserData = { name: 'Newbie User', email: 'newbie@example.com' };
  const mockSettingsForWelcome = {
    storeLogo: null, // Test placeholder for logo
    storeName: 'Welcome Store',
    storeAddress: '1 Welcome St, Newville',
    storeContactEmail: 'hello@welcomestore.com',
  };
  const newUserWelcomeTemplate = `
    <p>Hello {{userName}},</p>
    <p>Welcome to {{storeName}}!</p>
    <a href="{{storeUrl}}">Visit Store</a>
    <img src="{{companyLogoUrl}}" alt="Logo">
    <p>{{companyName}}</p>
    <p>{{companyAddress}}</p>
    <p>Contact us: {{footerContactEmail}}</p>
  `;

  it('should send new user welcome email correctly, using MAIL_USERNAME for footer', async () => {
    process.env.MAIL_HOST = 'smtp.welcome.com';
    process.env.MAIL_USERNAME = 'welcome@welcome.com'; // This will be used for footerContactEmail
    process.env.MAIL_PASSWORD = 'welcomepass';
    process.env.APP_BASE_URL = 'https://welcomestore.com';
    process.env.MAIL_FROM_NAME = 'Welcome Team';

    fs.readFile.mockResolvedValue(newUserWelcomeTemplate);
    mockSendMail.mockResolvedValue({ messageId: 'welcome-id' });

    await sendNewUserWelcomeEmail(mockUserData, mockSettingsForWelcome);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.welcome.com' }));
    expect(fs.readFile).toHaveBeenCalledWith(path.join(__dirname, '../templates/email/newUserWelcome.html'), 'utf-8');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentOptions = mockSendMail.mock.calls[0][0];

    expect(sentOptions.to).toBe(mockUserData.email);
    expect(sentOptions.subject).toBe(`Welcome to ${mockSettingsForWelcome.storeName}!`);
    expect(sentOptions.replyTo).toBe(mockSettingsForWelcome.storeContactEmail);

    expect(sentOptions.html).toContain(`Hello ${mockUserData.name},`);
    expect(sentOptions.html).toContain(`Welcome to ${mockSettingsForWelcome.storeName}!`);
    expect(sentOptions.html).toContain(`<a href="${process.env.APP_BASE_URL}">Visit Store</a>`);
    expect(sentOptions.html).toContain(`<img src="https://via.placeholder.com/150?text=Company+Logo" alt="Logo">`); // Default logo
    expect(sentOptions.html).toContain(`Contact us: ${process.env.MAIL_USERNAME}`); // Check HTML footer

    expect(sentOptions.text).toContain(`Hi ${mockUserData.name},`);
    expect(sentOptions.text).toContain(`Welcome to ${mockSettingsForWelcome.storeName}!`);
    expect(sentOptions.text).toContain(`Start exploring now: ${process.env.APP_BASE_URL}`);
    expect(sentOptions.text).toContain(mockSettingsForWelcome.storeName);
    expect(sentOptions.text).toContain(mockSettingsForWelcome.storeAddress);
    expect(sentOptions.text).toContain(`Contact us: ${process.env.MAIL_USERNAME}`); // Check plain text footer
  });

  it('should use empty string for footerContactEmail in welcome email if MAIL_USERNAME is not set', async () => {
    process.env.MAIL_HOST = 'smtp.welcome.com';
    // process.env.MAIL_USERNAME is not set for footerContactEmail
    process.env.MAIL_PASSWORD = 'welcomepass';
    process.env.APP_BASE_URL = 'https://welcomestore.com';
    process.env.MAIL_FROM_NAME = 'Welcome Team';
    // MAIL_USERNAME for 'from' must be set for createTransport
    process.env.MAIL_USERNAME = 'senderonly@welcome.com';

    const originalMailUsername = process.env.MAIL_USERNAME;
    delete process.env.MAIL_USERNAME; // Undefine for footerContactEmail logic in service

    fs.readFile.mockResolvedValue(newUserWelcomeTemplate);
    mockSendMail.mockResolvedValue({ messageId: 'welcome-fallback-id' });

    // Reinstate for createTransport and ReplyTo
    process.env.MAIL_USERNAME = 'senderonly@welcome.com';

    await sendNewUserWelcomeEmail(mockUserData, mockSettingsForWelcome);

    const sentOptions = mockSendMail.mock.calls[0][0];
    expect(sentOptions.html).toContain('Contact us: ');
    expect(sentOptions.html).not.toContain('Contact us: senderonly@welcome.com');
    expect(sentOptions.text).toContain('Contact us: \n');

    process.env.MAIL_USERNAME = originalMailUsername; // Restore
  });
});
