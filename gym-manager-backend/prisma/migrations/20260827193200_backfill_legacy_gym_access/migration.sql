-- Backfill: otorga un período de gracia (30 días) a los gimnasios creados
-- antes del sistema de suscripciones, que quedaron con "accessUntil" NULL.
-- Sin esto, esos gimnasios entrarían en modo solo-lectura de inmediato.
UPDATE "Gym"
SET "accessUntil" = now() + interval '30 days'
WHERE "accessUntil" IS NULL;
