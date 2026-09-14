import { userRepository } from '../repositories/userRepository';

export const authService = {
  async authenticate(email: string, role: string) {
    let user = await userRepository.findByEmail(email);
    
    if (!user) {
      // Auto-register for mock purposes if valid role
      const id = 'u_' + Math.random().toString(36).substr(2, 9);
      user = await userRepository.create({
        id,
        email,
        name: email.split('@')[0],
        role: role,
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`
      });
    }

    if (user.role !== role && user.role.toUpperCase() !== role.toUpperCase()) {
      throw new Error(`Invalid role. User is registered as ${user.role}, but tried to login as ${role}.`);
    }

    const token = `mock_token_${user.id}_${user.role}`;
    return { user, token };
  }
};
