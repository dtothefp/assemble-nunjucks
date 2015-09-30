### Frontend Build Boilerplate

![](http://i.imgur.com/hsQwU0a.gif)

#### Get Started
```sh
gulp watch
gulp build

```

#### Test
```sh
gulp test:integration
gulp test:e2e # run local server in separate tab
gulp test:tunnel # run local server in separate tab
gulp test:tunnel:live # run local server in separate tab
```

#### Flags
```sh
-b <browser> <browser to test e2e - default to parallel firefox and chrom>
-e <environment> <dev> <prod>
-f <file> <filename to test integration or e2e>
-r <release> <compiles bundle for es6 to es5 without externals>
-q <quick> <quick prod build without uglify and SCSS compression>
```

#### Entry Point / Source of Truth
- `gulp/config/index.js`

#### Structure
```sh
./src
├── components # can do React stuff here and locally scope css
│   ├── local.css
│   └── sample.jsx
├── global.js # bootstraps sass bundle and compiles index.html, ignored in prod
├── index.html # lodash templated through Webpack
├── index.js # main entry point for JS
└── scss
    └── global.scss # main entry point for global SCSS

./test
├── config
│   ├── e2e-setup.js # don't touch this
│   └── karma-index.js # or this
├── e2e
│   └── sample-spec.js # end to end tests using Selenium Webdriver
└── integration
    ├── another-spec.js # integration tests using Karma
    └── sample-spec.js

./gulp
├── config
│   ├── babelhook.js # used by Mocha for es6 love
│   ├── dash-to-camel.js # utility
│   ├── gulp-taskname.js # hack allows us to access Gulp current task name
│   ├── index.js # main entry point for asset paths and environmental config
│   └── make-gulp-config.js # bootstraps the process and requires all Gulp callbacks
└── tasks
    ├── browser-sync.js # serves from `devPort` and proxies Webpack Dev Server
    ├── clean.js # cleans `dist`
    ├── eslint
    │   └── index.js # import @hfa/eslint-config
    ├── karma
    │   ├── index.js # starts Karma server
    │   └── karma-config.js # imports Webpack config to compile es6 specs in `integration` folder
    ├── selenium
    │   ├── index.js
    │   ├── install.js # installs local Selenium Server see [Test README](https://github.com/HillaryClinton/frontend-boilerplate/tree/master/test/README.md)
    │   ├── spawn-process.js # spawns WebdriverIO cli to run tests in parallel
    │   └── wdio-config
    │       └── index.js # WebdriverIO cli config
    └── webpack
        ├── gather-commonjs-mods.js # utility for ignoring external packages for compiling "backend" bundles from es6 to es5
        ├── index.js # bootstraps the process, starts the watch for `global` and Webpack Dev Server for `main`
        ├── loaders.js # defines all loaders
        ├── make-webpack-config.js # makes the Webpack config Object for Webpack and Karma Webpack Pre-Processor
        └── plugins.js # defines all plugins

./dist
├── css
│   ├── global.css # served in `dev` by BrowserSync
│   ├── global.css.map
│   ├── main.css # invisible in `dev`, in Webpack Dev Server memory land
│   └── main.css.map
├── index.html # invisible in `dev`, in Webpack Dev Server memory land
└── js
    ├── main.js # invisible in `dev`, in Webpack Dev Server memory land
    ├── main.js.map
    ├── global.js # served in `dev` by BrowserSync
    └── global.js.map
```
