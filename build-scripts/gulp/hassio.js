import gulp from "gulp";
import env from "../env.cjs";
import "./clean.js";
import "./compress.js";
import "./entry-html.js";
import "./gather-static.js";
import "./gen-icons-json.js";
import "./translations.js";
import "./rspack.js";

gulp.task(
  "develop-menuaiio",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "development";
    },
    "clean-menuaiio",
    "gen-dummy-icons-json",
    "gen-pages-menuaiio-dev",
    "build-supervisor-translations",
    "copy-translations-supervisor",
    "build-locale-data",
    "copy-static-supervisor",
    "rspack-watch-menuaiio"
  )
);

gulp.task(
  "build-menuaiio",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "production";
    },
    "clean-menuaiio",
    "gen-dummy-icons-json",
    "build-supervisor-translations",
    "copy-translations-supervisor",
    "build-locale-data",
    "copy-static-supervisor",
    "rspack-prod-menuaiio",
    "gen-pages-menuaiio-prod",
    ...// Don't compress running tests
    (env.isTestBuild() ? [] : ["compress-menuaiio"])
  )
);
