-- Seed default settings if the table is empty.
-- Idempotent: existing rows are left untouched.
INSERT INTO "Setting" ("id", "key", "value", "type", "createdAt", "updatedAt")
SELECT gen_random_uuid(), key, value, type, now(), now()
FROM (
  VALUES
    ('site_name', 'NutriZaria', 'string'),
    ('site_description', 'Authentic Pure Food Resources', 'string'),
    ('contact_email', 'nutrizaria@gmail.com', 'string'),
    ('contact_phone', '+880 1820999820', 'string'),
    ('currency', 'bdt', 'string'),
    ('currency_symbol', 'Tk', 'string'),
    ('free_delivery_threshold', '2000', 'number'),
    ('delivery_fee_inside_dhaka', '80', 'number'),
    ('delivery_fee_outside_dhaka', '150', 'number'),
    ('delivery_fee', '80', 'number'),
    ('max_login_attempts', '5', 'number'),
    ('lockout_duration_minutes', '30', 'number'),
    ('maintenance_mode', 'false', 'boolean'),
    ('allow_registrations', 'true', 'boolean')
) AS s(key, value, type)
WHERE NOT EXISTS (SELECT 1 FROM "Setting");
