import {readdirSync as read} from 'fs';
import {join} from 'path';

export default function() {
  return read(join(process.cwd(), 'node_modules')).reduce((o, mod) => {
    if (mod !== '.bin') {
      o[mod] = `commonjs ${mod}`;
    }
    return o;
  }, {});
}
