module.exports = [
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
];