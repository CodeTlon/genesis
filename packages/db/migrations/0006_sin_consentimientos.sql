-- Se elimina el módulo de consentimientos: las fotos ya no exigen un consentimiento registrado en el sistema.
-- IRREVERSIBLE para los datos de `consents` y `clinical_photos.consent_id`. Al momento de escribirla ninguna base tenía datos reales (solo pruebas).
ALTER TABLE clinical_photos DROP COLUMN consent_id;
DROP TABLE IF EXISTS consents;
