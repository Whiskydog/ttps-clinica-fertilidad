export type AuthToken = {
  accessToken: string;
};

export interface AuthPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}
