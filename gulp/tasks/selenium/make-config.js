import {join} from 'path';
import {assign, pick, isArray, isString} from 'lodash';
import getTask from './get-task';

const devices = {
  desktop: {
    'firefox': '',
    'chrome': '',
    'internet explorer': '',
    'safari': '',
    'opera': ''
  },
  mobile: {
    'iPad': '',
    'iPhone': '8.3',
    'android': ''
  }
};

const mobile = [
  'iPhone'
];

const desktop = [
  'firefox',
  'chrome'
];

function makeBaseCaps(caps) {
  return Object.keys(caps).reduce((list, device) => {
    const memo = {};
    const version = caps[device];

    if (isArray(version)) {
      version.forEach(v => {
        const o = {};
        o.browserName = device;
        o.version = v;
        list.push(o);
      });
    } else if (isString(version) && version.length) {
      memo.browserName = device;
      memo.version = version;
      list.push(memo);
    } else {
      memo.browserName = device;
      list.push(memo);
    }

    return list;
  }, []);
}

export default function({config, gulp}) {
  const SELENIUM_VERSION = '2.47.0';
  const {ENV, file, sources, browser, pkg, utils} = config;
  const {name, version} = pkg;
  const {devHost, devPort, hotPort} = sources;
  const specGlob = '**/*-spec';
  const {task, suffix} = getTask({gulp, utils});
  let capConfig, specDir, specType;

  if (suffix === 'mobile' || task === 'desktop') {
    specType = suffix || task;
    /*eslint-disable*/
    capConfig = pick(devices[specType], eval(specType));
    /*eslint-enable*/
    specDir = `${specType}/`;
  } else if (task === 'tunnel') {
    capConfig = assign({}, devices.mobile, devices.desktop);
    capConfig = pick(capConfig, [...mobile, ...desktop]);
  } else {
    capConfig = pick(devices.desktop, desktop);
    specDir = 'desktop/';
    specType = 'desktop';
  }

  const specs = [ join(`test/e2e/${specDir || ''}`, `${file || specGlob}.js`) ];
  const caps = makeBaseCaps(capConfig);

  const capabilities = browser ?
    caps.filter( cap => cap.browserName === browser) :
    caps;

  const groupConfig = {
    project: name,
    build: version,
    name: file || 'e2e'
  };

  const baseConfig = {
    specType,
    browser,
    ENV,
    specs,
    capabilities,
    baseUrl: `${devHost}:${devPort}`
  };

  function addCaps(opts) {
    const bsOpts = {
      host: 'hub.browserstack.com',
      port: 80,
      user: process.env.BROWSERSTACK_USERNAME,
      key: process.env.BROWSERSTACK_API,
      logLevel: 'silent'
    };

    const capabilities = baseConfig.capabilities.map(cap => {
      return assign({}, cap, opts.capabilities, groupConfig);
    });

    return assign({}, baseConfig, bsOpts, opts, {capabilities});
  }

  const tunnelConfig = {
    capabilities: {
      'browserstack.local': 'true',
      'browserstack.debug': 'true'
    },
    baseUrl: `${devHost}:${devPort}`
  };

  const remoteConfig = {
    capabilities: {
      'browserstack.debug': 'true'
    },
    baseUrl: 'http://hrc.dev.thegroundwork.com'
  };

  const installOpts = {
    version: SELENIUM_VERSION
  };

  const spawnOpts = {
    version: SELENIUM_VERSION,
    spawnOptions: {
      stdio: 'ignore'
    }
  };

  const spawnTunnelOpts = {
    key: process.env.BROWSERSTACK_API,
    hosts: [
      {
        name: devHost,
        port: devPort,
        sslFlag: 0
      },
      {
        name: devHost,
        port: hotPort,
        sslFlag: 0
      }
    ],
    v: true,
    //important to omit identifier
    //localIdentifier: 'my_tunnel', // optionally set the -localIdentifier option
    forcelocal: true
  };

  const retData = {
    specType,
    installOpts,
    spawnOpts,
    baseConfig,
    spawnTunnelOpts,
    tunnelConfig: addCaps(tunnelConfig),
    remoteConfig: addCaps(remoteConfig),
    task,
    suffix
  };

  return retData;
}
