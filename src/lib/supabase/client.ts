import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    'https://qhttfjwbcabtoyrlwfzp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodHRmandiY2FidG95cmx3ZnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzE5NDAsImV4cCI6MjA3MzQ0Nzk0MH0.bzecnKMFA3cuQQnvC5E9Kbo9E77rIvydNkp-z97EGhw'
)
