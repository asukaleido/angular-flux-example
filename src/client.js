import 'babel-polyfill';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
import 'normalize.css';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import './vendor';
import { AppModule } from './components/app';

platformBrowserDynamic().bootstrapModule(AppModule);
