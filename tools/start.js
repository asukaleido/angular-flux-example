import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-middleware';
import clean from './clean';
import webpackConfig from './webpack.config';
import run from './run';
import runServer from './runServer';

process.argv.push('--watch');

const [config] = webpackConfig;

async function start() {
  await run(clean);
  await new Promise(resolve => {
    if (config.debug) {
      config.plugins.push(new webpack.ProgressPlugin((percentage, msg) => {
        const stream = process.stderr;
        if (stream.isTTY && percentage < 0.71) {
          stream.cursorTo(0);
          stream.write(`${msg}`);
          stream.clearLine(1);
        } else if (percentage === 1) {
          console.log('');
          console.log('webpack: bundle build is now finished.');
        }
      }));
    }

    const bundler = webpack(webpackConfig);
    const middleware = webpackMiddleware(bundler, {
      publicPath: config.output.publicPath,
      stats: config.stats,
    });

    let handleBundleComplete = async () => {
      handleBundleComplete = ({ stats }) => {
        if (!stats[1].compilation.errors.length) runServer();
      };

      const server = await runServer();
      const bs = browserSync.create();

      bs.init({
        ...(config.debug ? {} : { notify: false, ui: false }),

        proxy: {
          target: server.host,
          middleware: [middleware],
        },
      }, resolve);
    };

    bundler.plugin('done', stats => handleBundleComplete(stats));
  });
}

export default start;
