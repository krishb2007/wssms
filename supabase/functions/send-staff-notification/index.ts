import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SMTP2GO_API_KEY = "api-7555B6B16E0D4C559080A6827600208D";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StaffNotificationRequest {
  staffEmail: string;
  visitorName: string;
  purpose: string;
  numberOfPeople: number;
  startTime: string;
  phoneNumber: string;
  address: string;
  pictureUrl?: string;
  people?: Array<{ name: string; role: string }>;
  meetingStartTime?: string;
  visitorId?: string;
  staffIndex?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { staffEmail, visitorName, purpose, numberOfPeople, startTime, phoneNumber, address, pictureUrl, people, meetingStartTime, visitorId, staffIndex }: StaffNotificationRequest = await req.json();

    console.log("Sending email to:", staffEmail);
    console.log("Picture URL received:", pictureUrl);

    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Format the per-staff meeting start time for display
    let meetingTimeDisplay = '';
    if (meetingStartTime) {
      try {
        const cleanString = meetingStartTime.split('.')[0].replace('Z', '');
        const parts = cleanString.split('T');
        if (parts.length === 2) {
          const [datePart, timePart] = parts;
          const [year, month, day] = datePart.split('-').map(Number);
          const [hours24, minutes] = timePart.split(':').map(Number);
          const hours12 = hours24 % 12 || 12;
          const ampm = hours24 >= 12 ? 'PM' : 'AM';
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          meetingTimeDisplay = `${monthNames[month - 1]} ${day}, ${year}, ${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
      } catch {
        meetingTimeDisplay = meetingStartTime;
      }
    }

    let peopleInfo = `${numberOfPeople}`;
    if (people && people.length > 0) {
      const names = people.map(person => person.name).filter(name => name.trim() !== '');
      if (names.length > 0) {
        peopleInfo += ` (${names.join(', ')})`;
      }
    }

    const baseUrl = "https://efxeohyxpnwewhqwlahw.supabase.co/functions/v1/handle-visit-response";
    const commonParams = `visitorName=${encodeURIComponent(visitorName)}&staffEmail=${encodeURIComponent(staffEmail)}&registrationTime=${encodeURIComponent(currentTime)}${visitorId ? `&visitorId=${encodeURIComponent(visitorId)}` : ''}${typeof staffIndex === 'number' ? `&staffIndex=${staffIndex}` : ''}`;
    const approveUrl = `${baseUrl}?action=approve&${commonParams}`;
    const denyUrl = `${baseUrl}?action=deny&${commonParams}`;
    const meetingEndedUrl = `${baseUrl}?action=meeting_ended&${commonParams}`;

    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Visitor Registration - Staff Meeting Request</h2>
        
        <table style="width:100%; border-collapse:collapse; margin: 10px 0;">
          <tr>
            <td style="vertical-align:top; padding-right:15px;">
              <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
                <p style="margin:3px 0;"><strong>Visitor:</strong> ${visitorName}</p>
                <p style="margin:3px 0;"><strong>Purpose:</strong> ${purpose}</p>
                <p style="margin:3px 0;"><strong>People:</strong> ${peopleInfo}</p>
                ${meetingTimeDisplay ? `<p style="margin:3px 0;"><strong>Meeting:</strong> ${meetingTimeDisplay}</p>` : ''}
                <p style="margin:3px 0;"><strong>Phone:</strong> ${phoneNumber}</p>
                <p style="margin:3px 0;"><strong>Time:</strong> ${currentTime}</p>
                <p style="margin:3px 0;"><strong>Address:</strong> ${address}</p>
              </div>
            </td>
            <td style="vertical-align:top; width:160px;">
              <a href="${approveUrl}" style="background-color:#28a745;color:white;padding:10px 18px;text-decoration:none;border-radius:5px;font-weight:bold;display:block;margin-bottom:8px;text-align:center;">✓ APPROVE</a>
              <a href="${denyUrl}" style="background-color:#dc3545;color:white;padding:10px 18px;text-decoration:none;border-radius:5px;font-weight:bold;display:block;margin-bottom:8px;text-align:center;">✗ DENY</a>
              <a href="${meetingEndedUrl}" style="background-color:#6c757d;color:white;padding:10px 18px;text-decoration:none;border-radius:5px;font-weight:bold;display:block;text-align:center;">⏹ ENDED</a>
            </td>
          </tr>
        </table>
        ${pictureUrl ? '<p style="color:#28a745;font-size:12px;margin:8px 0;">✓ Visitor photo attached.</p>' : '<p style="color:#ffc107;font-size:12px;margin:8px 0;">⚠ No photo provided.</p>'}
        <hr style="border:none;border-top:1px solid #dee2e6;margin:12px 0;">
        <p style="color:#6c757d;font-size:11px;">Woodstock School Security — Automated Visitor Management System</p>
      </div>
    `;

    const smtp2goPayload: any = {
      api_key: SMTP2GO_API_KEY,
      to: [staffEmail],
      sender: "security@woodstock.ac.in",
      subject: "New entry",
      html_body: emailHtml,
    };

    if (pictureUrl) {
      try {
        console.log("Attempting to fetch visitor image from:", pictureUrl);
        const imageResponse = await fetch(pictureUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Supabase-Edge-Function/1.0' }
        });
        console.log("Image fetch response status:", imageResponse.status);
        if (imageResponse.ok) {
          const imageArrayBuffer = await imageResponse.arrayBuffer();
          const imageBytes = new Uint8Array(imageArrayBuffer);
          console.log("Image size:", imageBytes.length, "bytes");
          let binary = '';
          const len = imageBytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(imageBytes[i]);
          }
          const base64Image = btoa(binary);
          const urlParts = pictureUrl.split('.');
          const fileExtension = urlParts[urlParts.length - 1]?.toLowerCase() || 'jpg';
          const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
          smtp2goPayload.attachments = [{
            filename: `visitor-photo.${fileExtension}`,
            fileblob: base64Image,
            mimetype: mimeType
          }];
          console.log("Image attachment prepared successfully");
        } else {
          console.error("Failed to fetch image. Status:", imageResponse.status);
        }
      } catch (error) {
        console.error("Error fetching image for attachment:", error);
      }
    }

    const emailResponse = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smtp2goPayload)
    });

    const responseData = await emailResponse.json();
    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, emailResponse: responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-staff-notification function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
