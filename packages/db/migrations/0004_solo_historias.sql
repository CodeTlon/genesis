-- Genesis es solo historias clínicas: se elimina lo que quedó del sitio público, el CMS, la agenda y la simulación de WhatsApp.
-- IRREVERSIBLE para los datos de estas tablas. Al momento de escribirla ninguna base tenía datos reales (solo pruebas).
-- foot_markers (mapa de pies sin cifrar) tampoco se usa: las marcas viven dentro del payload cifrado de la evolución.
DROP TABLE IF EXISTS whatsapp_threads_demo, appointment_requests, appointments, resources, services, foot_markers CASCADE;
DROP TABLE IF EXISTS site_services, service_groups, gallery_items, media, site_content CASCADE;
