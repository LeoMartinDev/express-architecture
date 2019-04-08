const {PERMISSION_ACTIONS, GROUPS} = require('../modules/auth/auth.constants');

module.exports = {
  core: {
    bootstrap: [
/*       'mongoose', */
    ],
    roles: {
      defaultRole: GROUPS.USER,
      permissions: {
        [GROUPS.ADMIN]: {
          resource: "*",
          methods: "*",
          action: PERMISSION_ACTIONS.ALLOW,
        },
        [GROUPS.USER]: {
          resource: "*",
          methods: "*",
          action: PERMISSION_ACTIONS.DENY,
        }
      }
    },
  },
  mongodbUri: 'mongodb://localhost',
};