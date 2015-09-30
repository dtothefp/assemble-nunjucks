import {resolve} from 'path';
import {Server} from 'karma';

export default function() {
  return (cb) => {
    let server = new Server({
      port: 9876,
      configFile: resolve(__dirname, '.', 'karma-config.js'),
      singleRun: false
    }, cb);

    server.start();
  };
}

