-- Ficha podológica de Inés: datos del paciente que faltaban (fotos de la ficha en papel, 20/10).
ALTER TABLE patients
  ADD COLUMN first_visit date,
  ADD COLUMN nationality text,
  ADD COLUMN sex text,
  ADD COLUMN height_cm numeric(5,1),
  ADD COLUMN weight_kg numeric(5,1),
  ADD COLUMN blood_group text,
  ADD COLUMN other_activities text;
