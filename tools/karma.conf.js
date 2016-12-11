const path = require('path');
const webpack = require('webpack');

const PHANTOMJS = (process.argv.indexOf('--phantomjs') >= 0);

module.exports = config => {
  config.set({

    basePath: path.resolve(__dirname, '../'),

    frameworks: ['mocha'],

    plugins: [
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-webpack',
      'karma-sourcemap-loader',
      PHANTOMJS ? 'karma-phantomjs-launcher' : 'karma-chrome-launcher',
    ],

    files: [
      'src/test.js',
    ],

    preprocessors: {
      'src/test.js': ['webpack', 'sourcemap'],
    },

    webpack: {
      externals: {
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true,
      },

      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              cacheDirectory: true,
              presets: [
                'es2015',
                'stage-0',
                'react',
              ],
              plugins: [
                [
                  'istanbul',
                  {
                    exclude: [
                      'src/test.js',
                      'src/routes.js',
                      'src/(actions|dispatchers|stores)/index.js',
                      'src/components/ui/(atoms|molecules|organisms)/index.js',
                      'src/**/{*}.spec.js',
                    ],
                  },
                ],
              ],
            },
          },
          {
            test: /\.css$/,
            loaders: [
              'style-loader',
              `css-loader?${JSON.stringify({
                importLoaders: 1,
                sourceMap: true,
                modules: true,
                localIdentName: '[name]-[local]-[hash:base64:5]',
                minimize: false,
              })}`,
              'postcss-loader',
            ],
          },
          {
            test: /\.json$/,
            loader: 'json-loader',
          },
        ],
      },

      cache: true,

      debug: true,

      postcss(bundler) {
        return [
          require('postcss-import')({ addDependencyTo: bundler }),
          require('postcss-cssnext')({ browsers: ['last 2 versions'] }),
        ];
      },

      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': '"production"',
        }),
      ],

      devtool: 'inline-source-map',
    },

    webpackMiddleware: {
      stats: {
        colors: true,
        chunks: false,
      },
    },

    reporters: [
      'mocha',
      'coverage',
    ],

    coverageReporter: {
      type: 'text',
      dir: 'coverage',
      reporters: [
        { type: 'text', subdir: '.', file: 'coverage.txt' },
        { type: 'json', subdir: '.', file: 'coverage.json' },
        { type: 'text-summary' },
        { type: 'html', subdir: 'html' },
      ],
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    browsers: PHANTOMJS ? ['PhantomJS'] : ['Chrome'],

    concurrency: Infinity,

    autoWatch: true,

    singleRun: true,
  });
};
