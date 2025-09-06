// Import the function to be tested
const { sendOtp } = require('../twilioService');

// Mock the twilio library
const mockMessagesCreate = jest.fn();
const mockTwilioClient = {
  messages: {
    create: mockMessagesCreate,
  },
};
// This mock ensures that when `twilio(sid, token)` is called within sendOtp,
// it returns our mockTwilioClient, allowing us to then mock messages.create
jest.mock('twilio', () => jest.fn(() => mockTwilioClient));

describe('twilioService - sendOtp', () => {
  const testPhoneNumber = '+19876543210';
  const testOtp = '123456';
  let originalEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };

    // Set default valid environment variables for most tests
    process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
    process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
    process.env.TWILIO_PHONE_NUMBER = '+1234567890';

    // Reset Jest mocks before each test
    mockMessagesCreate.mockReset();
    // Clear the mock implementation of twilio itself if necessary, though usually not needed per test
    // require('twilio').mockClear(); // Uncomment if you face issues with mock call counts across tests
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    jest.restoreAllMocks(); // Restores spies
  });

  test('1. should send OTP successfully when env vars are set', async () => {
    mockMessagesCreate.mockResolvedValue({ sid: 'SMxxxxxxxxxxxxxxx' });
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await sendOtp(testPhoneNumber, testOtp);

    expect(require('twilio')).toHaveBeenCalledWith('test_account_sid', 'test_auth_token');
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
    expect(mockMessagesCreate).toHaveBeenCalledWith({
      body: `Your OTP for login is: ${testOtp}`,
      from: '+1234567890',
      to: testPhoneNumber,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(`OTP sent to ${testPhoneNumber}`);
  });

  test('2. should throw "Twilio configuration error" if TWILIO_ACCOUNT_SID is missing', async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendOtp(testPhoneNumber, testOtp))
      .rejects
      .toThrow('Twilio configuration error. Please check environment variables.');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Twilio environment variables not configured properly.');
    expect(mockMessagesCreate).not.toHaveBeenCalled();
  });

  test('2. should throw "Twilio configuration error" if TWILIO_AUTH_TOKEN is missing', async () => {
    delete process.env.TWILIO_AUTH_TOKEN;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendOtp(testPhoneNumber, testOtp))
      .rejects
      .toThrow('Twilio configuration error. Please check environment variables.');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Twilio environment variables not configured properly.');
    expect(mockMessagesCreate).not.toHaveBeenCalled();
  });

  test('2. should throw "Twilio configuration error" if TWILIO_PHONE_NUMBER is missing', async () => {
    delete process.env.TWILIO_PHONE_NUMBER;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendOtp(testPhoneNumber, testOtp))
      .rejects
      .toThrow('Twilio configuration error. Please check environment variables.');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Twilio environment variables not configured properly.');
    expect(mockMessagesCreate).not.toHaveBeenCalled();
  });

  test('3. should throw "Failed to send OTP" for a generic Twilio client error', async () => {
    const genericError = new Error('Generic Twilio Error');
    mockMessagesCreate.mockRejectedValue(genericError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendOtp(testPhoneNumber, testOtp))
      .rejects
      .toThrow('Failed to send OTP');
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error sending OTP to ${testPhoneNumber}:`, genericError);
  });

  test('4. should throw trial account error for Twilio error code 21614', async () => {
    const trialError = { code: 21614, message: 'Trial account restriction' };
    mockMessagesCreate.mockRejectedValue(trialError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendOtp(testPhoneNumber, testOtp))
      .rejects
      .toThrow('Failed to send OTP due to Twilio trial account restrictions. Please verify the recipient number or upgrade your account.');
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error sending OTP to ${testPhoneNumber}:`, trialError);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Twilio Trial Account Error: The recipient phone number may need to be verified in your Twilio console.');
  });

   test('4. should throw trial account error if message indicates trial restriction without error code', async () => {
    const trialErrorMessage = { message: 'Trial accounts cannot send messages to unverified numbers' };
    mockMessagesCreate.mockRejectedValue(trialErrorMessage);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendOtp(testPhoneNumber, testOtp))
      .rejects
      .toThrow('Failed to send OTP due to Twilio trial account restrictions. Please verify the recipient number or upgrade your account.');
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error sending OTP to ${testPhoneNumber}:`, trialErrorMessage);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Twilio Trial Account Error: The recipient phone number may need to be verified in your Twilio console.');
  });
});
