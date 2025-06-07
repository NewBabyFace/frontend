const path = require("path");

module.exports = {
  root_dir: path.resolve(__dirname, ".."),

  build_dir: path.resolve(__dirname, "../build"),
  app_output_root: path.resolve(__dirname, "../menuai_frontend"),
  app_output_static: path.resolve(__dirname, "../menuai_frontend/static"),
  app_output_latest: path.resolve(
    __dirname,
    "../menuai_frontend/frontend_latest"
  ),
  app_output_es5: path.resolve(__dirname, "../menuai_frontend/frontend_es5"),

  demo_dir: path.resolve(__dirname, "../demo"),
  demo_output_root: path.resolve(__dirname, "../demo/dist"),
  demo_output_static: path.resolve(__dirname, "../demo/dist/static"),
  demo_output_latest: path.resolve(__dirname, "../demo/dist/frontend_latest"),
  demo_output_es5: path.resolve(__dirname, "../demo/dist/frontend_es5"),

  cast_dir: path.resolve(__dirname, "../cast"),
  cast_output_root: path.resolve(__dirname, "../cast/dist"),
  cast_output_static: path.resolve(__dirname, "../cast/dist/static"),
  cast_output_latest: path.resolve(__dirname, "../cast/dist/frontend_latest"),
  cast_output_es5: path.resolve(__dirname, "../cast/dist/frontend_es5"),

  gallery_dir: path.resolve(__dirname, "../gallery"),
  gallery_build: path.resolve(__dirname, "../gallery/build"),
  gallery_output_root: path.resolve(__dirname, "../gallery/dist"),
  gallery_output_latest: path.resolve(
    __dirname,
    "../gallery/dist/frontend_latest"
  ),
  gallery_output_static: path.resolve(__dirname, "../gallery/dist/static"),

  landingPage_dir: path.resolve(__dirname, "../landing-page"),
  landingPage_build: path.resolve(__dirname, "../landing-page/build"),
  landingPage_output_root: path.resolve(__dirname, "../landing-page/dist"),
  landingPage_output_latest: path.resolve(
    __dirname,
    "../landing-page/dist/frontend_latest"
  ),
  landingPage_output_es5: path.resolve(
    __dirname,
    "../landing-page/dist/frontend_es5"
  ),
  landingPage_output_static: path.resolve(
    __dirname,
    "../landing-page/dist/static"
  ),

  menuaiio_dir: path.resolve(__dirname, "../menuaiio"),
  menuaiio_output_root: path.resolve(__dirname, "../menuaiio/build"),
  menuaiio_output_static: path.resolve(__dirname, "../menuaiio/build/static"),
  menuaiio_output_latest: path.resolve(
    __dirname,
    "../menuaiio/build/frontend_latest"
  ),
  menuaiio_output_es5: path.resolve(__dirname, "../menuaiio/build/frontend_es5"),
  menuaiio_publicPath: "/api/menuaiio/app",

  translations_src: path.resolve(__dirname, "../src/translations"),
};
