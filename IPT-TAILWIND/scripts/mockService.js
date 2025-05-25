/**
 * Mock API service for development/testing
 * This simulates the backend API responses
 */

const mockDatabase = {
  users: [],
  sessions: new Map(),
};

/**
 * Mock API service with simulated network delay
 */
export const mockApi = {
  async register(userData) {
    await simulateDelay();

    // Check if user already exists
    if (mockDatabase.users.find((u) => u.email === userData.email)) {
      throw new Error("User already exists");
    }

    // Create new user
    const user = {
      id: String(Date.now()),
      ...userData,
      password: undefined, // Don't store password in mock DB
    };

    mockDatabase.users.push(user);
    return { user };
  },

  async login(credentials) {
    await simulateDelay();

    // Find user
    const user = mockDatabase.users.find((u) => u.email === credentials.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Create session
    const session = {
      token: `mock-token-${Date.now()}`,
      userId: user.id,
    };

    mockDatabase.sessions.set(session.token, session);

    return {
      user,
      token: session.token,
    };
  },

  async getCurrentUser(token) {
    await simulateDelay();

    // Validate session
    const session = mockDatabase.sessions.get(token);
    if (!session) {
      return null;
    }

    // Get user
    const user = mockDatabase.users.find((u) => u.id === session.userId);
    return user || null;
  },

  async logout(token) {
    await simulateDelay();
    mockDatabase.sessions.delete(token);
  },
};

// Helper to simulate network delay
function simulateDelay() {
  return new Promise((resolve) => setTimeout(resolve, Math.random() * 200));
}
