const config = require('../../config');

const AUTH_STATUS = {
    EMAIL_CONFIRMATION: 'EMAIL_CONFIRMATION',
    ACTIVE: 'ACTIVE',
}

const MODEL = 'auth';

const GROUPS = {
    ADMIN: 'ADMIN',
    USER: 'USER',
};

const PERMISSION_ACTIONS = {
    ALLOW: 'allow',
    DENY: 'deny',
};

module.exports = {
    AUTH_STATUS,
    MODEL,
    GROUPS,
    PERMISSION_ACTIONS,
};