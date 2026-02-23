import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, Circle, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { WEEKS } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Report {
  week_number: number;
  uploaded: boolean;
  file_name: string | null;
  report_text: string | null;
  uploaded_at: string | null;
}

export default function WeeklyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [reportText, setReportText] = useState("");

  const fetchReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("weekly_reports")
      .select("week_number, uploaded, file_name, report_text, uploaded_at")
      .eq("user_id", user.id);
    setReports((data as Report[]) || []);
  };

  useEffect(() => { fetchReports(); }, [user]);

  const getReport = (week: number) => reports.find((r) => r.week_number === week);

  const handleSubmit = async (week: number, file?: File) => {
    if (!user) return;
    setUploading(week);

    let filePath: string | null = null;
    let fileName: string | null = null;

    if (file) {
      filePath = `${user.id}/weekly/${week}/${file.name}`;
      fileName = file.name;
      const { error } = await supabase.storage.from("student-files").upload(filePath, file, { upsert: true });
      if (error) {
        toast.error("Error al subir archivo: " + error.message);
        setUploading(null);
        return;
      }
    }

    const { error } = await supabase.from("weekly_reports").upsert(
      {
        user_id: user.id,
        week_number: week,
        report_text: reportText || null,
        file_name: fileName,
        file_path: filePath,
        uploaded: true,
        uploaded_at: new Date().toISOString(),
      },
      { onConflict: "user_id,week_number" }
    );

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success(`Reporte de la semana ${week} enviado`);
      try {
        await supabase.functions.invoke("notify-upload", {
          body: { type: "weekly_report", week, fileName },
        });
      } catch {}
      setOpenWeek(null);
      setReportText("");
      fetchReports();
    }
    setUploading(null);
  };

  const completed = reports.filter((r) => r.uploaded).length;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Reportes Semanales</h1>
        <p className="text-muted-foreground mb-6">
          Entrega un reporte por cada semana de tu estancia (12 semanas). Puedes incluir texto y adjuntar un archivo con imágenes.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {WEEKS.map((week) => {
            const report = getReport(week);
            const done = report?.uploaded;
            return (
              <Dialog key={week} open={openWeek === week} onOpenChange={(open) => { setOpenWeek(open ? week : null); setReportText(report?.report_text || ""); }}>
                <DialogTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: week * 0.03 }}
                    className={`glass-card p-4 text-left transition-all hover:shadow-md ${
                      done ? "border-l-4 border-l-success" : "border-l-4 border-l-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {done ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : (
                        <Circle size={18} className="text-muted-foreground/40" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">Semana</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{week}</p>
                    {done && report?.file_name && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">📎 {report.file_name}</p>
                    )}
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CalendarDays size={20} />
                      Reporte Semana {week}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Descripción / Reflexión</Label>
                      <Textarea
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Describe las actividades y experiencias de esta semana..."
                        className="mt-1.5 min-h-[120px]"
                      />
                    </div>
                    <div>
                      <Label>Archivo adjunto (con imágenes)</Label>
                      <label className="mt-1.5 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-secondary/50 transition-colors">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSubmit(week, file);
                          }}
                          disabled={uploading === week}
                        />
                        {uploading === week ? (
                          <Loader2 size={20} className="animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload size={20} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Seleccionar archivo</span>
                          </>
                        )}
                      </label>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleSubmit(week)}
                      disabled={uploading === week || !reportText.trim()}
                    >
                      {uploading === week ? "Enviando..." : "Enviar solo texto"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        <div className="mt-6 glass-card p-4 flex items-center gap-3">
          <CalendarDays size={20} className="text-primary" />
          <p className="text-sm font-medium text-foreground">
            {completed} de 12 reportes semanales entregados
          </p>
        </div>
      </motion.div>
    </Layout>
  );
}
