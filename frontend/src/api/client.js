/**
 * Medi Bridge AI - API Client
 * Manages HTTP communication with the Flask REST Backend,
 * automatic JWT authorization header injection, and response parsing.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('medibridge_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('medibridge_token', token);
    } else {
      localStorage.removeItem('medibridge_token');
    }
  }

  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth Endpoints
  async login(username, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('medibridge_user');
  }

  // Patients
  async getPatient(patientId) {
    return this.request(`/patients/${patientId}`);
  }

  async updatePatientProfile(patientId, data) {
    return this.request(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPatientVitals(patientId) {
    return this.request(`/patients/${patientId}/vitals`);
  }

  async addPatientVitals(patientId, vitalsData) {
    return this.request(`/patients/${patientId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitalsData),
    });
  }

  async getPatientPredictions(patientId) {
    return this.request(`/patients/${patientId}/predictions`);
  }

  async getPatientReport(patientId) {
    return this.request(`/patients/${patientId}/report`);
  }

  // Doctors
  async getDoctorPatients(doctorId, showAll = false) {
    return this.request(`/doctors/${doctorId}/patients?all=${showAll}`);
  }

  async updatePatientVirtualWardStatus(patientId, data) {
    return this.request(`/doctors/patients/${patientId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addClinicalNote(patientId, noteData) {
    return this.request(`/doctors/patients/${patientId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getClinicalNotes(patientId) {
    return this.request(`/doctors/patients/${patientId}/notes`);
  }

  async getTriageSummary() {
    return this.request('/doctors/triage-summary');
  }

  // Caregivers
  async getCaregiverPatients(caregiverId) {
    return this.request(`/caregivers/${caregiverId}/patients`);
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    return this.request(`/notifications?unread=${unreadOnly}`);
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  async acknowledgeNotification(id) {
    return this.request(`/notifications/${id}/acknowledge`, { method: 'POST' });
  }

  // Standalone ML Predictions
  async predictAll(vitalsData) {
    return this.request('/predictions/predict-all', {
      method: 'POST',
      body: JSON.stringify(vitalsData),
    });
  }

  async getModelMetadata() {
    return this.request('/predictions/metadata');
  }

  // System Health
  async getHealth() {
    return this.request('/health');
  }
}

export const api = new ApiClient();
