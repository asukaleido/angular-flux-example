import rimraf from 'rimraf';

/* eslint-disable import/prefer-default-export */

export const cleanDir = (pattern, options) => new Promise((resolve, reject) => {
  rimraf(pattern, { glob: options }, (err, result) => (err ? reject(err) : resolve(result)));
});
