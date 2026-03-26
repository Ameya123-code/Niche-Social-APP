import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';

export function withAuth(handler: (req: NextRequest, context: { params: { id?: string } }) => Promise<NextResponse>) {
  return async (req: NextRequest, context: { params: { id?: string } }) => {
    try {
      const token = extractTokenFromHeader(req.headers.get('Authorization') || '');
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }

      // Add userId to request context
      (req as any).userId = decoded.userId;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
