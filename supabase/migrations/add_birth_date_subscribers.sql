-- ALTER TABLE SUBSCRIBERS TO ADD BIRTH DATE
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- INDEX FOR SEARCH
CREATE INDEX IF NOT EXISTS idx_subscribers_birth_date ON public.subscribers(birth_date);
