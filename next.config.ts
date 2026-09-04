import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Apaga el indicador flotante de dev (el badge circular "N") — tapaba el CTA en los
     screenshots de evidencia a 375px (docs/revisiones/onboarding-veredicto.md, defecto 2). */
  devIndicators: false,
  /* Permite probar el dev server desde el celular/tablet por la IP local de la red (Next
     bloquea por defecto las peticiones internas — HMR/RSC — que no vengan de localhost, para
     protegerse de DNS rebinding). Sin esto, la app cargaba solo el fondo y quedaba en blanco
     al abrirla desde otro dispositivo en la misma WiFi. Ajustar el rango si cambia la red. */
  allowedDevOrigins: ['192.168.1.5'],
};

export default nextConfig;
