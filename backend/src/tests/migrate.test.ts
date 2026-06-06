import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationSource = readFileSync(
  resolve(__dirname, '../database/migrate.ts'),
  'utf8'
);

const testMigrationUsesTextProtocol = (): void => {
  assert.equal(
    migrationSource.includes('await pool.execute(query)'),
    false,
    'schema migrations must use pool.query(query), not pool.execute(query), because MySQL PREPARE is unsupported inside the prepared statement protocol'
  );
};

const testMigrationDoesNotUseDynamicPrepare = (): void => {
  assert.equal(
    migrationSource.includes('PREPARE stmt FROM @sql'),
    false,
    'reset-schema migrations should not run dynamic PREPARE blocks before dropping and recreating tables'
  );
};

const run = (): void => {
  testMigrationUsesTextProtocol();
  testMigrationDoesNotUseDynamicPrepare();
  console.log('PASS: migration uses text protocol for schema SQL');
  console.log('PASS: migration avoids dynamic PREPARE blocks');
};

try {
  run();
  console.log('All migration tests passed');
} catch (error) {
  console.error('Migration tests failed:', error);
  process.exit(1);
}
