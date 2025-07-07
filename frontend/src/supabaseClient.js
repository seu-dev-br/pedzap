import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efvbgcbfbbrggyzdjwhf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdmJnY2JmYmJyZ2d5emRqd2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDY0OTMsImV4cCI6MjA2NzM4MjQ5M30.VGb6QF5r9js_mlQTGXoiDpynP6Z-zXHIQpQm90mfm38';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
