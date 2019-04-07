const express = require('express');
const path = require('path');
const fs = require('fs');
const async = require('async');
const bodyParser = require('body-parser');

const config = require('./config');
const app = express();
const router = require('./router');

const BOOTSTRAP_PATH = path.resolve(__dirname, 'bootstrap');
const MODULES_PATH = path.resolve(__dirname, 'modules');
const FILE_TYPES = {
  CONTROLLER: 'controller',
  MODEL: 'model',
  ROUTES: 'routes',
};

const modules = {};

function bootstrap(bootstrapOrder) {
  return new Promise((resolve, reject) => {
    if (!bootstrapOrder || !Array.isArray(bootstrapOrder)) {
      return reject(new Error('Missing "core.bootstrap" configuration key!'));
    }
    // we iterate through "bootstrapOrder"
    async.eachSeries(bootstrapOrder, (fileName, next) => {
      try {
        // require the corresponding file
        // e.g: bootstrap/mongoose.js
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

function loadModules() {
  // get a list of directories in "MODULE_PATH" directory
  fs.readdirSync(MODULES_PATH)
    .forEach(fileName => {
      if (fileName === 'index.js') return;
      const directoryPath = path.resolve(MODULES_PATH, fileName);
      if (fs.statSync(directoryPath).isDirectory()) {
        const moduleName = path.basename(directoryPath);

        let currentModule = modules[moduleName] = {
          models: {},
          controllers: {},
          routes: {},
        };
        // get a list of files in a directory
        fs.readdirSync(directoryPath).forEach(moduleFileName => {
          const moduleFilePath = path.resolve(directoryPath, moduleFileName);
          const [fileName, type] = moduleFileName.split('.');

          switch (type) {
            case FILE_TYPES.CONTROLLER:
              let controller = require(moduleFilePath);

              currentModule.controllers[fileName] = controller;
              break;
            case FILE_TYPES.MODEL:
              let model = require(moduleFilePath);

              currentModule.models[fileName] = model;
              break;
            default: break;
          }
          console.log(currentModule)
          // // if it is a controller, register it to express
          // if (type === FILE_TYPES.CONTROLLER) {
          //   let controller = require(moduleFilePath);

          //   currentModule.controller = controller;
          //   /*             controller.stack[0].route.stack.forEach(route => {
          //                 if (route.name === '<anonymous>') return;
          //                 console.info(`[${route.method.toUpperCase()}] ${controller.stack[0].route.path} ::: "${route.name}"`)
          //               })
          //               app.use(controller); */
          // }
          // // it is a model, simply require it so mongoose can do its magic
          // else if (type === FILE_TYPES.MODEL) {
          //   require(moduleFilePath);
          // } else { }
        });
      }
    });
}

const VERBS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
}

function loadRoutes() {
  router.forEach(route => {
    if (typeof router === 'string') {
      let currentModule = modules[route];

      if (!currentModule) console.warn(`"${route}" module not found!`);
      if (!currentModule.routes) console.warn(`Cannot find router for "${route}" module!`);
      currentModule.router = express.Router();
      currentModule.routes.forEach(routeEntry => {
        if (!routeEntry.middlewares || !Array.isArray(routeEntry.middlewares)) {
          console.warn(`Invalid middlewares for "${route} : ${routeEntry.path}"!`)
        }
        let pathParts = routeEntry.split(' ');
        let routeVerb = pathParts.length === 1 ? VERBS.GET : VERBS[pathParts[0]] || VERBS.GET;
        let routeUri = pathPars.length === 1 ? pathParts[0] : pathParts[1];
        let routeMiddlewares = routeEntry.routeMiddlewares.reduce();
      });
    } else {
      app.use(route);
    }
  });
/*   modules.entries().forEach(([moduleName, moduleCtx]) => {

  }); */
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