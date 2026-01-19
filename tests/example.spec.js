// Import required modules
const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'https://staging.corporateapi.welcomecure.online';
const TOKEN_ENDPOINT = '/employee/generatedtoken';
const CREATE_MEMBER_ENDPOINT = '/employee/createmember'; // Update with actual endpoint

// Credentials
const API_CREDENTIALS = {
  apiKey: "6811b2b5d37f9476fbd1d54167c180",
  secretKey: "3f17297a2ce1330ab9f9d923b4ba5435e3366e85b19e4119f6efc11c79cebd2b"
};

// Helper function to generate unique email and contact
function generateUniqueData() {
  const timestamp = Date.now();
  return {
    email: `testuser${timestamp}@yopmail.com`,
    contact: `${timestamp}`.slice(-6) // Last 6 digits
  };
}

// Helper function to generate token
async function generateToken(request) {
  const response = await request.post(`${BASE_URL}${TOKEN_ENDPOINT}`, {
    data: API_CREDENTIALS
  });

  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();
  
  expect(responseBody.code).toBe(200);
  expect(responseBody.success).toBe(true);
  expect(responseBody.data.token).toBeTruthy();
  expect(responseBody.data.corporateID).toBeTruthy();

  return {
    token: responseBody.data.token,
    corporateID: responseBody.data.corporateID
  };
}

// Test Suite
test.describe('API Testing - Token Generation and Member Creation', () => {

  test('Should generate token successfully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}${TOKEN_ENDPOINT}`, {
      data: API_CREDENTIALS
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(200);
    expect(responseBody.code).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe('Token generated successfully');
    expect(responseBody.data.token).toBeTruthy();
    expect(responseBody.data.corporateID).toBeTruthy();
  });

  test('Should fail to create member when country code is not available', async ({ request }) => {
    const { token, corporateID } = await generateToken(request);
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      // countryCode is missing
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: corporateID
    };

    const response = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    const responseBody = await response.json();

    // Expect error response
    expect(response.status()).not.toBe(200);
    expect(responseBody.success).toBeFalsy();
    // Verify error message mentions country code
    expect(responseBody.message || responseBody.error).toContain('countryCode');
  });

  test('Should create member successfully with 2-digit country code', async ({ request }) => {
    const { token, corporateID } = await generateToken(request);
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      countryCode: 91, // 2-digit country code
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: corporateID
    };

    const response = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toContain('successfully');
    expect(responseBody.data).toBeTruthy();
  });

  test('Should create member successfully with 3-digit country code', async ({ request }) => {
    const { token, corporateID } = await generateToken(request);
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      countryCode: 971, // 3-digit country code
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: corporateID
    };

    const response = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toContain('successfully');
    expect(responseBody.data).toBeTruthy();
  });

  test('Should create member successfully with single-digit country code', async ({ request }) => {
    const { token, corporateID } = await generateToken(request);
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      countryCode: 1, // 1-digit country code (USA/Canada)
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: corporateID
    };

    const response = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    const responseBody = await response.json();

    expect(response.status()).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toContain('successfully');
    expect(responseBody.data).toBeTruthy();
  });

  test('Should fail when email is duplicated', async ({ request }) => {
    const { token, corporateID } = await generateToken(request);
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      countryCode: 91,
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: corporateID
    };

    // First request - should succeed
    const firstResponse = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    expect(firstResponse.status()).toBe(200);

    // Second request with same email - should fail
    const uniqueContact = generateUniqueData().contact;
    const secondResponse = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { ...memberData, contact: uniqueContact }
    });

    const secondResponseBody = await secondResponse.json();

    expect(secondResponse.status()).not.toBe(200);
    expect(secondResponseBody.success).toBeFalsy();
    expect(secondResponseBody.message || secondResponseBody.error).toMatch(/email|duplicate|already exists/i);
  });

  test('Should fail when contact number is duplicated', async ({ request }) => {
    const { token, corporateID } = await generateToken(request);
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      countryCode: 91,
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: corporateID
    };

    // First request - should succeed
    const firstResponse = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    expect(firstResponse.status()).toBe(200);

    // Second request with same contact - should fail
    const uniqueEmail = generateUniqueData().email;
    const secondResponse = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { ...memberData, email: uniqueEmail }
    });

    const secondResponseBody = await secondResponse.json();

    expect(secondResponse.status()).not.toBe(200);
    expect(secondResponseBody.success).toBeFalsy();
    expect(secondResponseBody.message || secondResponseBody.error).toMatch(/contact|duplicate|already exists/i);
  });

  test('Should fail when required fields are missing', async ({ request }) => {
    const { token, corporateID } = await generateToken(request);

    // Missing firstName
    const memberData = {
      middleName: "Mehul",
      sureName: "P",
      email: generateUniqueData().email,
      contact: generateUniqueData().contact,
      countryCode: 91,
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: corporateID
    };

    const response = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    const responseBody = await response.json();

    expect(response.status()).not.toBe(200);
    expect(responseBody.success).toBeFalsy();
  });

  test('Should fail with invalid token', async ({ request }) => {
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      countryCode: 91,
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: "696b659dcf1509b2a62d195b"
    };

    const response = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here',
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    expect(response.status()).toBe(401);
  });

  test('Should fail without authorization header', async ({ request }) => {
    const uniqueData = generateUniqueData();

    const memberData = {
      firstName: "Haritra123",
      middleName: "Mehul",
      sureName: "P",
      email: uniqueData.email,
      contact: uniqueData.contact,
      countryCode: 91,
      apiKey: API_CREDENTIALS.apiKey,
      corporateID: "696b659dcf1509b2a62d195b"
    };

    const response = await request.post(`${BASE_URL}${CREATE_MEMBER_ENDPOINT}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: memberData
    });

    expect(response.status()).toBe(401);
  });

});