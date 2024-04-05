import { execSync } from 'child_process';

// TODO add comment
export default function teardown() {
  console.log('<> Running Globalteardown <>')
  execSync('npm run e2e:cleanup-db');
};
