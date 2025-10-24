export type AuthToken = {
  accessToken: string;
}

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}
