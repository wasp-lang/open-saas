const cp = require('child_process');
const readline = require('linebyline');

function spawn(name, cmd, args, done) {
  const spawnOptions = {
    detached: true,
  };
  const proc = cp.spawn(cmd, args, spawnOptions);

  proc.stdin.destroy();

  readline(proc.stdout).on('line', (data) => {
    console.log(`\x1b[0m\x1b[33m[${name}][out]\x1b[0m ${data}`);
  });
  readline(proc.stderr).on('line', (data) => {
    console.log(`\x1b[0m\x1b[33m[${name}][err]\x1b[0m ${data}`);
  });
  proc.on('exit', done);
}

const cb = (code) => {
  if (code !== 0) {
    process.exit(code);
  }
};

spawn(
  'db-cleanup',
  'sh',
  [
    '-c',
    `
    containers=$(docker container ls -f name=^wasp-dev-db-OpenSaaS- -q)
    if [ -n "$containers" ]; then
      docker container rm $containers -f
    fi
    volumes=$(docker volume ls -f name=^wasp-dev-db-OpenSaaS- -q)
    if [ -n "$volumes" ]; then
      docker volume rm $volumes -f
    fi
    `,
  ],
  cb
);

spawn('db', 'wasp', ['start', 'db'], cb);

spawn('wait-for-db', 'npx', ['wait-port', '5432'], cb);

spawn('db-migrate', 'wasp', ['db', 'migrate-dev'], cb);

spawn('app', 'wasp', ['start'], cb);
