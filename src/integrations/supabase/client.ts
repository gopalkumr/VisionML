// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cjdgzzotjfeqhlcdlcvz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZGd6em90amZlcWhsY2RsY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjgzOTAsImV4cCI6MjA1NzcwNDM5MH0.f90xr59zL5vtc9uRsSjuxMKiIuc_UlnR2u846Pqn3e4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);