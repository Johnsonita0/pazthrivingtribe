const path = require('node:path');
const { parseProjectEnv } = require('@expo/env');

const rootEnv = parseProjectEnv(path.resolve(__dirname, '..'), {
  mode: process.env.NODE_ENV || 'development',
  silent: true,
}).env;

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    ['expo-image-picker', { photosPermission: 'PAZ uses your selected photo as your customer profile picture.' }],
  ],
  extra: {
    ...config.extra,
    supabaseUrl:
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      rootEnv.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      rootEnv.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      rootEnv.SUPABASE_URL ||
      '',
    supabaseAnonKey:
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      rootEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      rootEnv.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      rootEnv.SUPABASE_ANON_KEY ||
      '',
  },
});