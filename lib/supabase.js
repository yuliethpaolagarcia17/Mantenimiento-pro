import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://liankchabpezpvowcgmf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYW5rY2hhYnBlenB2b3djZ21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTU4NjQsImV4cCI6MjA5ODQzMTg2NH0.ftLM59OngRr5NzbTClp4xk9SlXO2E75yx7Q2CyV9d_s'
)
