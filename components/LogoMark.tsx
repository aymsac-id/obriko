// Logo de Jornivo — pin/anillo de ubicación con un casco de construcción y tres personas
// (la cuadrilla) adentro, en el acento de marca. Mismo concepto e ícono que ya existía para
// Obriko (el rebranding a Jornivo, 2026-09-09, mantiene la geometría — solo cambia el
// wordmark); es la versión ligera para tamaños chicos (header, favicon) con fondo transparente
// que se adapta al tema. Un solo componente reusado en landing/onboarding/paywall/login.

export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Jornivo"
      className={className}
    >
      <defs>
        <linearGradient id="obriko-accent" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>

      {/* Anillo/pin: círculo grueso que se cierra en punta hacia abajo, con un corte en la
          parte superior (el gesto de firma del logo real) */}
      <path
        d="M32 3C18.75 3 8 13.6 8 26.6c0 15.8 24 34.4 24 34.4s24-18.6 24-34.4C56 13.6 45.25 3 32 3Z"
        fill="url(#obriko-accent)"
      />
      <circle cx="32" cy="26.5" r="15.5" fill="var(--bg)" />
      {/* Corte del anillo (gesto de firma) */}
      <rect x="30.4" y="3" width="3.2" height="9" fill="var(--bg)" />

      {/* Casco de construcción, centrado arriba */}
      <path
        d="M32 15.5c-5.6 0-10.1 4.3-10.6 9.8h21.2C42.1 19.8 37.6 15.5 32 15.5Z"
        fill="url(#obriko-accent)"
      />
      <rect x="19.8" y="24.6" width="24.4" height="3.4" rx="1.7" fill="url(#obriko-accent)" />
      <rect x="30.2" y="11" width="3.6" height="6" rx="1.8" fill="url(#obriko-accent)" />

      {/* La cuadrilla: 3 personas — dos laterales tenues, una central en acento */}
      <g fill="var(--text-tertiary)">
        <circle cx="23.5" cy="34" r="2.6" />
        <path d="M18.5 43.5c0-3 2.2-5.4 5-5.4s5 2.4 5 5.4v1h-10v-1Z" />
      </g>
      <g fill="var(--text-tertiary)">
        <circle cx="40.5" cy="34" r="2.6" />
        <path d="M35.5 43.5c0-3 2.2-5.4 5-5.4s5 2.4 5 5.4v1h-10v-1Z" />
      </g>
      <g fill="url(#obriko-accent)">
        <circle cx="32" cy="32.5" r="3.1" />
        <path d="M26.2 43.5c0-3.5 2.6-6.3 5.8-6.3s5.8 2.8 5.8 6.3v1H26.2v-1Z" />
      </g>
    </svg>
  );
}

/* ── <BrandLockup> — ícono + "JORNIVO" en Archivo Black (la misma tipografía gruesa que
   ya usaba el wordmark de Obriko), para los headers donde el nombre debe verse grande y con
   fuerza. Se pasa entero como prop `logo` de Hero/FooterLegal del kit (con appName="") para
   no tocar esos componentes — el kit solo controla el tamaño de un span de texto plano que
   no alcanza para replicar la tipografía del lockup real. ── */
export function BrandLockup({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={size} />
      <span
        className="font-black uppercase leading-none tracking-[0.01em] text-[var(--text-primary)] [font-family:var(--font-display)]"
        style={{ fontSize: size * 0.62 }}
      >
        Jornivo
      </span>
    </span>
  );
}
