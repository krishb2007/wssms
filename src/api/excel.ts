
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

export const downloadExcel = async (data: any[]) => {
  try {
    console.log("Preparing CSV download for data:", data);
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Purpose', 'People Count', 'Date'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.visitor_name || ''}"`,
        `"${item.contact_email || ''}"`,
        `"${item.purpose || ''}"`,
        item.number_of_people || 0,
        `"${new Date(item.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `visitor_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log("CSV file downloaded successfully");
    
  } catch (error) {
    console.error("Error downloading CSV:", error);
    throw new Error("Failed to download CSV file");
  }
};
