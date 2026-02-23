import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { GUIDE_SECTIONS } from "@/lib/constants";
import logo from "@/assets/logo_calasanz.png";

export default function Guide() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <img src={logo} alt="Calasanz" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Guía del Alumnado Erasmus+</h1>
          <p className="text-muted-foreground mt-1">
            Estancias de Prácticas en Empresas de la Unión Europea
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Calasanz Santurtzi · International Campus
          </p>
        </div>

        <div className="space-y-4">
          {GUIDE_SECTIONS.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{section.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 glass-card p-6 text-center hero-gradient rounded-xl">
          <h2 className="text-xl font-bold text-primary-foreground mb-2">
            ¡Disfruta, aprende y crece!
          </h2>
          <p className="text-primary-foreground/80 text-sm">
            El equipo de Calasanz está contigo en cada paso.
          </p>
          <p className="text-primary-foreground/60 text-sm mt-2">
            📧 rafael.pilar@calasanz.eus
          </p>
        </div>
      </motion.div>
    </Layout>
  );
}
