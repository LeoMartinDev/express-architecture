const { GROUPS, PERMISSION_ACTIONS } = require('./auth.constants');
const registerDTO = require('./dto/register.dto');
const loginDTO = require('./dto/login.dto');
const DTOMiddleware = require('../../shared/dto.middleware');
const authMiddlware = require('./auth.middleware');

module.exports = {
    prefix: '/auth',
    routes: [
        {
            path: 'POST /login',
            middlewares: [
                DTOMiddleware(loginDTO),
                'auth@login',
            ],
        },
        {
            path: 'POST /register',
            middlewares: [
                DTOMiddleware(registerDTO),
                'auth@register',
            ],
        },
        {
            path: 'GET /test',
            middlewares: [
                authMiddlware,
                'auth@test',
            ],
        },
    ]
}