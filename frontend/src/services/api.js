const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const USER_ID = 'demo-user-001';

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function checkApi() {
  try {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
      throw new Error('API unavailable');
    }

    return true;
  } catch {
    return false;
  }
}

export async function getConsents() {
  return apiRequest(`/api/consent/${USER_ID}`);
}

export async function grantConsent(consentType) {
  return apiRequest('/api/consent/grant', {
    method: 'POST',
    body: JSON.stringify({
      user_id: USER_ID,
      consent_type: consentType,
    }),
  });
}

export async function revokeConsent(consentType) {
  return apiRequest('/api/consent/revoke', {
    method: 'POST',
    body: JSON.stringify({
      user_id: USER_ID,
      consent_type: consentType,
    }),
  });
}

export async function getConsentHistory() {
  return apiRequest(`/api/consent/${USER_ID}/history`);
}
