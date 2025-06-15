
import { FormDataWithId } from '../services/formDataService';

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

export async function downloadExcel(data: FormDataWithId[]): Promise<void> {
  try {
    // Create CSV content
    const headers = ['Name', 'Contact', 'Purpose', 'Number of People', 'Date'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        `"${item.visitor_name}"`,
        `"${item.contact_email}"`,
        `"${item.purpose}"`,
        item.number_of_people,
        `"${new Date(item.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitor_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    throw error;
  }
}
