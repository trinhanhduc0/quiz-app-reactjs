// src/services/TokenService.js

class TokenService {
  constructor() {
    this.nameLocalStorage = "authToken"; // Replace with your localStorage key name if different
  }

  // Save token to localStorage
  saveToken(token) {
    localStorage.setItem(this.nameLocalStorage, token);
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(this.nameLocalStorage);
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem(this.nameLocalStorage);
  }
}

export default new TokenService();
