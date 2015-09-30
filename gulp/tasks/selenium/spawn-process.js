import {merge} from 'lodash';
import {join} from 'path';
import {spawn} from 'child_process';

export default function(opts) {
  const cp = spawn(join(process.cwd(), 'node_modules/webdriverio/bin/wdio'),
    [
      join(__dirname, 'wdio-config'),
      '--harmony'
    ],
    {
      stdio: 'inherit',
      env: merge({}, process.env, {
        WDIO_CONFIG: JSON.stringify(opts)
      })
    });

  return cp;
}
