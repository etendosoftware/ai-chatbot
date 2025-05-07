import { User as NextAuthUser } from "next-auth";

// Extend the built-in User type
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    jwt?: string;
    name?: string;
    clientId?: string;
    orgId?: string;
    createdBy?: string;
    updatedBy?: string;
  }

  interface Session {
    user: User;
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    jwt?: string;
    email?: string;
    name?: string;
    clientId?: string;
    orgId?: string;
    createdBy?: string;
    updatedBy?: string;
  }
}