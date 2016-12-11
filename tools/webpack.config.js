import extend from 'extend';
import path from 'path';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';

const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');

const config = {
  context: path.resolve(__dirname, '../src'),

  output: {
    path: path.resolve(__dirname, '../build/public/assets'),
    publicPath: '/assets/',
    sourcePrefix: '',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [
          `babel-loader?${JSON.stringify({
            cacheDirectory: isDebug,
            babelrc: false,
            presets: [
              'es2015',
              'stage-0',
              'angular2',
            ],
            plugins: [],
          })}`,
          'angular2-template-loader?keepUrl=true',
        ],
        include: [
          path.resolve(__dirname, '../src'),
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap',
        ],
        exclude: /src/,
      },
      {
        test: /\.css$/,
        loaders: [
          'to-string-loader',
          'css-loader?sourceMap',
          'postcss-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'raw-loader?minimize=false',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
      },
    ],
  },

  resolve: {
    root: path.resolve(__dirname, '../src'),
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.json', '.pug'],
  },

  cache: isDebug,

  debug: isDebug,

  stats: {
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
  },

  postcss(bundler) {
    return [
      require('postcss-import')({ addDependencyTo: bundler }),
      require('postcss-cssnext')({ browsers: ['last 2 versions'] }),
    ];
  },
};

const clientConfig = extend(true, {}, config, {
  entry: './client.js',

  output: {
    filename: isDebug ? '[name].js?[chunkhash]' : '[name].[chunkhash].js',
    chunkFilename: isDebug ? '[name].[id].js?[chunkhash]' : '[name].[id].[chunkhash].js',
  },

  target: 'web',

  plugins: [
    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
      'process.env.BROWSER': true,
      __DEV__: isDebug,
    }),

    // Emit a file with assets paths
    // https://github.com/sporto/assets-webpack-plugin#options
    new AssetsPlugin({
      path: path.resolve(__dirname, '../build'),
      filename: 'assets.js',
      processOutput: x => `module.exports = ${JSON.stringify(x)};`,
    }),

    // Assign the module and chunk ids by occurrence count
    // Consistent ordering of modules required if using any hashing ([hash] or [chunkhash])
    // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
    new webpack.optimize.OccurrenceOrderPlugin(true),
  ],

  devtool: isDebug ? 'source-map' : false,
});

const serverConfig = extend(true, {}, config, {
  entry: './server.js',

  output: {
    filename: '../../server.js',
    libraryTarget: 'commonjs2',
  },

  target: 'node',

  externals: [
    /^\.\/assets$/,
    (context, request, callback) => {
      const isExternal = !!(request.match(/^[@a-z][a-z/.\-0-9]*$/i) && !request.match(/\.(css)$/i));
      callback(null, isExternal);
    },
  ],

  plugins: [
    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
      'process.env.BROWSER': false,
      __DEV__: isDebug,
    }),

    // Do not create separate chunks of the server bundle
    // https://webpack.github.io/docs/list-of-plugins.html#limitchunkcountplugin
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },

  devtool: 'source-map',
});

export default [clientConfig, serverConfig];
