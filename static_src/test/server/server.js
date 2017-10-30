import hapi from "hapi";
import inert from "inert";
import smocks from "smocks";
import smocksHapi from "smocks/hapi";

import pkg from "../../../package.json";
import registerAuthStatusRoutes from "./auth_status";
import registerAPIRoutes from "./api";

smocks.id("cg-dashboard-testing");

registerAuthStatusRoutes(smocks);
registerAPIRoutes(smocks);

// start starts the server.
// If port is not provided, the system will choose one automatically.
// A callback should be provided which is notified when the server starts.
const start = ({ port, callback }) => {
  const s = new hapi.Server();

  s.connection({ port });

  // Configure smocks as a hapi plugin.
  const smocksPlugin = smocksHapi.toPlugin();
  smocksPlugin.attributes = { pkg };

  s.register([inert, smocksPlugin]);

  // Serve static assets.
  s.route({
    method: "get",
    path: "/assets/{p*}",
    handler: {
      directory: {
        path: "static/assets"
      }
    }
  });
  s.route({
    method: "get",
    path: "/skins/{p*}",
    handler: {
      directory: {
        path: "static/skins"
      }
    }
  });
  s.route({
    method: "get",
    path: "/{p*}",
    handler: {
      directory: {
        path: "templates/web"
      }
    }
  });

  s.start(callback);

  return s;
};

export default start;
