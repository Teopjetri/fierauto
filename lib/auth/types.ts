export type AdminRole = "owner" | "developer" | "admin";

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
}

export interface AdminUserRecord extends AdminUser {
  passwordHash: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}
