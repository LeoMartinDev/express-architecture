const authService = require('./auth.service');

module.exports = async (request, response, next) => {
  let token = request.headers['authorization'];

  if (!token || !token.startsWith('Bearer ')) {
    return response.status(401).send({ message: 'Invalid access token!' });
  }
  token = token.slice(7, token.length);
  if (!token) {
    return response.status(401).send({ message: 'Invalid access token!' });
  }
  try {
    const payload = await authService.checkAccessToken(token);

    request.user = payload;
    return next();
  } catch (error) {
    console.error(error);
    return response.status(401).send({ message: 'Invalid access token!' });
  }
};