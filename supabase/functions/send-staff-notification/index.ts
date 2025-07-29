import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_DxaC3EEM_6X1bEVaPbX3BvKnnge6SueMg");

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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { staffEmail, visitorName, purpose, numberOfPeople, startTime, phoneNumber }: StaffNotificationRequest = await req.json();

    console.log("Sending email to:", staffEmail);

    const formattedStartTime = new Date(startTime).toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailResponse = await resend.emails.send({
      from: "Woodstock Security <onboarding@resend.dev>",
      to: [staffEmail],
      subject: "New entry",
      html: `
        <h2>New Visitor Registration - Staff Meeting Request</h2>
        <p>A visitor has registered and requested to meet with you:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Visitor Name:</strong> ${visitorName}</p>
          <p><strong>Purpose:</strong> ${purpose}</p>
          <p><strong>Number of People:</strong> ${numberOfPeople}</p>
          <p><strong>Visit Start Time:</strong> ${formattedStartTime}</p>
          <p><strong>Contact Number:</strong> ${phoneNumber}</p>
        </div>
        
        <p>Please coordinate with security for the visitor's entry.</p>
        
        <p>Best regards,<br>
        Woodstock School Security</p>
      `,
    });

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