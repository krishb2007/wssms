import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID", // Replace with your Application (client) ID
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your Tenant ID
    redirectUri: "http://localhost:3000", // Or your deployed app's URL
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);
