const { generateToken, verifyToken, hashPassword, comparePassword } = require('../auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Utilities', () => {
  const mockUser = { id: '123', email: 'test@example.com' };
  
  describe('generateToken', () => {
    it('should generate a token with correct payload', () => {
      jwt.sign.mockReturnValue('mock-token');
      
      const token = generateToken(mockUser);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email },
        expect.any(String),
        { expiresIn: '7d' }
      );
      expect(token).toBe('mock-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify and return token payload', () => {
      const mockPayload = { userId: '123', email: 'test@example.com' };
      jwt.verify.mockReturnValue(mockPayload);
      
      const payload = verifyToken('mock-token');
      
      expect(jwt.verify).toHaveBeenCalledWith('mock-token', expect.any(String));
      expect(payload).toEqual(mockPayload);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      bcrypt.hash.mockResolvedValue('hashed-password');
      
      const hashed = await hashPassword('plain-password');
      
      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 12);
      expect(hashed).toBe('hashed-password');
    });

    it('should compare passwords correctly', async () => {
      bcrypt.compare.mockResolvedValue(true);
      
      const isValid = await comparePassword('plain-password', 'hashed-password');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');
      expect(isValid).toBe(true);
    });
  });
});