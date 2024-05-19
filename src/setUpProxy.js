const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/serve", {
      target: "http://118.186.244.221:8000/",
      changeOrigin: true,
    })
  );
};
