import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { staffEmail, visitorName, purpose, numberOfPeople, startTime, phoneNumber, pictureUrl }: StaffNotificationRequest = await req.json();

    console.log("Sending email to:", staffEmail);

    const formattedStartTime = new Date(startTime).toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Prepare email content
    const emailHtml = `
      <h2>New Visitor Registration - Staff Meeting Request</h2>
      <p>A visitor has registered and requested to meet with you:</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Visitor Name:</strong> ${visitorName}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Number of People:</strong> ${numberOfPeople}</p>
        <p><strong>Visit Start Time:</strong> ${formattedStartTime}</p>
        <p><strong>Contact Number:</strong> ${phoneNumber}</p>
      </div>
      
      ${pictureUrl ? '<p><strong>Note:</strong> Visitor photo is attached to this email.</p>' : ''}
      
      <p>Please coordinate with security for the visitor's entry.</p>
      
      <p>Best regards,<br>
      Woodstock School Security</p>
    `;

    // Prepare email options
    const emailOptions: any = {
      from: "Woodstock Security <onboarding@resend.dev>",
      to: [staffEmail],
      subject: "New entry",
      html: emailHtml,
    };

    // If picture URL exists, fetch and attach the image
    if (pictureUrl) {
      try {
        console.log("Fetching visitor image from:", pictureUrl);
        const imageResponse = await fetch(pictureUrl);
        
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
          
          // Get file extension from URL or default to jpg
          const fileExtension = pictureUrl.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
          
          emailOptions.attachments = [{
            filename: `visitor-photo.${fileExtension}`,
            content: base64Image,
            type: mimeType,
            disposition: 'attachment'
          }];
          
          console.log("Image attached successfully");
        } else {
          console.warn("Failed to fetch image:", imageResponse.status);
        }
      } catch (error) {
        console.error("Error fetching image for attachment:", error);
        // Continue without attachment if image fetch fails
      }
    }

    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
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