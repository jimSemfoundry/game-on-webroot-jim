#!/usr/bin/env node

/**
 * Script to update theme configuration in Cloudflare KV
 * Usage: node scripts/update-theme-config.js [config-file.json]
 */

import fs from 'fs';
import path from 'path';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;

if (!CLOUDFLARE_API_TOKEN || !ACCOUNT_ID || !KV_NAMESPACE_ID) {
  console.error('❌ Missing required environment variables:');
  console.error('   CLOUDFLARE_API_TOKEN');
  console.error('   CLOUDFLARE_ACCOUNT_ID');
  console.error('   CLOUDFLARE_KV_NAMESPACE_ID');
  process.exit(1);
}

async function updateThemeConfig(configPath) {
  try {
    // Read and validate config file
    const configFile = configPath || 'public/theme-config.json';
    const configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    
    // Add timestamp
    configData.brandConfig = {
      ...configData.brandConfig,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('📝 Updating theme configuration...');
    console.log('Current theme:', configData.currentTheme);
    
    // Update KV storage
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/current`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      }
    );
    
    if (response.ok) {
      console.log('✅ Theme configuration updated successfully!');
      console.log('🔄 Changes will be live within 60 seconds globally');
    } else {
      const error = await response.text();
      console.error('❌ Failed to update configuration:', error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
const configPath = process.argv[2];
updateThemeConfig(configPath); 