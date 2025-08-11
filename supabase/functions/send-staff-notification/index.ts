import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SMTP2GO_API_KEY = "7555B6B16E0D4C559080A6827600208D";

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
  pictureUrl?: string;
  people?: Array<{ name: string; role: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { staffEmail, visitorName, purpose, numberOfPeople, startTime, phoneNumber, pictureUrl, people }: StaffNotificationRequest = await req.json();

    console.log("Sending email to:", staffEmail);
    console.log("Picture URL received:", pictureUrl);

    // Use current time instead of start time for submission timestamp
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Format people names if available
    let peopleInfo = `${numberOfPeople}`;
    if (people && people.length > 0) {
      const names = people.map(person => person.name).filter(name => name.trim() !== '');
      if (names.length > 0) {
        peopleInfo += ` (${names.join(', ')})`;
      }
    }

    // Prepare email content
    const emailHtml = `
      <h2>New Visitor Registration - Staff Meeting Request</h2>
      <p>A visitor has registered and requested to meet with you:</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Visitor Name:</strong> ${visitorName}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Number of People:</strong> ${peopleInfo}</p>
        <p><strong>Registration Time:</strong> ${currentTime}</p>
        <p><strong>Contact Number:</strong> ${phoneNumber}</p>
      </div>
      
      ${pictureUrl ? '<p><strong>Note:</strong> Visitor photo is attached to this email.</p>' : '<p><strong>Note:</strong> No visitor photo provided.</p>'}
      
      <p>Please coordinate with security for the visitor's entry.</p>
      
      <p>Best regards,<br>
      Woodstock School Security</p>
    `;

    // Prepare SMTP2GO email payload
    const smtp2goPayload: any = {
      api_key: SMTP2GO_API_KEY,
      to: [staffEmail],
      sender: "noreply@woodstock.ac.in",
      subject: "New entry",
      html_body: emailHtml,
    };

    // If picture URL exists, fetch and attach the image
    if (pictureUrl) {
      try {
        console.log("Attempting to fetch visitor image from:", pictureUrl);
        
        const imageResponse = await fetch(pictureUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Supabase-Edge-Function/1.0'
          }
        });
        
        console.log("Image fetch response status:", imageResponse.status);
        
        if (imageResponse.ok) {
          const imageArrayBuffer = await imageResponse.arrayBuffer();
          const imageBytes = new Uint8Array(imageArrayBuffer);
          
          console.log("Image size:", imageBytes.length, "bytes");
          
          // Convert to base64
          let binary = '';
          const len = imageBytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(imageBytes[i]);
          }
          const base64Image = btoa(binary);
          
          console.log("Base64 conversion completed, length:", base64Image.length);
          
          // Get file extension from URL or default to jpg
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
          console.error("Failed to fetch image. Status:", imageResponse.status, "Status Text:", imageResponse.statusText);
          const errorText = await imageResponse.text();
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Error fetching image for attachment:", error);
        console.error("Error details:", error.message);
        // Continue without attachment if image fetch fails
      }
    } else {
      console.log("No picture URL provided");
    }

    const emailResponse = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smtp2goPayload)
    });

    const responseData = await emailResponse.json();

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, emailResponse: responseData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-staff-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);