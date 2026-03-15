import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SMTP2GO_API_KEY = "api-7555B6B16E0D4C559080A6827600208D";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') as 'approve' | 'deny' | 'meeting_ended';
    const visitorName = url.searchParams.get('visitorName');
    const staffEmail = url.searchParams.get('staffEmail');
    const registrationTime = url.searchParams.get('registrationTime');

    if (!action || !visitorName || !staffEmail || !registrationTime) {
      return new Response('Missing required parameters', { status: 400 });
    }

    console.log(`Processing ${action} response for visitor: ${visitorName}`);

    // If meeting_ended, update meeting_staff_end_time in Supabase (NOT endtime)
    if (action === 'meeting_ended') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Calculate IST time
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const pad = (n: number) => n.toString().padStart(2, '0');
      const istString = `${istTime.getUTCFullYear()}-${pad(istTime.getUTCMonth() + 1)}-${pad(istTime.getUTCDate())}T${pad(istTime.getUTCHours())}:${pad(istTime.getUTCMinutes())}:${pad(istTime.getUTCSeconds())}`;

      // Find the visitor by name and update meeting_staff_end_time
      const { data: visitors, error: fetchError } = await supabase
        .from('visitor_registrations')
        .select('id, email')
        .eq('visitorname', visitorName)
        .is('meeting_staff_end_time', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!fetchError && visitors && visitors.length > 0) {
        const { error: updateError } = await supabase
          .from('visitor_registrations')
          .update({ meeting_staff_end_time: istString })
          .eq('id', visitors[0].id);

        if (updateError) {
          console.error("Error updating meeting_staff_end_time:", updateError);
        } else {
          console.log("Successfully updated meeting_staff_end_time for visitor:", visitorName);
        }
      } else {
        console.log("No active meeting found for visitor:", visitorName);
      }
    }

    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const actionTextMap: Record<string, string> = { approve: 'APPROVED', deny: 'DENIED', meeting_ended: 'MEETING ENDED' };
    const actionText = actionTextMap[action] || action.toUpperCase();
    const statusColor = action === 'approve' ? '#28a745' : action === 'deny' ? '#dc3545' : '#6c757d';

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
            action === 'deny' ?
            '<p style="color: #dc3545;">✗ The visitor request has been denied. Please inform the visitor if necessary.</p>' :
            '<p style="color: #6c757d;">⏹ The meeting has ended. The visitor is still on campus and should exit through the main exit.</p>'
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smtp2goPayload)
    });

    const responseData = await emailResponse.json();
    console.log("Response email sent successfully:", responseData);

    return new Response('OK', {
      status: 200,
      headers: { "Content-Type": "text/plain", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in handle-visit-response function:", error);
    return new Response('Error processing response', {
      status: 500,
      headers: { "Content-Type": "text/plain", ...corsHeaders },
    });
  }
};

serve(handler);
