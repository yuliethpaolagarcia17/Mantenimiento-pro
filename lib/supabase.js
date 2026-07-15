import { createBrowserClient } from '@supabase/ssr'

export const SUPABASE_URL = 'https://liankchabpezpvowcgmf.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYW5rY2hhYnBlenB2b3djZ21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTU4NjQsImV4cCI6MjA5ODQzMTg2NH0.ftLM59OngRr5NzbTClp4xk9SlXO2E75yx7Q2CyV9d_s'

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
