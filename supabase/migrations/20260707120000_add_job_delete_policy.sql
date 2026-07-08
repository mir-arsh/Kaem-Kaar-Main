CREATE POLICY "Hirers can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = hirer_id);
