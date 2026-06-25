import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const demoUser: User = {
  id: 1,
  openId: "demo-nexlabs-local",
  name: "Administrador NexLabs",
  email: "admin@gestaojuridicanex.local",
  loginMethod: "demo",
  role: "admin",
  cargo: "Administrador",
  telefone: null,
  oab: null,
  ativo: true,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }

  // Para rodar localmente no VS Code sem depender do OAuth/Manus, mantemos um usuário demo admin.
  // Em produção, defina NEX_DEMO_MODE=false para exigir autenticação real.
  if (!user && process.env.NEX_DEMO_MODE !== "false") {
    user = demoUser;
  }

  return { req: opts.req, res: opts.res, user };
}
