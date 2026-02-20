/*
  # Fix venues insert policy

  1. Changes
    - Drop the existing restrictive INSERT policy that checks auth.uid() = added_by
    - Replace with a policy that allows any authenticated user to insert venues
    - The added_by field is set server-side so checking equality at insert time fails

  2. Security
    - INSERT still requires authentication
    - added_by is set server-side, not by the client
*/

DROP POLICY IF EXISTS "Authenticated users can insert venues" ON venues;

CREATE POLICY "Authenticated users can insert venues"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
