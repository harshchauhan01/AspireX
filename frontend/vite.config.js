// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'
// import fs from 'fs'

// export default defineConfig(({ mode }) => {
//   // console.log('🔧 Vite config is loading...');
//   // console.log('🔧 Mode:', mode);
//   // console.log('🔧 Current working directory:', process.cwd());
  
//   // Read .env file directly
//   const envPath = path.resolve(__dirname, '.env');
//   // console.log('🔧 Looking for .env at:', envPath);
  
//   let env = {};
//   try {
//     if (fs.existsSync(envPath)) {
//       // Read file as buffer to handle encoding
//       const buffer = fs.readFileSync(envPath);
//       let envContent;
      
//       // Try to detect encoding and convert
//       if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
//         // UTF-16 LE
//         envContent = buffer.toString('utf16le');
//       } else if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
//         // UTF-16 BE
//         envContent = buffer.toString('utf16be');
//       } else {
//         // UTF-8
//         envContent = buffer.toString('utf8');
//       }
      
//       // console.log('🔧 .env file content:', envContent);
      
//       // Parse .env file manually
//       envContent.split('\n').forEach(line => {
//         const trimmedLine = line.trim();
//         if (trimmedLine && !trimmedLine.startsWith('#')) {
//           const [key, ...valueParts] = trimmedLine.split('=');
//           if (key && valueParts.length > 0) {
//             const value = valueParts.join('=').trim();
//             // Remove any BOM characters from key
//             const cleanKey = key.replace(/^\uFEFF/, '').trim();
//             env[cleanKey] = value;
//           }
//         }
//       });
//     } else {
//       // console.log('❌ .env file not found at:', envPath);
//     }
//   } catch (error) {
//     // console.log('❌ Error reading .env file:', error);
//   }

//   // console.log('✅ Parsed env values:', env); // Debug output
//   // console.log('✅ API_BASE_URL from env:', env.API_BASE_URL);
//   // console.log('✅ GOOGLE_CLIENT_ID from env:', env.GOOGLE_CLIENT_ID);

//   return {
//     plugins: [react()],
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, './src'),
//       },
//     },
//     define: {
//       // Make sure env variables are available in client code
//       'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
//       'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
//     },
//   }
// })
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});