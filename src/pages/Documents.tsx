import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, Circle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DOCUMENT_TYPES } from "@/lib/constants";

interface DocStatus {
  document_type: string;
  uploaded: boolean;
  file_name: string | null;
  uploaded_at: string | null;
}

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocStatus[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchDocs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("documents")
      .select("document_type, uploaded, file_name, uploaded_at")
      .eq("user_id", user.id);
    setDocs((data as DocStatus[]) || []);
  };

  useEffect(() => { fetchDocs(); }, [user]);

  const getStatus = (docType: string) => docs.find((d) => d.document_type === docType);

  const handleUpload = async (docType: string, file: File) => {
    if (!user) return;
    setUploading(docType);
    const filePath = `${user.id}/${docType}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("student-files")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Error al subir: " + uploadError.message);
      setUploading(null);
      return;
    }

    const { error: dbError } = await supabase.from("documents").upsert(
      {
        user_id: user.id,
        document_type: docType as any,
        file_name: file.name,
        file_path: filePath,
        uploaded: true,
        uploaded_at: new Date().toISOString(),
      },
      { onConflict: "user_id,document_type" }
    );

    if (dbError) {
      toast.error("Error al guardar: " + dbError.message);
    } else {
      toast.success(`${DOCUMENT_TYPES.find((d) => d.key === docType)?.label} subido correctamente`);
      // Send notification and upload to Google Drive
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          await supabase.functions.invoke("notify-upload", {
            body: { 
              type: "document", 
              documentType: docType, 
              fileName: file.name,
              fileContent: base64
            },
          });
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Google Drive sync error:", err);
      }
      fetchDocs();
    }
    setUploading(null);
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Documentación</h1>
        <p className="text-muted-foreground mb-6">
          Sube toda la documentación requerida. Los documentos aparecerán en verde cuando estén completados.
        </p>

        <div className="space-y-3">
          {DOCUMENT_TYPES.map((doc, i) => {
            const status = getStatus(doc.key);
            const done = status?.uploaded;
            return (
              <motion.div
                key={doc.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-4 flex items-center gap-4 transition-all ${
                  done ? "border-l-4 border-l-success" : "border-l-4 border-l-border"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={24} className="text-success flex-shrink-0" />
                ) : (
                  <Circle size={24} className="text-muted-foreground/40 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{doc.label}</p>
                  {done && status?.file_name && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      📎 {status.file_name} · {new Date(status.uploaded_at!).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(doc.key, file);
                      }}
                      disabled={uploading === doc.key}
                    />
                    <Button
                      variant={done ? "outline" : "default"}
                      size="sm"
                      className="gap-1.5 pointer-events-none"
                      disabled={uploading === doc.key}
                    >
                      {uploading === doc.key ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      {done ? "Reemplazar" : "Subir"}
                    </Button>
                  </label>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 glass-card p-4 flex items-center gap-3">
          <FileText size={20} className="text-secondary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {docs.filter((d) => d.uploaded).length} de {DOCUMENT_TYPES.length} documentos entregados
            </p>
            <p className="text-xs text-muted-foreground">
              Todos los documentos deben ser originales y entregados al tutor del colegio
            </p>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
