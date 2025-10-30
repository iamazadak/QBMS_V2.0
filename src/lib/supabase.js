import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hwfsiugvilwyxbxipwmy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZnNpdWd2aWx3eXhieGlwd215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTkyNjMsImV4cCI6MjA3MjMzNTI2M30.ReO6hsFAS8GQ37IsDA5An3o9NPrnT784ppLaxjvsO6E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
