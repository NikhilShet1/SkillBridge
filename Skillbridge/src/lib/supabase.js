import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnpswnkuusenijnjyzgg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucHN3bmt1dXNlbmlqbmp5emdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjY1NzksImV4cCI6MjA5MzgwMjU3OX0.qcIC13dMIdBDPG_M8DUBhM6Det5b4rYMeoEI0vGosFE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
