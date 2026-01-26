
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hwfsiugvilwyxbxipwmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZnNpdWd2aWx3eXhieGlwd215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTkyNjMsImV4cCI6MjA3MjMzNTI2M30.ReO6hsFAS8GQ37IsDA5An3o9NPrnT784ppLaxjvsO6E';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
    const email = `test_script_${Math.floor(Math.random() * 10000)}@gmail.com`;
    const password = 'password123';

    console.log('Testing signup for:', email);
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'Test Script',
                    role: 'student'
                }
            }
        });

        if (error) {
            console.error('Signup error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Signup success:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testSignup();
