import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "advogado@nexlabs.com",
    name: "Dr. Advogado Nex",
    loginMethod: "manus",
    role: "admin",
    cargo: "advogado",
    oab: "SP 123456",
    telefone: "(11) 99999-9999",
    ativo: true,
    dataAdmissao: null,
    salario: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

describe("auth.me", () => {
  it("returns the current authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.name).toBe("Dr. Advogado Nex");
    expect(user?.role).toBe("admin");
  });

  it("returns null for unauthenticated context", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });
});

describe("dashboard.stats", () => {
  it("returns stats object with expected keys", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.dashboard.stats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalClientes).toBe("number");
    expect(typeof stats.totalProcessos).toBe("number");
    expect(typeof stats.tarefasPendentes).toBe("number");
    expect(typeof stats.honorariosRecebidos).toBe("number");
  });
});

describe("clientes router", () => {
  it("listar returns an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const clientes = await caller.clientes.listar({});
    expect(Array.isArray(clientes)).toBe(true);
  });
});

describe("processos router", () => {
  it("listar returns an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const processos = await caller.processos.listar({});
    expect(Array.isArray(processos)).toBe(true);
  });
});

describe("financeiro router", () => {
  it("listar lancamentos returns an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const lancamentos = await caller.financeiro.listar({});
    expect(Array.isArray(lancamentos)).toBe(true);
  });
});

describe("agenda router", () => {
  it("prazos.listar returns an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const prazos = await caller.prazos.listar({});
    expect(Array.isArray(prazos)).toBe(true);
  });
});

describe("notificacoes router", () => {
  it("listar returns an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const notifs = await caller.notificacoes.listar();
    expect(Array.isArray(notifs)).toBe(true);
  });
});

describe("mensagens router", () => {
  it("listar returns an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const msgs = await caller.mensagens.listar();
    expect(Array.isArray(msgs)).toBe(true);
  });
});

describe("funcionarios router", () => {
  it("listar returns an array", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const funcs = await caller.funcionarios.listar();
    expect(Array.isArray(funcs)).toBe(true);
  });
});
