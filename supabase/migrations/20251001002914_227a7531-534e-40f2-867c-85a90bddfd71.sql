-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- DROP the overly permissive partner SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view partners" ON public.partners;

-- CREATE new admin-only SELECT policy for partners
CREATE POLICY "Only admins can view partners"
ON public.partners
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add missing INSERT policy for profiles (user can only create their own profile)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add missing DELETE policy for profiles (prevent profile deletion)
CREATE POLICY "Profiles cannot be deleted"
ON public.profiles
FOR DELETE
USING (false);

-- Grant necessary permissions
GRANT USAGE ON TYPE public.app_role TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;