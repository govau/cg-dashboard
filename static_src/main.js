import 'cloudgov-style/css/base.css';
import './css/main.css';
// Icon used in cg-uaa.
import './img/dashboard-uaa-icon.jpg';
import 'cloudgov-style/img/favicon.ico';

import axios from 'axios';
import { Router } from 'director';

import { trackPageView } from './util/analytics.js';
import routes, { checkAuth, clearErrors, notFound } from './routes';

const meta = document.querySelector('meta[name="gorilla.csrf.Token"]');

if (meta) {
  axios.defaults.headers.common['X-CSRF-Token'] = meta.content;
}

import React from 'react';
import ReactDOM from 'react-dom';

const cRouter = {
  run(routes, cb) {
    const router = new Router(routes);
    router.configure({
      async: true,
      before: [clearErrors, checkAuth],
      notfound: notFound,
      on: () => trackPageView(window.location.hash)
    });
    router.init('/');

    return cb(router);
  }
};

cRouter.run(routes, (router) => {
  ReactDOM.render(<div></div>, document.querySelector('.js-app'));
});
