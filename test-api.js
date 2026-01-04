// Test script to check Google API connectivity
// Run with: node test-api.js

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCb-p5m7QpeQuPVwN5w8j5YiSW2f0qWInE';
const BASE_URL = process.env.BASE_URL;

async function testDirectAPI() {
  console.log('\n========================================');
  console.log('Test 1: Direct Google API (no proxy)');
  console.log('========================================');

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    console.log(`Fetching: ${url.replace(API_KEY, '***')}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'x-goog-api-key': API_KEY,
      }
    });
    clearTimeout(timeout);

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS! Models available:');
      data.models?.forEach(m => {
        console.log(`   - ${m.name}`);
      });
      return true;
    } else {
      const text = await response.text();
      console.log(`\n❌ FAILED: ${text}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('\n❌ TIMEOUT (10s) - Network blocked or slow');
    } else {
      console.log(`\n❌ ERROR: ${error.message}`);
    }
    return false;
  }
}

async function testProxyAPI() {
  if (!BASE_URL) {
    console.log('\n========================================');
    console.log('Test 2: Proxy API - SKIPPED (no BASE_URL)');
    console.log('========================================\n');
    return null;
  }

  console.log('\n========================================');
  console.log(`Test 2: Proxy API (${BASE_URL})`);
  console.log('========================================');

  try {
    const url = `${BASE_URL}/v1beta/models?key=${API_KEY}`;
    console.log(`Fetching: ${url.replace(API_KEY, '***')}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'x-goog-api-key': API_KEY,
      }
    });
    clearTimeout(timeout);

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS! Proxy works!');
      console.log('   Response:', JSON.stringify(data).slice(0, 100) + '...');
      return true;
    } else {
      const text = await response.text();
      console.log(`\n❌ FAILED: ${text}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('\n❌ TIMEOUT (10s) - Proxy not responding');
    } else {
      console.log(`\n❌ ERROR: ${error.message}`);
    }
    return false;
  }
}

async function testGenerate() {
  console.log('\n========================================');
  console.log('Test 3: Generate Content (simple test)');
  console.log('========================================');

  const url = BASE_URL
    ? `${BASE_URL}/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`
    : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

  console.log(`Using: ${BASE_URL ? 'PROXY' : 'DIRECT'}`);
  console.log(`Model: gemini-2.0-flash-exp`);

  const body = {
    contents: [{
      parts: [{ text: 'Say "Hello" in one word.' }]
    }]
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`\n✅ SUCCESS! AI replied: "${text}"`);
      return true;
    } else {
      const text = await response.text();
      console.log(`\n❌ FAILED: ${text}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('\n❌ TIMEOUT (30s)');
    } else {
      console.log(`\n❌ ERROR: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('═════════════════════════════════════════════');
  console.log('   Google API Connectivity Test');
  console.log('═════════════════════════════════════════════');
  console.log(`API Key: ${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}`);
  console.log(`BASE_URL: ${BASE_URL || '(none - using direct)'}`);
  console.log(`Node.js version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);

  const directOK = await testDirectAPI();
  const proxyOK = await testProxyAPI();
  const genOK = await testGenerate();

  console.log('\n═════════════════════════════════════════════');
  console.log('   SUMMARY');
  console.log('═════════════════════════════════════════════');
  console.log(`Direct API: ${directOK ? '✅ OK' : '❌ FAIL'}`);
  console.log(`Proxy API:  ${proxyOK === null ? '⚪ SKIPPED' : proxyOK ? '✅ OK' : '❌ FAIL'}`);
  console.log(`Generate:   ${genOK ? '✅ OK' : '❌ FAIL'}`);

  if (!directOK && !proxyOK) {
    console.log('\n⚠️  No connectivity! You need to:');
    console.log('   1. Use a proxy/VPN');
    console.log('   2. Or set BASE_URL to a working proxy');
  } else if (directOK && !BASE_URL) {
    console.log('\n✅ Direct access works! You can deploy to Vercel.');
  } else if (proxyOK) {
    console.log('\n✅ Proxy works! Keep using BASE_URL.');
  }

  console.log('');
}

main();
