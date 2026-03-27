import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';

type RouteContext = { params: { id?: string } };
type AuthenticatedNextRequest = NextRequest & { userId: string };

export function withAuth(handler: (req: AuthenticatedNextRequest, context: RouteContext) => Promise<NextResponse>) {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      const token = extractTokenFromHeader(req.headers.get('Authorization') || '');
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }

      const authenticatedRequest = req as AuthenticatedNextRequest;
      authenticatedRequest.userId = decoded.userId;

      return handler(authenticatedRequest, context);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
