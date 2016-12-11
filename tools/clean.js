import { cleanDir } from './lib/fs';

function clean() {
  return cleanDir('build');
}

export default clean;
