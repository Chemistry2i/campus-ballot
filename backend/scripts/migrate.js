/**
 * Database Migration Runner
 * Executes pending migrations and tracks migration history
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Migration tracking model
const migrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    executedAt: {
        type: Date,
        default: Date.now
    },
    version: String,
    status: {
        type: String,
        enum: ['success', 'failed', 'rolled_back'],
        default: 'success'
    },
    error: String
});

const Migration = mongoose.model('Migration', migrationSchema);

/**
 * Run all pending migrations
 */
async function runMigrations() {
    try {
        console.log('\n🔄 Starting database migrations...\n');

        // Connect to database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-ballot');
            console.log('✓ Connected to database\n');
        }

        const db = mongoose.connection.db;
        const migrationsDir = path.join(__dirname, '../migrations');

        // Get all migration files
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.js'))
            .sort();

        console.log(`Found ${files.length} migration(s)\n`);

        // Check which migrations have been executed
        for (const file of files) {
            const migrationName = file.replace('.js', '');
            const migrationPath = path.join(migrationsDir, file);

            try {
                // Check if already executed
                const existing = await Migration.findOne({ name: migrationName });

                if (existing) {
                    console.log(`⏭️  Skipping ${migrationName} (already executed)`);
                    continue;
                }

                console.log(`▶️  Running ${migrationName}...`);

                // Load and execute migration
                const migration = require(migrationPath);

                if (!migration.up) {
                    throw new Error('Migration missing "up" function');
                }

                // Execute migration
                await migration.up(db);

                // Record successful migration
                await Migration.create({
                    name: migrationName,
                    status: 'success'
                });

                console.log(`✓ ${migrationName} completed\n`);

            } catch (error) {
                console.error(`✗ ${migrationName} failed: ${error.message}\n`);

                // Record failed migration
                await Migration.create({
                    name: migrationName,
                    status: 'failed',
                    error: error.message
                });

                // For critical migrations, stop execution
                if (file.startsWith('CRITICAL_')) {
                    console.error('🛑 Critical migration failed. Stopping.\n');
                    throw error;
                }
            }
        }

        console.log('✓ All migrations completed successfully!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * Rollback last n migrations
 */
async function rollback(count = 1) {
    try {
        console.log(`\n⏮️  Rolling back ${count} migration(s)...\n`);

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-ballot');
        }

        const db = mongoose.connection.db;
        const migrationsDir = path.join(__dirname, '../migrations');

        // Get migrations to rollback
        const executed = await Migration.find({ status: 'success' })
            .sort({ executedAt: -1 })
            .limit(count);

        if (executed.length === 0) {
            console.log('No migrations to rollback');
            return;
        }

        // Get all migration files
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.js'));

        // Rollback in reverse order
        for (const migration of executed) {
            const file = files.find(f => f.replace('.js', '') === migration.name);

            if (!file) {
                console.warn(`⚠️  Migration file not found: ${migration.name}`);
                continue;
            }

            try {
                const migrationPath = path.join(migrationsDir, file);
                const migrationModule = require(migrationPath);

                if (!migrationModule.down) {
                    console.warn(`⚠️  ${migration.name} has no rollback function`);
                    continue;
                }

                console.log(`▶️  Rolling back ${migration.name}...`);
                await migrationModule.down(db);

                // Update status
                await Migration.updateOne(
                    { name: migration.name },
                    { status: 'rolled_back' }
                );

                console.log(`✓ ${migration.name} rolled back\n`);

            } catch (error) {
                console.error(`✗ Rollback failed for ${migration.name}: ${error.message}\n`);
            }
        }

        console.log('✓ Rollback completed\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Rollback failed:', error.message);
        process.exit(1);
    }
}

/**
 * Show migration status
 */
async function status() {
    try {
        console.log('\n📊 Migration Status\n');

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-ballot');
        }

        const migrations = await Migration.find()
            .sort({ executedAt: -1 });

        if (migrations.length === 0) {
            console.log('No migrations executed yet');
            process.exit(0);
        }

        console.log('Executed Migrations:');
        console.log('---');

        migrations.forEach(m => {
            const icon = m.status === 'success' ? '✓' : '✗';
            console.log(`${icon} ${m.name}`);
            console.log(`  Status: ${m.status}`);
            console.log(`  Date: ${m.executedAt.toISOString()}`);
            if (m.error) {
                console.log(`  Error: ${m.error}`);
            }
            console.log('');
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Status check failed:', error.message);
        process.exit(1);
    }
}

// CLI
const command = process.argv[2];

switch (command) {
    case 'up':
        runMigrations();
        break;
    case 'down':
        rollback(parseInt(process.argv[3]) || 1);
        break;
    case 'status':
        status();
        break;
    default:
        console.log(`
Database Migration Tool

Usage:
  npm run migrate up       - Run all pending migrations
  npm run migrate down [n] - Rollback last n migrations (default: 1)
  npm run migrate status   - Show migration status

Environment Variables:
  MONGODB_URI - MongoDB connection string
        `);
        process.exit(0);
}
