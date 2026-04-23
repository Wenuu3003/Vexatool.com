-- Harden contact_messages INSERT policy: replace permissive `true` with input bounds check.
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;

CREATE POLICY "Anyone can submit contact"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (subject IS NULL OR char_length(subject) <= 200)
  AND char_length(message) BETWEEN 1 AND 5000
);
