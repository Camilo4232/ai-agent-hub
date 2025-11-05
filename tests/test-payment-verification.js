/**
 * Test Script for HTTP 402 Payment Verification
 *
 * This script tests that the backend properly returns HTTP 402 errors
 * when payments are missing or invalid.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

console.log('🧪 Testing Payment Verification\n');
console.log(`API URL: ${BASE_URL}\n`);
console.log('='.repeat(70));

// Test scenarios
const tests = [
    {
        name: 'Missing Payment ID',
        description: 'Query without any payment ID should return 402',
        request: {
            url: `${BASE_URL}/api/agents/weather/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: 'weather in tokyo'
            })
        },
        expectedStatus: 402,
        expectedError: 'PAYMENT_MISSING'
    },
    {
        name: 'Invalid Payment ID',
        description: 'Query with invalid payment ID should return 402',
        request: {
            url: `${BASE_URL}/api/agents/weather/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Payment-Id': 'invalid_payment_12345'
            },
            body: JSON.stringify({
                query: 'weather in tokyo',
                paymentId: 'invalid_payment_12345'
            })
        },
        expectedStatus: 402,
        expectedError: 'PAYMENT_INVALID'
    },
    {
        name: 'Non-existent Payment',
        description: 'Query with non-existent payment ID should return 402',
        request: {
            url: `${BASE_URL}/api/agents/fashion/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Payment-Id': 'pay_99999999999_nonexistent'
            },
            body: JSON.stringify({
                query: 'fashion advice for tokyo',
                paymentId: 'pay_99999999999_nonexistent'
            })
        },
        expectedStatus: 402,
        expectedError: 'PAYMENT_INVALID'
    },
    {
        name: 'Empty Payment ID in Header',
        description: 'Query with empty X-Payment-Id header should return 402',
        request: {
            url: `${BASE_URL}/api/agents/activities/query`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Payment-Id': ''
            },
            body: JSON.stringify({
                query: 'things to do in tokyo'
            })
        },
        expectedStatus: 402,
        expectedError: 'PAYMENT_MISSING'
    }
];

// Helper function to run a test
async function runTest(test) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`   ${test.description}`);

    try {
        const response = await fetch(test.request.url, {
            method: test.request.method,
            headers: test.request.headers,
            body: test.request.body
        });

        const data = await response.json();

        // Check status code
        if (response.status === test.expectedStatus) {
            console.log(`   ✅ Status: ${response.status} (Expected: ${test.expectedStatus})`);
        } else {
            console.log(`   ❌ Status: ${response.status} (Expected: ${test.expectedStatus})`);
            return false;
        }

        // Check error code
        if (data.code === test.expectedError) {
            console.log(`   ✅ Error Code: ${data.code} (Expected: ${test.expectedError})`);
        } else {
            console.log(`   ❌ Error Code: ${data.code || 'N/A'} (Expected: ${test.expectedError})`);
            return false;
        }

        // Check error message exists
        if (data.error && data.message) {
            console.log(`   ✅ Error Message: "${data.message}"`);
        } else {
            console.log(`   ⚠️  Warning: Error message missing or incomplete`);
        }

        console.log(`   ✅ Test PASSED`);
        return true;

    } catch (error) {
        console.log(`   ❌ Test FAILED: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('\n🚀 Starting Payment Verification Tests\n');

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = await runTest(test);
        if (result) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 Test Results');
    console.log('='.repeat(70));
    console.log(`   Total Tests: ${tests.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! Payment verification is working correctly.\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please check the backend payment verification.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('\n❌ Test runner error:', error);
    process.exit(1);
});
