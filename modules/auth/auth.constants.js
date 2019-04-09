const config = require('../../config');

const AUTH_STATUS = {
    EMAIL_CONFIRMATION: 'EMAIL_CONFIRMATION',
    ACTIVE: 'ACTIVE',
}

const AUTH_MODEL = 'auth';

const GROUPS = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    ALL: '*',
};

const PERMISSION_ACTIONS = {
    ALLOW: 'allow',
    DENY: 'deny',
};

const GRANT_TYPES = {
    REFRESH_TOKEN: 'refreshToken',
    PASSWORD: 'password',
}

module.exports = {
    AUTH_STATUS,
    AUTH_MODEL,
    GROUPS,
    PERMISSION_ACTIONS,
    GRANT_TYPES,
};