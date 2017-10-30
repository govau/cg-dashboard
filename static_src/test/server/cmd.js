import childProcess from "child_process";

import start from "./server";

let server;

const stopServer = cb => {
  if (!server) {
    setImmediate(cb);
    return;
  }

  server.stop(cb);
};

const cleanup = () => {
  stopServer(error => {
    process.exit(!!error);
  });
};

const spawnChild = (command, args) => err => {
  if (err) {
    throw err;
  }

  /* eslint-disable no-console */
  console.log(
    `Started smocks server on ${server.info.port}. Visit ${server.info
      .uri}/_admin to configure.`
  );
  /* eslint-enable no-console */

  if (!command) {
    // No arguments passed, just leave the test server running for manual
    // testing.
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    return;
  }

  // Kick off the main process.
  const main = childProcess.spawn(command, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: server.info.port
    }
  });

  main.on("close", exitCode => {
    stopServer(error => {
      if (error) {
        console.error(error); // eslint-disable-line no-console
      }

      // Make sure to exit with the main's code or error if main was OK.
      process.exit(exitCode || !!error);
    });
  });

  const connectSignal = signal => {
    process.on(signal, () => {
      main.kill(signal);
    });
  };

  // Forward signals to main
  connectSignal("SIGINT");
  connectSignal("SIGTERM");
};

export const run = () => {
  const args = process.argv.slice(2);
  const command = args.shift();
  const port = process.env.PORT;

  server = start({ port, callback: spawnChild(command, args) });
};
