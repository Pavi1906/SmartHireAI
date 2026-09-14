import { User } from '../../src/types'; // Assuming User type is there, we'll redefine if needed.

// In-memory Database Simulation
const users: Map<string, any> = new Map();

export const userRepository = {
  async findById(id: string) {
    return users.get(id) || null;
  },
  
  async findByEmail(email: string) {
    for (const [id, user] of users.entries()) {
      if (user.email === email) return user;
    }
    return null;
  },

  async create(user: any) {
    users.set(user.id, user);
    return user;
  }
};
