import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DiaryEntry {
  id: string;
  entry_date: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Diary() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", entry_date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false });
    setEntries((data as DiaryEntry[]) || []);
  };

  useEffect(() => { fetchEntries(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from("diary_entries").insert({
      user_id: user.id,
      title: form.title,
      content: form.content,
      entry_date: form.entry_date,
    });

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("Entrada de diario guardada");
      try {
        await supabase.functions.invoke("notify-upload", {
          body: { type: "diary", title: form.title },
        });
      } catch {}
      setForm({ title: "", content: "", entry_date: new Date().toISOString().split("T")[0] });
      setShowForm(false);
      fetchEntries();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("diary_entries").delete().eq("id", id);
    if (!error) {
      toast.success("Entrada eliminada");
      fetchEntries();
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Diario</h1>
            <p className="text-muted-foreground mt-1">Refleja tu experiencia Erasmus+ día a día</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva Entrada</span>
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-5 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Título</Label>
                  <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="¿Qué pasó hoy?" className="mt-1.5" />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Contenido</Label>
                <Textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Describe tu día, actividades, aprendizajes..." className="mt-1.5 min-h-[150px]" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}

        {entries.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aún no tienes entradas en tu diario</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Comienza a documentar tu experiencia Erasmus+</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                        {new Date(entry.entry_date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{entry.content}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
