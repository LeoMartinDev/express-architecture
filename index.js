const express = require('express');
const path = require('path');
const fs = require('fs');
const async = require('async');
const bodyParser = require('body-parser');

const config = require('./config');
const app = express();

const BOOTSTRAP_PATH = path.resolve(__dirname, 'bootstrap');
const MODULES_PATH = path.resolve(__dirname, 'modules');
const FILE_TYPES = {
  CONTROLLER: 'controller',
  MODEL: 'model',
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function bootstrap(bootstrapOrder) {
  return new Promise((resolve, reject) => {
    if (!bootstrapOrder || !Array.isArray(bootstrapOrder)) {
      return reject(new Error('Missing "core.bootstrap" configuration key!'));
    }
    async.eachSeries(bootstrapOrder, (fileName, next) => {
      try {
        const bootstrapModule = require(path.resolve(BOOTSTRAP_PATH, fileName));

        if (!typeof bootstrapModule === 'function') {
          return next(new Error(`"${fileName}" must be a function!`));
        }
        return bootstrapModule.call(null, next);
      } catch (error) {
        return next(error);
      }
    }, error => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

// TODO: make it asynchronous to reduce server's boot time
function loadModules() {
  fs.readdirSync(MODULES_PATH)
    .forEach(fileName => {
      if (fileName === 'index.js') return;
      const directoryPath = path.resolve(MODULES_PATH, fileName);
      if (fs.statSync(directoryPath).isDirectory()) {
        fs.readdirSync(directoryPath).forEach(moduleFileName => {
          const moduleFilePath = path.resolve(directoryPath, moduleFileName);
          const type = moduleFileName.split('.')[1];

          if (type === FILE_TYPES.CONTROLLER) {
            app.use(require(moduleFilePath));
          } else if (type === FILE_TYPES.MODEL) {
            require(moduleFilePath);
          } else {}
        });
      }
    });
}

async function start() {
  await bootstrap(config.core.bootstrap);
  loadModules();
}

start()
  .then(() => {
    app.listen(3000, () => console.log('Server is listening on port 3000!'));
  })
  .catch(error => {
    console.error(error);
    process.exit(-1);
  });