import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { Wait } from 'testcontainers';

let container;

export async function setupTestContainer() {
  container = await new PostgreSqlContainer()
    .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'))
    .start();

  const mappedPort = container.getMappedPort(5432);
  const host = container.getHost();
  const database = container.getDatabase();
  const username = container.getUsername();
  const password = container.getPassword();

  process.env.DATABASE_URL = `postgresql://${username}:${password}@${host}:${mappedPort}/${database}`;
  execSync('npx prisma migrate deploy --preview-feature', { stdio: 'inherit' });
}

export async function teardownTestContainer() {
  if (container) {
    execSync('npx prisma migrate reset --force');
    await container.stop();
  }
}
