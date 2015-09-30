import BrowserStackTunnel from 'browserstacktunnel-wrapper';
import selenium from 'selenium-standalone';
import install from './install';
import spawn from './spawn-process';
import makeConfig from './make-config';

export default function(gulp, plugins, config) {
  const {environment} = config;
  const {gutil} = plugins;
  const {PluginError} = gutil;
  const {isDev} = environment;

  return (gulpCb) => {
    const {
      specType,
      installOpts,
      spawnOpts,
      spawnTunnelOpts,
      baseConfig,
      tunnelConfig,
      remoteConfig,
      task,
      suffix
    } = makeConfig({config, gulp});

    function runWebdriver(opts, task) {
      gutil.log(gutil.colors.magenta(`Starting Parallel Tests for [${specType || task}]`));
      return spawn(opts);
    }

    function closeCp(cp, cbFn) {
      const cbLen = cbFn.length;

      cp.on('close', (code) => {
        const message = `Child process [${specType || ''}] closed status: ${code}`;

        if (cbLen <= 1 && cbFn !== gulpCb) {
          cbFn(code);
          gutil.log(message);
          gulpCb();
          //process.exit(code);
        } else if (cbLen === 2) {
          cbFn(code, () => {
            gutil.log(message);
            cp.kill(code);
            gulpCb();
            //process.exit(code);
          });
        }
      });
    }


    if (task === 'tunnel') {
      /**
       * gulp selenium:tunnel
       * Start a Browserstack tunnel to allow using local IP's for
       * Browserstack tests (Automate) and live viewing (Live)
       */
      let browserStackTunnel = new BrowserStackTunnel(spawnTunnelOpts);

      browserStackTunnel.on('started', () => {
        gutil.log(browserStackTunnel.stdoutData);
      });

      browserStackTunnel.start((err) => {
        if (err) {
          throw new PluginError({
            plugin: '[tunnel start]',
            message: err.message
          });
        } else {
          if (suffix && suffix === 'live') {
            gutil.log('Visit BrowserStack Live to QA: https://www.browserstack.com/start');
          } else {
            const cp = runWebdriver(tunnelConfig, task);

            closeCp(cp, (code, closeCb) => {
              browserStackTunnel.stop((err) => {
                if (err) {
                  gutil.log(err);
                }

                closeCb();
              });
            });
          }
        }
      });
    } else if (isDev) {
      install(installOpts, () => {
        selenium.start(spawnOpts, (err, child) => {
          if (err) {
            throw new PluginError({
              plugin: '[selenium]',
              message: `${err.message} => pkill java`
            });
          }

          const cp = runWebdriver(baseConfig, 'local');
          closeCp(cp, (code) => {
            child.kill(code);
          });
        });
      });
    } else {
      const cp = runWebdriver(remoteConfig, 'remote');
      closeCp(cp, gulpCb);
    }
  };
}
