#!/usr/bin/env node

/**
 * Test Script for AI Agent Connection
 * Run: node test-ai-agent.js
 */

const AI_AGENT_URL = process.env.AI_AGENT_API_URL || "http://localhost:8000";

console.log("\n🧪 Testing AI Agent Connection...\n");
console.log(`📍 AI Agent URL: ${AI_AGENT_URL}\n`);

// Test 1: Health Check
async function testHealth() {
  console.log("═══════════════════════════════════════");
  console.log("TEST 1: Health Check");
  console.log("═══════════════════════════════════════");
  
  try {
    const response = await fetch(`${AI_AGENT_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Response:", JSON.stringify(data, null, 2));
      console.log("✅ Health check PASSED\n");
      return true;
    } else {
      console.log("❌ Health check FAILED - Bad status\n");
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check FAILED: ${error.message}\n`);
    return false;
  }
}

// Test 2: Chat Query
async function testChat() {
  console.log("═══════════════════════════════════════");
  console.log("TEST 2: Chat Query");
  console.log("═══════════════════════════════════════");
  
  try {
    const testQuery = "hello";
    console.log(`Sending query: "${testQuery}"`);
    
    const response = await fetch(`${AI_AGENT_URL}/chat/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: testQuery, 
        pair: "BTC/USDT" 
      }),
      signal: AbortSignal.timeout(10000),
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Response:", JSON.stringify(data, null, 2));
      
      if (data.answer && data.answer.length > 0) {
        console.log("✅ Chat query PASSED\n");
        return true;
      } else {
        console.log("⚠️ Chat query returned empty answer\n");
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Chat query FAILED: ${errorText}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Chat query FAILED: ${error.message}\n`);
    return false;
  }
}

// Test 3: Multiple Queries
async function testMultipleQueries() {
  console.log("═══════════════════════════════════════");
  console.log("TEST 3: Multiple Queries");
  console.log("═══════════════════════════════════════");
  
  const queries = [
    "what is cryptocurrency?",
    "analyze BTC",
    "how to automate trading?"
  ];
  
  let passed = 0;
  
  for (const query of queries) {
    try {
      console.log(`\nQuery: "${query}"`);
      
      const response = await fetch(`${AI_AGENT_URL}/chat/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, pair: "BTC/USDT" }),
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const data = await response.json();
        const preview = data.answer ? data.answer.substring(0, 100) + "..." : "EMPTY";
        console.log(`Response preview: ${preview}`);
        console.log(`✅ Query succeeded`);
        passed++;
      } else {
        console.log(`❌ Query failed (status ${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Query failed: ${error.message}`);
    }
  }
  
  console.log(`\n${passed}/${queries.length} queries passed`);
  return passed === queries.length;
}

// Run all tests
async function runTests() {
  const results = {
    health: false,
    chat: false,
    multiple: false
  };
  
  results.health = await testHealth();
  
  if (results.health) {
    results.chat = await testChat();
    if (results.chat) {
      results.multiple = await testMultipleQueries();
    }
  } else {
    console.log("⚠️ Skipping chat tests because health check failed\n");
  }
  
  // Summary
  console.log("\n═══════════════════════════════════════");
  console.log("SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`Health Check:      ${results.health ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Chat Query:        ${results.chat ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Multiple Queries:  ${results.multiple ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = results.health && results.chat && results.multiple;
  
  if (allPassed) {
    console.log("\n🎉 ALL TESTS PASSED! AI Agent is working correctly.\n");
  } else {
    console.log("\n❌ SOME TESTS FAILED. Check the output above for details.\n");
    console.log("Troubleshooting:");
    console.log("1. Make sure AI Agent is running: python ai-agent/main.py");
    console.log("2. Check if port 8000 is accessible");
    console.log("3. Verify .env has: AI_AGENT_API_URL=http://localhost:8000");
    console.log("4. Check firewall settings\n");
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error("❌ Test runner failed:", error);
  process.exit(1);
});
