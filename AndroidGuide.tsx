
import React from 'react';

const AndroidGuide: React.FC = () => {
  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-black tracking-tighter text-slate-100 uppercase italic">Android 12-14 Integration</h2>
        <p className="text-xs text-slate-500 font-medium">Guía técnica para despliegue de nivel de sistema.</p>
      </div>

      <div className="space-y-6">
        <GuideStep 
          number="01" 
          title="Certificado CA de Usuario" 
          desc="Necesario para el análisis de tráfico cifrado y captura de jerarquía de vistas en apps protegidas."
          steps={[
            "Descargar 'omni_root.crt' desde el panel de Settings.",
            "Ir a: Ajustes > Seguridad > Cifrado y credenciales > Instalar certificado.",
            "Seleccionar 'Certificado de CA' e instalar."
          ]}
        />

        <GuideStep 
          number="02" 
          title="Servicio de Accesibilidad" 
          desc="Permite al asistente leer el contenido de la pantalla de otras aplicaciones sin intervención."
          steps={[
            "Ir a: Ajustes > Accesibilidad > Apps descargadas.",
            "Seleccionar 'OmniAssist Service'.",
            "Activar permiso y permitir control total del dispositivo."
          ]}
        />

        <GuideStep 
          number="03" 
          title="Optimización de Batería" 
          desc="Evita que Android 13+ mate el proceso en segundo plano."
          steps={[
            "Mantener presionado el icono de la App > Info de la app.",
            "Batería > Cambiar a 'Sin restricciones'.",
            "Habilitar 'Inicio automático' si está disponible."
          ]}
        />

        <GuideStep 
          number="04" 
          title="Superposición (Overlay)" 
          desc="Obligatorio para el traductor en tiempo real."
          steps={[
            "Habilitar 'Mostrar sobre otras aplicaciones' en Ajustes Especiales.",
            "Permitir ventanas emergentes mientras se ejecuta en segundo plano."
          ]}
        />
      </div>

      <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl mt-4">
        <p className="text-[10px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Compilación SDK</p>
        <code className="text-[9px] font-mono text-slate-400 block bg-slate-950 p-3 rounded-lg border border-slate-800">
          targetSdkVersion 34<br/>
          minSdkVersion 31<br/>
          permission.BIND_ACCESSIBILITY_SERVICE<br/>
          permission.SYSTEM_ALERT_WINDOW
        </code>
      </div>
    </div>
  );
};

const GuideStep: React.FC<{number: string, title: string, desc: string, steps: string[]}> = ({number, title, desc, steps}) => (
  <div className="relative pl-12 border-l border-slate-800 pb-2">
    <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-black text-blue-500 shadow-xl">
      {number}
    </div>
    <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">{title}</h3>
    <p className="text-[11px] text-slate-500 mt-1 mb-3">{desc}</p>
    <ul className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="text-[10px] text-slate-300 flex gap-2">
          <span className="text-blue-500">•</span> {s}
        </li>
      ))}
    </ul>
  </div>
);

export default AndroidGuide;
