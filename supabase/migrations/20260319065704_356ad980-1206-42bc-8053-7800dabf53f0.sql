
DROP POLICY "Chat participants can view messages" ON public.messages;

CREATE POLICY "Chat participants can view messages"
ON public.messages FOR SELECT
USING (
  (auth.uid() = sender_id)
  OR (auth.uid() IN (SELECT jobs.hirer_id FROM jobs WHERE jobs.id = messages.job_id))
  OR (auth.uid() IN (SELECT applications.worker_id FROM applications WHERE applications.job_id = messages.job_id))
);
