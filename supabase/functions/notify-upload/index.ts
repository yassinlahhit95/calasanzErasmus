import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { google } from "https://esm.sh/googleapis@121";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🔹 Use environment variables, not the raw values
    const supabaseUrl = Deno.env.get("https://wdprtdvovjqktzziierx.supabase.co")!;
    const supabaseKey = Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcHJ0ZHZvdmpxa3R6emlpZXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUyNTE1NywiZXhwIjoyMDg4MTAxMTU3fQ.P7tiGijQ4jg2G1pDPw5-oHq3SrjFOvcnpa20ZxOvP4U")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, surnames")
      .eq("user_id", user.id)
      .single();

    const body = await req.json();
    const studentName = profile ? `${profile.name} ${profile.surnames}` : user.email;

    // ✅ Google Drive setup
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: Deno.env.get("GOOGLE_CLIENT_EMAIL"),
        private_key: Deno.env.get("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Upload file to Google Drive if document or weekly_report
    if ((body.type === "document" || body.type === "weekly_report") && body.fileContent && body.fileName) {
      await drive.files.create({
        requestBody: {
          name: body.fileName,
          parents: [Deno.env.get("1d40SwSTrRwGb7dl_oEllQ4Z8ObAdnQ5Q")!],
        },
        media: {
          mimeType: "application/pdf", // Adjust if needed
          body: Buffer.from(body.fileContent, "base64"),
        },
      });
    }

    // Build the notification message
    let subject = "Erasmus+ Tracker - Nueva actividad";
    let message = "";

    if (body.type === "document") {
      subject = `📄 Documento subido - ${studentName}`;
      message = `El alumno/a ${studentName} ha subido el documento: ${body.documentType}\nArchivo: ${body.fileName}`;
    } else if (body.type === "weekly_report") {
      subject = `📅 Reporte semanal - ${studentName}`;
      message = `El alumno/a ${studentName} ha entregado el reporte de la semana ${body.week}${body.fileName ? `\nArchivo: ${body.fileName}` : ""}`;
    } else if (body.type === "diary") {
      subject = `📝 Entrada de diario - ${studentName}`;
      message = `El alumno/a ${studentName} ha añadido una entrada al diario: ${body.title}`;
    }

    console.log(`NOTIFICATION TO: international@calsasanz.eus`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`MESSAGE: ${message}`);

    return new Response(
      JSON.stringify({ success: true, subject, message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in notify-upload:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});