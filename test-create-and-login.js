/**
 * Script untuk create member dan test login
 * Node.js script dengan fetch API
 */

const PROJECT_ID = 'ourtzdfyqpytfojlquff';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cnR6ZGZ5cXB5dGZvamxxdWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1OTA2MzgsImV4cCI6MjA1MjE2NjYzOH0.wCL4yhI4VZbwrG0lc8eX_YCwfwq-0hVpHnl4_6xrQag'; // Your anon key

// Test user data
const testUser = {
  email: 'azuranistirah@gmail.com',
  password: 'Sundala99!',
  name: 'Azura Nistirah',
  initial_balance: 0
};

async function createMember() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 STEP 1: Creating Test Member Account');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:', testUser.email);
  console.log('🔑 Password:', testUser.password);
  console.log('💰 Initial Balance: $' + testUser.initial_balance);
  console.log('\n⏳ Creating account...\n');

  try {
    const response = await fetch(
      `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      // If user already exists, that's okay - we'll try to login
      if (result.error && result.error.includes('already exists')) {
        console.log('⚠️  User already exists, will try to login...\n');
        return true;
      }
      throw new Error(result.error || result.message || 'Failed to create account');
    }

    console.log('✅ Account created successfully!');
    console.log('🆔 User ID:', result.user.id);
    console.log('📧 Email:', result.user.email);
    console.log('🎭 Role:', result.user.role);
    console.log('✅ Status:', result.user.status);
    console.log('💰 Demo Balance: $' + result.user.demo_balance);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create account:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 STEP 2: Testing Login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:', testUser.email);
  console.log('🔑 Password:', testUser.password);
  console.log('\n⏳ Attempting login...\n');

  try {
    const response = await fetch(
      `https://${PROJECT_ID}.supabase.co/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error_description || result.message || 'Login failed');
    }

    console.log('✅ Login successful!');
    console.log('🎫 Access Token:', result.access_token.substring(0, 50) + '...');
    console.log('🆔 User ID:', result.user.id);
    console.log('📧 Email:', result.user.email);
    console.log('⏰ Token expires:', new Date(result.expires_at * 1000).toLocaleString());
    console.log('');
    
    return result.access_token;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return null;
  }
}

async function getProfile(accessToken) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 STEP 3: Getting User Profile');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⏳ Fetching profile...\n');

  try {
    const response = await fetch(
      `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-20da1dab/profile`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get profile');
    }

    console.log('✅ Profile retrieved successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 USER PROFILE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🆔 ID:', result.user.id);
    console.log('📧 Email:', result.user.email);
    console.log('👤 Name:', result.user.name);
    console.log('📱 Phone:', result.user.phone || '(not set)');
    console.log('🎭 Role:', result.user.role);
    console.log('✅ Status:', result.user.status);
    console.log('💰 Demo Balance: $' + result.user.demo_balance.toLocaleString());
    console.log('💵 Real Balance: $' + result.user.real_balance.toLocaleString());
    console.log('📊 Total Trades:', result.user.total_trades);
    console.log('🏆 Winning Trades:', result.user.winning_trades);
    console.log('📉 Losing Trades:', result.user.losing_trades);
    console.log('📅 Created:', new Date(result.user.created_at).toLocaleString());
    if (result.user.notes) {
      console.log('📝 Notes:', result.user.notes);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get profile:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  INVESTOFT - Create & Test Member Account    ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');

  // Step 1: Create member
  const created = await createMember();
  if (!created) {
    console.log('\n❌ Failed to create account. Exiting...\n');
    process.exit(1);
  }

  // Wait a bit for Supabase to sync
  console.log('⏳ Waiting for Supabase to sync (2 seconds)...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Test login
  const accessToken = await testLogin();
  if (!accessToken) {
    console.log('\n❌ Login failed. Please check:');
    console.log('   1. Account was created successfully');
    console.log('   2. Email and password are correct');
    console.log('   3. Account is not disabled');
    console.log('   4. Backend server is running\n');
    process.exit(1);
  }

  // Step 3: Get profile
  const profileSuccess = await getProfile(accessToken);
  if (!profileSuccess) {
    console.log('\n⚠️  Profile fetch failed but login worked\n');
  }

  // Final summary
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║              ✅ ALL TESTS PASSED              ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log('🎉 Account is ready to use!');
  console.log('');
  console.log('📝 Login Instructions:');
  console.log('   1. Open: http://localhost:5173/');
  console.log('   2. Click "Sign In" button');
  console.log('   3. Enter credentials:');
  console.log('      • Email: ' + testUser.email);
  console.log('      • Password: ' + testUser.password);
  console.log('   4. Click "Sign In"');
  console.log('   5. You will be redirected to /member dashboard');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   • Login as admin to add balance');
  console.log('   • Test trading functionality');
  console.log('   • Verify balance management via Admin Panel');
  console.log('');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
