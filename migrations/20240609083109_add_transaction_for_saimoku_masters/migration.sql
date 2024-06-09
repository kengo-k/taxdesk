-- AlterTable
ALTER TABLE "saimoku_masters" ADD COLUMN "transaction" tstzrange
;

UPDATE "saimoku_masters"
SET
  "transaction" = tstzrange(TIMESTAMP '2000-01-01 00:00:00+00', NULL, '[]')
;

ALTER TABLE "saimoku_masters" ALTER COLUMN "transaction" SET NOT NULL
;
