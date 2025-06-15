export async function addRowToExcel(
  accessToken: string,
  fileId: string,
  tableName: string,
  values: any[][]
) {
  // POST to Microsoft Graph API to add a row to the Excel table
  const url = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/tables/${tableName}/rows/add`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values })
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
