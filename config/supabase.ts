import { createClient } from '@supabase/supabase-js';

// ⚠️ Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard → Settings → API
const SUPABASE_URL = 'https://iqplvtcimwijytirdzzt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGx2dGNpbXdpanl0aXJkenp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTE3MDQsImV4cCI6MjA4OTI2NzcwNH0.h-lmfMRTFp92bCt5zLjvhHWELPirC0sx1tSOEgfUCPM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Single storage bucket — all files go here, organized by folder
export const BUCKET = 'Acepick';

// Folder prefixes within the bucket
export const FOLDERS = {
  AVATARS: 'avatars',
  PRODUCTS: 'products',
  PORTFOLIOS: 'portfolios',
  GENERAL: 'general',
  CHAT: 'chat',
  RECORDINGS: 'recordings',
} as const;
