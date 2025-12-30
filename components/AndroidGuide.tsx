
import React from 'react';

const AndroidGuide: React.FC = () => {
  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-black tracking-tighter text-slate-100 uppercase italic">SDK Deployment Guide</h2>
        <p className="text-xs text-slate-500 font-medium">Arquitectura de bajo nivel para Android 12, 13 y 14.</p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">01</div>
            <h3 className="text-sm font-bold uppercase tracking-tight">Estructura del Manifest</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Añade estos permisos y declaraciones de servicio en tu <code>AndroidManifest.xml</code>.</p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[9px] text-blue-300 leading-relaxed overflow-x-auto">
            {`<!-- Permisos Críticos -->\n`}
            {`<uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />\n`}
            {`<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />\n`}
            {`<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />\n`}
            {`<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />\n\n`}
            {`<!-- Declaración del Servicio -->\n`}
            {`<service android:name=".OmniAccessibilityService"\n`}
            {`    android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"\n`}
            {`    android:exported="true">\n`}
            {`    <intent-filter>\n`}
            {`        <action android:name="android.accessibilityservice.AccessibilityService" />\n`}
            {`    </intent-filter>\n`}
            {`    <meta-data\n`}
            {`        android:name="android.accessibilityservice"\n`}
            {`        android:resource="@xml/accessibility_service_config" />\n`}
            {`</service>`}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-xs">02</div>
            <h3 className="text-sm font-bold uppercase tracking-tight">Captura de Tokens de UI</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Implementación del Kernel para leer la jerarquía de vistas (AccessibilityNodeInfo).</p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[9px] text-purple-300 leading-relaxed overflow-x-auto">
            {`override fun onAccessibilityEvent(event: AccessibilityEvent) {\n`}
            {`    val rootNode = rootInActiveWindow ?: return\n`}
            {`    val uiHierarchyText = extractText(rootNode)\n`}
            {`    // Enviar a Gemini para razonamiento profundo\n`}
            {`    geminiService.analyze(uiHierarchyText)\n`}
            {`}\n\n`}
            {`private fun extractText(node: AccessibilityNodeInfo): String {\n`}
            {`    var text = node.text?.toString() ?: ""\n`}
            {`    for (i in 0 until node.childCount) {\n`}
            {`        text += extractText(node.getChild(i))\n`}
            {`    }\n`}
            {`    return text\n`}
            {`}`}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center text-green-400 font-black text-xs">03</div>
            <h3 className="text-sm font-bold uppercase tracking-tight">Certificado CA (Proxy)</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Para analizar tráfico HTTPS en Android 12+, configura la red en la app:</p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[9px] text-green-300 leading-relaxed">
            {`<!-- res/xml/network_security_config.xml -->\n`}
            {`<network-security-config>\n`}
            {`    <base-config cleartextTrafficPermitted="false">\n`}
            {`        <trust-anchors>\n`}
            {`            <certificates src="system" />\n`}
            {`            <certificates src="user" />\n`}
            {`        </trust-anchors>\n`}
            {`    </base-config>\n`}
            {`</network-security-config>`}
          </div>
        </section>
      </div>

      <div className="mt-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-4">Pasos de Compilación Final</h4>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">1</div>
            <p className="text-[11px] text-slate-400">Instala Capacitor CLI: <code>npm install @capacitor/cli @capacitor/core</code></p>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">2</div>
            <p className="text-[11px] text-slate-400">Añade Android: <code>npx cap add android</code></p>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">3</div>
            <p className="text-[11px] text-slate-400">Genera el APK con ProGuard habilitado para proteger el kernel de IA.</p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default AndroidGuide;
