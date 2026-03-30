import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRY: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRY as SignOptions['expiresIn']) || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

export type AuthTokenPayload = {
  userId: string;
  email: string;
  isEmailVerified: boolean;
};

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function getUserFromRequest(request: NextRequest): AuthTokenPayload | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const headerToken = extractTokenFromHeader(authHeader);
  const cookieToken = request.cookies.get('auth_token')?.value || null;
  const token = headerToken || cookieToken;
  if (!token) return null;
  return verifyToken(token);
}
