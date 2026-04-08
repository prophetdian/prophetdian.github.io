import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@db.rqlucgdeuvpkkrbnvjex.supabase.co:5432/postgres';

console.log('Testing Supabase connection...');
console.log('Connection string:', connectionString.replace(/:[^@]*@/, ':***@'));

try {
  const sql = postgres(connectionString);
  
  // Test connection
  const result = await sql`SELECT NOW()`;
  console.log('✅ Connected to Supabase!');
  console.log('Current time:', result[0]);
  
  // Check if tables exist
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  
  console.log('\n📊 Database tables:');
  if (tables.length === 0) {
    console.log('❌ No tables found - migrations not run yet');
  } else {
    tables.forEach(t => console.log(`  - ${t.table_name}`));
  }
  
  await sql.end();
  
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
}
