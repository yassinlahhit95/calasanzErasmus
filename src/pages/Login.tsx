import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo_calasanz.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Credenciales incorrectas. Verifica tu email y contraseña.");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left hero */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-md"
        >
          <img src={logo} alt="Calasanz Santurtzi" className="h-20 mx-auto mb-8 brightness-0 invert" />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            Erasmus+ Tracker
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Plataforma de seguimiento y documentación para estancias de prácticas en empresas de la Unión Europea
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-primary-foreground/60 text-sm">
            <span>Calasanz Santurtzi</span>
            <span>•</span>
            <span>International Campus</span>
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <img src={logo} alt="Calasanz" className="h-14 mx-auto mb-4" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Iniciar Sesión</h2>
          <p className="text-muted-foreground mb-8">Accede a tu panel de seguimiento Erasmus+</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              <LogIn size={18} />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-secondary font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
