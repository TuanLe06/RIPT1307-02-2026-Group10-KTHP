import bcrypt from 'bcryptjs';
import pool, { testConnection } from '../config/database';

const seed = async (): Promise<void> => {
  await testConnection();

  const adminPassword = await bcrypt.hash('admin123', 12);
  const candidatePassword = await bcrypt.hash('candidate123', 12);

  await pool.execute(
    `INSERT IGNORE INTO users (email, password_hash, full_name, role, status) VALUES
     ('admin@example.com', ?, 'Admin User', 'ADMIN', 'ACTIVE'),
     ('candidate@example.com', ?, 'Candidate User', 'CANDIDATE', 'ACTIVE')`,
    [adminPassword, candidatePassword]
  );

  console.log('🌱 Seed data inserted');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Candidate: candidate@example.com / candidate123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
