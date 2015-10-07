import ExtractTextPlugin from 'extract-text-webpack-plugin';
import shouldExclude from './exclude-list';

export default function(opts) {
  const {
    expose,
    extract,
    libraryName,
    paths,
    sources,
    quick,
    DEBUG,
    TEST
  } = opts;
  const {fileLoader} = paths;
  const {includePaths} = sources;
  let jsLoader = 'babel-loader?optional[]=runtime&stage=0';
  let jsxLoader = [];
  const jsxProdOpts = [
    '&optional[]=optimisation.react.inlineElements',
    'optional[]=optimisation.react.constantElements'
  ];
  let sassLoader, cssLoader;

  let jsonLoader = ['json-loader'];

  let sassParams = [
    `outputStyle=${DEBUG || quick ? 'expanded' : 'compressed'}`
  ];

  if (includePaths && Array.isArray(includePaths)) {
    includePaths.reduce((list, fp) => {
      list.push(`includePaths[]=${fp}`);
      return list;
    }, sassParams);
  }

  sassParams.push('sourceMap', 'sourceMapContents=true');

  if (DEBUG || TEST) {
    if (!TEST && !extract) {
      jsxLoader.push('react-hot');
    } else {
      jsLoader += '&plugins=rewire';
    }

    jsxLoader.push(jsLoader);

    // TODO: clean this up
    if (extract) {
      sassLoader = ExtractTextPlugin.extract('style-loader', [
        'css-loader?sourceMap&importLoaders=2',
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!'));
    } else {
      sassLoader = [
        'style-loader',
        'css-loader?sourceMap&importLoaders=2',
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!');
    }

    cssLoader = [
      'style-loader',
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[name]__[local]___[hash:base64:5]',
      'postcss-loader'
    ].join('!');
  } else {
    jsxLoader.push(jsLoader + jsxProdOpts.join('&'));

    cssLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[hash:base64:5]',
      'postcss-loader'
    ].join('!'));

    sassLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=2',
      'postcss-loader',
      `sass-loader?${sassParams.join('&')}`
    ].join('!'));
  }


  const preLoaders = [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }
  ];

  let loaders = [
    {
      test: /\.jsx?$/,
      exclude: shouldExclude,
      loaders: jsxLoader
    },
    {
      test: /\.(jpe?g|gif|png|ico|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: fileLoader
    },
    {
      test: /\.json$/,
      loader: jsonLoader
    },
    {
      test: /\.css$/,
      loader: cssLoader
    },
    {
      test: /\.scss$/,
      loader: sassLoader
    }
  ];

  if (TEST) {
    loaders.push({
      test: require.resolve('sinon'),
      loader: 'imports?define=>false'
    });
  }

  if (DEBUG || TEST) {
    loaders.unshift({
      expose,
      loader: `expose?${libraryName}`
    });
  }

  return {preLoaders, loaders};
}
