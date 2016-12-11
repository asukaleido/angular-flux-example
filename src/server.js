import express from 'express';
import path from 'path';
import assets from './assets'; // eslint-disable-line import/no-unresolved
import template from './index.pug';
import { port } from './config';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.send(template({ assets, title: 'Angular with Flux Examples' }));
});

/* eslint-disable no-console */
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`);
});
/* eslint-enable no-console */
