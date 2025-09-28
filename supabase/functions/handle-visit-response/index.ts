import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SMTP2GO_API_KEY = "api-7555B6B16E0D4C559080A6827600208D";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResponseRequest {
  action: 'approve' | 'deny';
  visitorName: string;
  staffEmail: string;
  registrationTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') as 'approve' | 'deny';
    const visitorName = url.searchParams.get('visitorName');
    const staffEmail = url.searchParams.get('staffEmail');
    const registrationTime = url.searchParams.get('registrationTime');

    if (!action || !visitorName || !staffEmail || !registrationTime) {
      return new Response('Missing required parameters', { status: 400 });
    }

    console.log(`Processing ${action} response for visitor: ${visitorName}`);

    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const actionText = action === 'approve' ? 'APPROVED' : 'DENIED';
    const statusColor = action === 'approve' ? '#28a745' : '#dc3545';

    // Send confirmation email to security
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: ${statusColor};">Visit Request ${actionText}</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <h3 style="margin-top: 0; color: ${statusColor};">Response Received</h3>
          <p><strong>Staff Member:</strong> ${staffEmail}</p>
          <p><strong>Visitor:</strong> ${visitorName}</p>
          <p><strong>Original Request Time:</strong> ${registrationTime}</p>
          <p><strong>Response Time:</strong> ${currentTime}</p>
          <p><strong>Decision:</strong> <span style="color: ${statusColor}; font-weight: bold;">${actionText}</span></p>
        </div>
        
        <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Next Steps:</strong></p>
          ${action === 'approve' ? 
            '<p style="color: #28a745;">✓ The visitor request has been approved. Please coordinate with the visitor for their entry.</p>' :
            '<p style="color: #dc3545;">✗ The visitor request has been denied. Please inform the visitor if necessary.</p>'
          }
        </div>
        
        <p style="font-size: 12px; color: #6c757d; margin-top: 30px;">
          This is an automated response from the Woodstock School Visitor Management System.
        </p>
      </div>
    `;

    const smtp2goPayload = {
      api_key: SMTP2GO_API_KEY,
      to: ["security@woodstock.ac.in"],
      sender: "security@woodstock.ac.in",
      subject: `Visit Request ${actionText} - ${visitorName}`,
      html_body: emailHtml,
    };

    const emailResponse = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smtp2goPayload)
    });

    const responseData = await emailResponse.json();
    console.log("Response email sent successfully:", responseData);

    // Return a user-friendly confirmation page
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Response Recorded</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px; 
            background-color: #f8f9fa;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          .success { color: #28a745; }
          .danger { color: #dc3545; }
          .icon { font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${action === 'approve' ? '✅' : '❌'}</div>
          <h1 class="${action === 'approve' ? 'success' : 'danger'}">
            Visit Request ${actionText}
          </h1>
          <p>Thank you for your response. The security team has been notified.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Visitor:</strong> ${visitorName}</p>
            <p><strong>Your Decision:</strong> <span class="${action === 'approve' ? 'success' : 'danger'}">${actionText}</span></p>
            <p><strong>Recorded At:</strong> ${currentTime}</p>
          </div>
          <p style="color: #6c757d; font-size: 14px;">
            You can safely close this window.
          </p>
        </div>
      </body>
      </html>
    `;

    return new Response(confirmationHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in handle-visit-response function:", error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #dc3545; text-align: center; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Error Processing Response</h1>
          <p>There was an error processing your response. Please contact the security team directly.</p>
        </div>
      </body>
      </html>
    `;

    return new Response(errorHtml, {
      status: 500,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
};

serve(handler);