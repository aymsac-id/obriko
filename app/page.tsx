'use client';

// Landing de Jornivo — compuesta con el kit canónico de plantillas-codigo/landing/
// (copiado a components/landing/). Orden de las 10 secciones: 19-PAGINA-DE-VENTAS.md.
// Copy MARCADO trazado a FICHA-AVATAR.md: docs/copy/landing.md.
// Modelo 2 (onboarding-first/freemium, ESTADO.md): el CTA lleva a /onboarding, nunca a
// un checkout — el pago se decide más adelante en el paywall in-app (Sesión 4).

import { Clock, PhoneCall, UserX, Users } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { Problema } from '@/components/landing/Problema';
import { Agitacion } from '@/components/landing/Agitacion';
import { Solucion } from '@/components/landing/Solucion';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { Oferta } from '@/components/landing/Oferta';
import { PromesaCompromiso } from '@/components/landing/PromesaCompromiso';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { StickyCtaMobile } from '@/components/landing/ui';
import { BrandLockup } from '@/components/LogoMark';

const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Armar mi cuadrilla gratis';

export default function LandingJornivo() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO — fondo real dado por el usuario (obra + circuito), detrás del contenido del kit */}
      <div className="relative isolate overflow-hidden">
        <img
          src="/hero-bg.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-right-top"
        />
        <Hero
          appName=""
          logo={<BrandLockup size={40} />}
          loginHref="/login"
          h1Marked="Encuentra en segundos quién está [acento]libre mañana[/acento]"
          subtitleMarked="Tu libreta privada de personal confiable, evaluada y con [b]disponibilidad en tiempo real[/b]"
          ctaLabel={CTA_LABEL}
          ctaHref={CTA_HREF}
          socialProof={<span>Gratis hasta 10 trabajadores — sin tarjeta</span>}
          visualPlaceholderSugerencia="captura de la búsqueda con 3-4 trabajadores disponibles ordenados por confiabilidad"
          visual={
            <img
              src="/app-preview/buscador.png"
              alt="La búsqueda de Jornivo: trabajadores disponibles ordenados por confiabilidad, con su franja semanal de disponibilidad"
              className="w-full object-cover object-top"
            />
          }
        />
      </div>

      {/* 2. PROBLEMA */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: Clock, textoMarked: '¿Necesitas gente para mañana y no sabes quién está libre?' },
          { icon: Users, textoMarked: '¿Los que trabajan bien siempre están ocupados?' },
          { icon: PhoneCall, textoMarked: '¿Pierdes horas llamando uno por uno sin respuesta?' },
          { icon: UserX, textoMarked: '¿Un maestro dice que sí y después no aparece?' },
        ]}
      />

      {/* 3. AGITACIÓN */}
      <Agitacion
        frases={[
          'Cada llamada perdida es [b]tiempo que no vuelve[/b] a tu obra.',
          'Una mala contratación de urgencia atrasa tu cronograma y [acento]te hace quedar mal con el cliente[/acento].',
          'Otra agenda en el celular no resuelve esto: [b]más contactos no es más disponibilidad[/b].',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Llamas uno por uno y no sabes quién puede trabajar mañana.',
          labelFuturo: 'En 6 meses, si nada cambia',
          futuro: 'El mismo caos — con más obras retrasadas y clientes dudando de ti.',
        }}
      />

      {/* 4. SOLUCIÓN — mecanismo bautizado: el Comando de Cuadrilla */}
      <Solucion
        tituloMarked="Sabe quién está libre [acento]antes de llamar[/acento]"
        mecanismo="el Comando de Cuadrilla"
        bigIdeaMarked="No te faltan contactos: te falta saber quién de ellos puede trabajar hoy. El Comando de Cuadrilla [b]cruza tu libreta con la disponibilidad real[/b]."
        pasos={[
          { titulo: 'Importa tu cuadrilla', detalle: 'Sube tus contactos de Excel o del teléfono en minutos.' },
          { titulo: 'Marca disponibilidad', detalle: 'Marcas quién está libre en segundos desde tu celular, sin llamar a nadie.' },
          { titulo: 'Busca y confía', detalle: 'Filtra por oficio y ve quién está libre, ordenado por confiabilidad.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Diez llamadas para encontrar dos disponibles.',
          labelDespues: 'Después',
          despues: 'Tres confiables disponibles, visibles en segundos.',
        }}
      />

      {/* 5. LA APP POR DENTRO — screenshots reales de la app (docs/revisiones + public/app-preview) */}
      <AppPorDentro
        tituloMarked="Tu cuadrilla, [acento]lista para hoy[/acento]"
        frames={[
          { src: '/app-preview/cuadrilla-375.png', label: 'Tu libreta importada', nombrePantalla: 'Importar cuadrilla' },
          { src: '/app-preview/buscador.png', label: 'Quién está libre hoy', nombrePantalla: 'Buscador' },
          { src: '/app-preview/disponibilidad.png', label: 'La franja semanal de cada trabajador', nombrePantalla: 'Disponibilidad' },
          { src: '/app-preview/ficha-historial.png', label: 'El historial que mejora tu búsqueda', nombrePantalla: 'Ficha y calificación' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      {/* 6. OFERTA — freemium (ver desviación documentada en docs/copy/landing.md §6) */}
      <Oferta
        tituloMarked="Empieza gratis. Crece cuando [acento]lo necesites[/acento]"
        anual={{
          nombre: 'Starter',
          badge: 'MÁS POPULAR',
          precioMes: 'S/39',
          totalAnual: 'Cancelas cuando quieras — sin permanencia',
          ahorro: 'Hasta 50 trabajadores + búsqueda ilimitada',
          ctaLabel: CTA_LABEL,
          ctaHref: CTA_HREF,
          features: [
            'Hasta 50 trabajadores en tu libreta privada',
            'Búsqueda con filtros por oficio y confiabilidad',
            'Disponibilidad en tiempo real sin llamadas',
            'Historial y calificación después de cada obra',
          ],
        }}
        mensual={{
          nombre: 'Gratis',
          precioMes: 'S/0',
          ctaLabel: 'Probar gratis con 10 trabajadores',
          ctaHref: CTA_HREF,
          features: [
            'Hasta 10 trabajadores en tu libreta',
            'Búsqueda y disponibilidad incluidas',
            'Sin tarjeta para empezar',
            'Ideal para probar antes de crecer',
          ],
        }}
      />

      {/* 7. PROMESA DE CIERRE — Promesa de Cero Compromiso (sin checkout real aún) */}
      <PromesaCompromiso
        nombre="la Promesa de Cero Compromiso"
        condicionMarked="Empiezas gratis, sin tarjeta. Si Jornivo no te ahorra llamadas, [b]cancelas cuando quieras[/b], sin preguntas."
      />

      {/* 8. FAQ — objeciones reales de FICHA-AVATAR.md */}
      <Faq
        items={[
          {
            pregunta: '¿Ya tengo todos mis contactos en WhatsApp, para qué esto?',
            respuestaMarked:
              'WhatsApp guarda contactos, pero no te dice quién está libre AHORA ni cómo trabajó contigo antes. [b]Jornivo sí[/b].',
          },
          {
            pregunta: '¿Quién actualiza la disponibilidad, y mis maestros van a tener que instalar algo?',
            respuestaMarked:
              'Tú la marcas en segundos desde tu celular después de cada llamada — [b]tu trabajador nunca instala nada[/b].',
          },
          {
            pregunta: 'No tengo tiempo para registrar y calificar a mi gente.',
            respuestaMarked:
              'Importas tu libreta en minutos y calificar solo toma menos de un minuto después de cada obra.',
          },
          {
            pregunta: '¿Cuánto cuesta y puedo cancelar cuando quiera?',
            respuestaMarked:
              'Empiezas gratis hasta con 10 trabajadores; si creces, planes desde S/39 al mes, [b]sin permanencia[/b].',
          },
          {
            pregunta: '¿Esto ya funciona en algún lado o es una idea nueva?',
            respuestaMarked:
              'La misma idea —saber quién está disponible sin llamar— [b]ya la usan afuera Bridgit Bench y LaborChart (hoy parte de Procore)[/b]; Jornivo la trae a tu obra en español y sin volverse un software pesado.',
          },
        ]}
      />

      {/* 9. CTA FINAL */}
      <CtaFinal
        h2Marked="Deja de llamar. Empieza a [acento]saber[/acento]."
        futurePacingMarked="Mañana abres Jornivo, ves quién está libre y armas tu cuadrilla en minutos."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Gratis hasta 10 trabajadores — sin tarjeta"
        psMarked="PS: Jornivo es tu libreta privada de personal confiable, evaluada y con disponibilidad en tiempo real. Empiezas [b]gratis, sin tarjeta[/b], y ves quién puede trabajar mañana en segundos."
      />

      {/* 10. FOOTER LEGAL */}
      <FooterLegal
        appName=""
        logo={<BrandLockup size={26} />}
        soporteEmail="josskgp@gmail.com"
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
        ]}
      />

      {/* Sticky CTA mobile */}
      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
