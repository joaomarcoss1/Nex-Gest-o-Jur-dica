export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const normalizeUrlBase = (value: unknown): string | null => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || raw === "undefined" || raw === "null") return null;

  try {
    return new URL(raw).origin;
  } catch {
    try {
      return new URL(`https://${raw}`).origin;
    } catch {
      return null;
    }
  }
};

export const isLocalDemoMode = () => {
  const explicitDemo = import.meta.env.VITE_NEX_DEMO_MODE;
  if (explicitDemo === "false") return false;

  const oauthPortalUrl = normalizeUrlBase(import.meta.env.VITE_OAUTH_PORTAL_URL);
  const appId = typeof import.meta.env.VITE_APP_ID === "string" ? import.meta.env.VITE_APP_ID.trim() : "";

  return !oauthPortalUrl || !appId;
};

// Generate login URL at runtime so redirect URI reflects the current origin.
// In local/demo mode the project must open directly in VS Code without OAuth.
export const getLoginUrl = () => {
  const oauthPortalUrl = normalizeUrlBase(import.meta.env.VITE_OAUTH_PORTAL_URL);
  const appId = typeof import.meta.env.VITE_APP_ID === "string" ? import.meta.env.VITE_APP_ID.trim() : "";

  if (!oauthPortalUrl || !appId) {
    return "/dashboard";
  }

  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL("/app-auth", oauthPortalUrl);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.warn("[Nex Auth] Não foi possível montar URL de login. Abrindo em modo demonstração.", error);
    return "/dashboard";
  }
};
