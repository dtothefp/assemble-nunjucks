import {spawnSync} from 'child_process';

export default function(gulp, plugins, config) {
  const {gutil} = plugins;
  const {utils} = config;
  const {addbase} = utils;

  return () => {
    const {error, status} = spawnSync(
      'node',
      [
        addbase('fastly.js'),
        '--harmony'
      ],
      {stdio: 'inherit'}
    );

    if (error) {
      new gutil.PluginError('[fastly: purge]', error, {showStack: true});
    }

    gutil.log(gutil.colors.magenta(`Fastly Purge exited with a status of ${status}`));
    process.exit(status);
  };
}
