
-- Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('worker', 'hirer')),
  skills TEXT[],
  expected_pay_per_day NUMERIC,
  avatar_url TEXT,
  location_name TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  rating_avg NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Jobs table
CREATE TABLE public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hirer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  pay_amount NUMERIC NOT NULL,
  job_date TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Hirers can insert jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = hirer_id);
CREATE POLICY "Hirers can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = hirer_id);

-- Applications table
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own applications" ON public.applications FOR SELECT USING (
  auth.uid() = worker_id OR
  auth.uid() IN (SELECT hirer_id FROM public.jobs WHERE id = job_id)
);
CREATE POLICY "Workers can insert applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Hirers can update application status" ON public.applications FOR UPDATE USING (
  auth.uid() IN (SELECT hirer_id FROM public.jobs WHERE id = job_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR
  auth.uid() IN (SELECT hirer_id FROM public.jobs WHERE id = job_id) OR
  auth.uid() IN (SELECT worker_id FROM public.applications WHERE job_id = messages.job_id AND status = 'accepted')
);
CREATE POLICY "Auth users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Ratings table
CREATE TABLE public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rated_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(rater_id, job_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Function to update avg rating
CREATE OR REPLACE FUNCTION public.update_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET rating_avg = (SELECT COALESCE(AVG(score), 0) FROM public.ratings WHERE rated_user_id = NEW.rated_user_id)
  WHERE id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_rating_inserted
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_rating_avg();

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
