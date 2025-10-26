export type AuthToken = {
  accessToken: string;
};

export interface AuthPayload {
  sub: number;
  email: string;
  role: string;
}
