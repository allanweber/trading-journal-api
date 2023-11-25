export interface AuthenticatedRequest extends Request {
  user?: string;
  email?: string;
}
