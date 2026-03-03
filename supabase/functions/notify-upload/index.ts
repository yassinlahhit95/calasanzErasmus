import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { google } from "https://esm.sh/googleapis@121";
import { Buffer } from "node:buffer"; // ضروري لتحويل الملفات

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // التعامل مع طلبات OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. إعداد Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. إعداد Google Drive (استخدام البيانات اللي عطيتيني)
    const googleClientEmail = Deno.env.get("GOOGLE_CLIENT_EMAIL")!;
    const googlePrivateKey = Deno.env.get("GOOGLE_PRIVATE_KEY")!.replace(/\\n/g, "\n");
    const googleFolderId = Deno.env.get("GOOGLE_FOLDER_ID")!; // هادا هو: 1d40SwSTrRwGb7dl_oEllQ4Z8ObAdnQ5Q

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: googleClientEmail,
        private_key: googlePrivateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const drive = google.drive({ version: "v3", auth });

    // 3. التحقق من المستخدم (Auth)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    // 4. جلب بيانات البروفايل
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, surnames")
      .eq("user_id", user.id)
      .single();

    const body = await req.json();
    const studentName = profile ? `${profile.name} ${profile.surnames}` : user.email;

    // 5. رفع الملف إلى Google Drive
    if ((body.type === "document" || body.type === "weekly_report") && body.fileContent && body.fileName) {
      
      // تحويل Base64 إلى Buffer ليقبله Google API
      const fileBuffer = Buffer.from(body.fileContent, 'base64');
      
      const fileMetadata = {
        name: body.fileName,
        parents: [googleFolderId],
      };

      const media = {
        mimeType: "application/pdf", // أو body.mimeType إذا كنت ترسله من الفرونت إند
        body: fileBuffer,
      };

      await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });
    }

    // 6. بناء رسالة الإشعار
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

    console.log(`Log: ${subject}`);

    return new Response(
      JSON.stringify({ success: true, message: "Activity logged and file uploaded" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});