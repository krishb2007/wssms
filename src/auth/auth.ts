import { msalInstance } from "./authConfig";

export async function getAccessToken() {
  // Login and get access token for Microsoft Graph
  const loginResponse = await msalInstance.loginPopup({
    scopes: ["Files.ReadWrite", "Sites.ReadWrite.All", "offline_access"]
  });
  const account = loginResponse.account;
  const tokenResponse = await msalInstance.acquireTokenSilent({
    scopes: ["Files.ReadWrite", "Sites.ReadWrite.All", "offline_access"],
    account
  });
  return tokenResponse.accessToken;
}
