import express from 'express';
import fs from 'fs';
import path from 'path';
import Agent from 'agentkeepalive';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import App from '../src/App';
import { postHandler } from './pageHandlers';

const PORT = 8000;

console.log('REACT_APP_WEBSITE_NAME', process.env.REACT_APP_WEBSITE_NAME);
console.log('REACT_APP_API_URL', process.env.REACT_APP_API_URL);
console.log('REACT_APP_MEDIA_BASE', process.env.REACT_APP_MEDIA_BASE);
console.log('args', process.argv);
console.log('NODE_ENV', process.env.NODE_ENV);
// console.log('ENV', process.env);
const app = express();

// app.use('^/$', (req, res, next) => {
//   fs.readFile(path.resolve('./build/index.html'), 'utf-8', (err, data) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send('Some error happened');
//     }
//     return res.send(
//       data.replace(
//         '<div id="root"></div>',
//         `<div id="root">${ReactDOMServer.renderToString(<App />)}</div>`
//       )
//     );
//   });
// });

app.use('^/$', (req, res, next) => {
  fs.readFile(path.resolve('./build/index.html'), 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Some error happened');
    }

    const agent = new Agent({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 50,
      timeout: 60000, // active socket keepalive for 60 seconds
      freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
    });

    postHandler(req, res, data, agent);
    // return res.send(
    //   data.replace(
    //     '<div id="root"></div>',
    //     `<div id="root">${ReactDOMServer.renderToString(<App />)}</div>`
    //   )
    // );
  });
});

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.listen(PORT, () => {
  console.log(`App launched on ${PORT}`);
});
