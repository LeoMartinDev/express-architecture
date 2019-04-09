const express = require('express');
const path = require('path');
const fs = require('fs');
const async = require('async');
const bodyParser = require('body-parser');
const _ = require('lodash');
/* const expressAcl = require('acl'); */

const config = require('./config');
const app = express();
const router = require('./router');
const { GROUPS } = require('./modules/auth/auth.constants');

const BOOTSTRAP_PATH = path.resolve(__dirname, 'bootstrap');
const MODULES_PATH = path.resolve(__dirname, 'modules');
const FILE_TYPES = {
  CONTROLLER: 'controller',
  MODEL: 'model',
  ROUTES: 'routes',
};

const modules = {};

/* const acl = new expressAcl(new expressAcl.memoryBackend());

acl.allow(GROUPS.ADMIN, '*', '*'); */

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

const pluralize = str => str.endsWith('s') ? str : str + 's';

function loadModules() {
  let modulesPaths = {};
  // get a list of directories in "MODULE_PATH" directory
  fs.readdirSync(MODULES_PATH)
    .forEach(fileName => {
      if (fileName === 'index.js') return;
      const directoryPath = path.resolve(MODULES_PATH, fileName);
      if (fs.statSync(directoryPath).isDirectory()) {
        const moduleName = path.basename(directoryPath);

        let currentModule = modules[moduleName] = {
          name: moduleName,
          models: {},
          controllers: {},
          routes: null,
        };

        // get a list of files in a directory
        fs.readdirSync(directoryPath).forEach(moduleFileName => {
          const moduleFilePath = path.resolve(directoryPath, moduleFileName);
          const [fileName, type] = moduleFileName.split('.');

          switch (type) {
            case FILE_TYPES.CONTROLLER:
              currentModule.controllers[fileName] = moduleFilePath;
              break;
            case FILE_TYPES.MODEL:
              currentModule.models[fileName] = moduleFilePath;
              break;
            case FILE_TYPES.ROUTES:
              currentModule.routes = moduleFilePath;
              break;
            default: break;
          }
        });
      }
    });
  [FILE_TYPES.MODEL, FILE_TYPES.CONTROLLER].forEach(type => {
    Object.entries(modules).forEach(([moduleName, moduleValue]) =>
      Object.entries(moduleValue[pluralize(type)]).forEach(([entryName, entryValue]) => {
        moduleValue[pluralize(type)][entryName] = require(entryValue);
      }));
  });
  Object.entries(modules).forEach(([moduleName, moduleValue]) => {
    if (modules[moduleName].routes) {
      modules[moduleName].routes = require(modules[moduleName].routes);
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
    if (typeof route === 'string') {
      let currentModule = modules[route];
      if (!currentModule) console.warn(`"${route}" module not found!`);
      let prefix = null;
      let currentRouter = currentModule.routes;
      if (!currentModule.routes || !Array.isArray(currentModule.routes)) {
        if (!currentModule.routes || !Array.isArray(currentModule.routes.routes)) {
          console.warn(`Cannot find router for "${route}" module!`);
          return;
        }
        currentRouter = currentModule.routes.routes;
        prefix = currentModule.routes.prefix;
      }
      currentModule.router = express.Router();
      currentRouter.forEach(routeEntry => {
        if (!routeEntry.middlewares || !Array.isArray(routeEntry.middlewares)) {
          console.warn(`Invalid middlewares for "${route} : ${routeEntry.path}"!`)
        }
        let pathParts = routeEntry.path.split(' ');
        let routeVerb = pathParts.length === 1 ? VERBS.GET : VERBS[pathParts[0]] || VERBS.GET;
        let routeUri = pathParts.length === 1 ? pathParts[0] : pathParts[1];
        let controllerMethod = null;
        let routeMiddlewares = routeEntry.middlewares.reduce((acc, middleware, i) => {
/*           if (routeEntry.middlewares[i + 1]
              && typeof routeEntry.middlewares[i + 1] === 'string'
              && routeEntry.allow) {
            currentModule.router.use((request, response, next) => {
              console.log(request.method)
              if (request.user) {
                acl.addUserRoles(request.user._id, request.user.role);
              }
            }, acl.middleware(null, req => req.user._id));
          } */
          if (typeof middleware === 'string') {
            let middlewareParts = middleware.split('@');
            let moduleName, controllerName, methodName;

            if (middlewareParts.length === 3) {
              moduleName = middlewareParts[0];
              controllerName = middlewareParts[1];
              methodName = middlewareParts[2];
            } else {
              moduleName = currentModule.name;
              controllerName = middlewareParts.length === 2 ?
                middlewareParts[0] : currentModule.name;
              methodName = middlewareParts.length === 2 ?
                middlewareParts[1] : middlewareParts[0];
            }
            if (!_.has(modules, `[${moduleName}].controllers[${controllerName}][${methodName}]`)) {
              console.warn(`Invalid router configuration!`);
              return;
            }
            controllerMethod = middleware;
            // handle ACL
            if (Array.isArray(routeEntry.allow)) {
              let fullUri = prefix ? prefix + routeUri : routeUri;

/*               acl.allow(routeEntry.allow, routeUri, routeVerb.toLowerCase()); */
/*               routeEntry.allow.forEach(group => {
                if (GROUPS[group]) {
                  acl.allow(group, fullUri, routeVerb.toLowerCase());
                }
              }) */
            }
            acc.push(modules[moduleName].controllers[controllerName][methodName]);
          } else {
            acc.push(middleware);
          }
          return acc;
        }, []);
        console.info(`[ROUTE] ${routeVerb} ${prefix ? prefix : ''}${routeUri} [${routeMiddlewares.length} middleware(s)]${controllerMethod ? ` -> ${controllerMethod}` : ''}`)
        currentModule.router[routeVerb.toString().toLowerCase()](routeUri, ...routeMiddlewares);
      });
/*       currentModule.router.use((request, response, next) => {
        if (req.user) {
          acl.addUserRoles(req.user._id, req.user.role);
        }
      }, acl.middleware(null, req => req.user._id)); */
      if (prefix) app.use(prefix, currentModule.router);
      else app.use(currentModule.router);
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
  loadRoutes();
}

start()
  .then(() => {
    app.listen(3000, () => console.log('Server is listening on port 3000!'));
  })
  .catch(error => {
    console.error(error);
    process.exit(-1);
  });