import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqwcdipmtlvwcbghxyup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxd2NkaXBtdGx2d2NiZ2h4eXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUyOTcyNTUsImV4cCI6MjA0MDg3MzI1NX0.9lkIyXzKkUN7O92BLH1QaCcXYpE8tfw0ayFdkU3Enw4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
