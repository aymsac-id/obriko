import type { Metadata } from "next";
import { Archivo_Black, Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jornivo — Encuentra en segundos quién está libre mañana",
  description:
    "Jornivo es la libreta privada donde el constructor guarda, califica y encuentra al instante al personal confiable y disponible para su próxima obra.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        archivoBlack.variable,
        barlowCondensed.variable,
        inter.variable
      )}
    >
      <body className="min-h-dvh flex flex-col bg-[var(--bg)]">
        {/* Fondo global — la misma imagen del Hero (grúa + circuito) ahora detrás de TODA la
            app: onboarding, paywall, login, legales y la app interna. Capa fija (no scrollea
            con la página, evita el bug de background-attachment:fixed en iOS) + scrim oscuro
            encima para que el texto y los datos densos (Buscar, Mi Cuadrilla) sigan legibles.
            Cada pantalla deja de pintar su propio bg-[var(--bg)] opaco para dejarla ver. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-20 bg-no-repeat bg-cover"
          style={{ backgroundImage: 'url(/hero-bg.png)', backgroundPosition: 'right top' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ backgroundColor: 'color-mix(in oklab, var(--bg) 85%, transparent)' }}
        />
        <a
          href="#hero"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--bg)]"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
