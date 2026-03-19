import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = btoa(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );

  const unsignedToken = `${header}.${claim}`;

  const pemContent = serviceAccount.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken),
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}.${encodedSignature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function normalizeSpreadsheetId(raw: string): string {
  const trimmed = raw.trim();
  const fromUrl = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  return fromUrl || trimmed;
}

function parseServiceAccount(raw: string): any {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return JSON.parse(trimmed);
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(JSON.parse(trimmed));
  }

  throw new Error(
    "GOOGLE_SERVICE_ACCOUNT_JSON is invalid. Paste the full service account JSON object.",
  );
}

async function appendRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  values: string[][],
) {
  const range = `${sheetName}!A:Z`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to append row: ${err}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const spreadsheetIdRaw = Deno.env.get("GOOGLE_SHEET_ID");
    const sheetName = Deno.env.get("GOOGLE_SHEET_NAME") || "Sheet1";

    if (!serviceAccountJson || !spreadsheetIdRaw) {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SHEET_ID");
    }

    const serviceAccount = parseServiceAccount(serviceAccountJson);
    const spreadsheetId = normalizeSpreadsheetId(spreadsheetIdRaw);

    console.log("Using spreadsheet ID length:", spreadsheetId.length);
    console.log("Using sheet name:", sheetName);

    const body = await req.json();
    const record = body.record;

    if (!record) {
      throw new Error("No record provided");
    }

    console.log("Syncing visitor to Google Sheets:", record.visitorname);

    const accessToken = await getAccessToken(serviceAccount);

    let peopleStr = "";
    try {
      const people = JSON.parse(record.people || "[]");
      peopleStr = people.map((p: any) => `${p.name} (${p.role})`).join(", ");
    } catch {
      peopleStr = record.people || "";
    }

    const row = [
      record.visitorname || "",
      record.phonenumber || "",
      record.email || "",
      String(record.numberofpeople || 0),
      peopleStr,
      record.purpose || "",
      record.address || "",
      record.entry_location || "",
      record.id_type || "",
      record.id_number || "",
      record.starttime || "",
      record.endtime || "",
      record.meeting_staff_times || "",
      record.picture_url || "",
      record.signature_url || "",
      record.created_at || "",
    ];

    const result = await appendRow(accessToken, spreadsheetId, sheetName, [row]);

    console.log("Successfully synced to Google Sheets:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Google Sheets sync error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});