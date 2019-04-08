const DTOMiddleware = require('../../shared/dto.middleware');
const { GROUPS, PERMISSION_ACTIONS } = require('./auth.constants');

module.exports = {
    prefix: '/auth',
    routes: [
        {
            path: 'POST /login',
            middlewares: [
                'auth@login',
            ],
            permissions: [
                {
                    group: GROUPS.USER,
                    action: PERMISSION_ACTIONS.ALLOW,
                }
            ]
        },
        {
            path: 'POST /register',
            middlewares: [
                'auth@register',
            ],
            permissions: [
                {
                    group: GROUPS.USER,
                    action: PERMISSION_ACTIONS.ALLOW,
                }
            ]
        },
        {
            path: 'GET /test',
            middlewares: [
                'auth@test',
            ],
            permissions: [
                {
                    group: GROUPS.USER,
                    action: PERMISSION_ACTIONS.ALLOW,
                }
            ]
        },
    ]
}