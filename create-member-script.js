/**
 * Script untuk membuat akun test member Investoft
 * 
 * Usage: node create-member-script.js
 */

const PROJECT_ID = 'ourtzdfyqpytfojlquff'; // Ganti dengan project ID Anda
const API_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-20da1dab/create-test-member`;

// Data akun yang akan dibuat
const memberData = {
  email: 'azuranistirah@gmail.com',
  password: 'Sundala99!',
  name: 'Azura Nistirah',
  initial_balance: 0  // Saldo awal: $0
};

async function createTestMember() {
  console.log('🧪 Creating test member account...\n');
  console.log('📧 Email:', memberData.email);
  console.log('👤 Name:', memberData.name);
  console.log('💰 Initial Balance: $' + memberData.initial_balance);
  console.log('\n⏳ Please wait...\n');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to create account');
    }
    
    // Success!
    console.log('✅ SUCCESS! Account created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✉️  Email:', result.user.email);
    console.log('🆔 User ID:', result.user.id);
    console.log('👤 Name:', result.user.name);
    console.log('🎭 Role:', result.user.role);
    console.log('✅ Status:', result.user.status);
    console.log('💰 Demo Balance: $' + result.user.demo_balance.toLocaleString());
    console.log('💵 Real Balance: $' + result.user.real_balance.toLocaleString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📝 Login Credentials:');
    console.log('   Email:', memberData.email);
    console.log('   Password:', memberData.password);
    console.log('\n🚀 Account is ready to login at: /member\n');
    
    console.log('✅ Specifications:');
    console.log('   • Role: Member (bukan admin)');
    console.log('   • Initial Balance: $0 (nol)');
    console.log('   • Status: Approved (langsung aktif)');
    console.log('   • Balance management: Admin Panel only');
    console.log('   • Can login immediately: Yes ✓\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if backend server is running');
    console.error('   2. Verify PROJECT_ID is correct');
    console.error('   3. Check if email already exists');
    console.error('   4. Review backend logs for details\n');
    process.exit(1);
  }
}

// Run the script
createTestMember();
