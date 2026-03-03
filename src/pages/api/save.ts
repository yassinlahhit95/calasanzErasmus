import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: `diary_${Date.now()}.json`,
      // إذا بغيت ترفع الملف لمجلد محدد:
      // parents: ["FOLDER_ID"]
    };

    const media = {
      mimeType: "application/json",
      body: JSON.stringify(data),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media,
    });

    return res.status(200).json({ success: true, fileId: file.data.id });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}