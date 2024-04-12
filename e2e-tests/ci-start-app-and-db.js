/**
 * We use this script rather than running `wasp start` normally in the CI due to an error where prisma hangs due to some stdin issue.
 * Running it this way gives us more control over that and avoids it hanging. See https://github.com/wasp-lang/wasp/pull/1218#issuecomment-1599098272.
 */

const cp = require('child_process');
const readline = require('linebyline');

function spawn(name, cmd, args, done) {
  try {
    const spawnOptions = {
      detached: false,
    };
    const proc = cp.spawn(cmd, args, spawnOptions);
    console.log('\x1b[0m\x1b[33m', `Starting ${name} with command: ${cmd} ${args.join(' ')}`, '\x1b[0m');

    // We close stdin stream on the new process because otherwise the start-app
    // process hangs.
    // See https://github.com/wasp-lang/wasp/pull/1218#issuecomment-1599098272.
    proc.stdin.destroy();

    readline(proc.stdout).on('line', (data) => {
      console.log(`\x1b[0m\x1b[33m[${name}][out]\x1b[0m ${data}`);
    });
    readline(proc.stderr).on('line', (data) => {
      console.log(`\x1b[0m\x1b[33m[${name}][err]\x1b[0m ${data}`);
    });
    proc.on('exit', done);
  } catch (error) {
    console.error(error);
  }
}

// Exit if either child fails
const cb = (code) => {
  if (code !== 0) {
    process.exit(code);
  } 
};
spawn('app', 'npm', ['run', 'ci:e2e:start-app'], cb);
spawn('db', 'npm', ['run', 'ci:e2e:start-db'], cb);
