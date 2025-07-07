const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://efvbgcbfbbrggyzdjwhf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdmJnY2JmYmJyZ2d5emRqd2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDY0OTMsImV4cCI6MjA2NzM4MjQ5M30.VGb6QF5r9js_mlQTGXoiDpynP6Z-zXHIQpQm90mfm38';
const USER_ID = 'b8cf413b-d632-44da-ba18-cb97399d3eb5';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function promoverParaAdmin() {
  const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
    user_metadata: { tipo: 'admin' }
  });

  if (error) {
    console.error('Erro ao promover usuário:', error);
  } else {
    console.log('Usuário promovido a admin:', data);
  }
}

promoverParaAdmin(); 