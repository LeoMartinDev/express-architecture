module.exports = {
  core: {
    bootstrap: [
      'mongoose',
      'router',
    ],
  },
  mongodbUri: 'mongodb://localhost/auth',
};