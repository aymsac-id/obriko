-- Calificación con más criterios (2026-09-10, pedido directo del usuario): "2 items me parece
-- poco para valorar a un personal". Se agregan 4 criterios nuevos a evaluaciones — nullable,
-- porque las evaluaciones históricas (creadas antes de este cambio) no los tienen; las nuevas
-- siempre los llenan los 6 desde la UI (components/app/CalificarSheet.tsx).

alter table evaluaciones
  add column if not exists rendimiento int check (rendimiento between 1 and 5),
  add column if not exists trabajo_equipo int check (trabajo_equipo between 1 and 5),
  add column if not exists cumplimiento int check (cumplimiento between 1 and 5),
  add column if not exists seguridad int check (seguridad between 1 and 5);
