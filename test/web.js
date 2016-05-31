"use strict";

const Lab = require("lab");
const Code = require("code");
const Path = require("path");
const Rimraf = require("rimraf");
const YeomanTest = require("yeoman-test");
const YeomanAssert = require("yeoman-assert");
const Proxyquire = require("proxyquire");


const lab = exports.lab = Lab.script();
const testDest = Path.join(__dirname, "generators", "tmp-web");
const appSrc = Path.join(__dirname, "..", "web");
const appName = "super-awesome-web";
const appDest = Path.join(__dirname, "generators", "tmp-web", appName);
const internals = { "gitConfigErr": false };
const GeneratorApp = Proxyquire("../web", {
  "git-config": function (callback) {

    if (internals.gitConfigErr) {
      callback(new Error("Stimpy you idiot."));
    }
    else {
      callback(null, {
        "user": {
          "name": "Stimpson J. Cat",
          "email": "stimpy@farmcrew.email"
        }
      });
    }
  }
});
Code.expect(GeneratorApp).to.exist();


lab.experiment("Including git repo and git config", () => {

  lab.before((done) => {

    YeomanTest.run(appSrc)
            .inDir(testDest)
            .withArguments([appName])
            .withPrompts({
              "description": "Activate the plot device.",
              "author": "Stimpson J. Cat",
              "authorEmail": "stimpy@farmcrew.email",
              "gitRepo": "git@github.com:stimpy/super-awesome-app.git",
              "keywords": "hapi web",
              "license": ""
            })
            .on("end", done);
  });

  lab.after((done) => {

    Rimraf(testDest, done);
  });

  lab.test("it generates files successfully", (done) => {

    YeomanAssert.file([
      Path.join(appDest, "index.js"),
      Path.join(appDest, "package.json"),
      Path.join(appDest, "README.md"),
      Path.join(appDest, "LICENSE")
    ]);

    done();
  });
});


lab.experiment("Lacking git repo, git config and license", () => {

  lab.before((done) => {

    internals.gitConfigErr = true;

    YeomanTest.run(appSrc)
            .inDir(testDest)
            .withArguments([appName])
            .withPrompts({
              "description": "Activate the plot device.",
              "author": "Stimpson J. Cat",
              "authorEmail": "stimpy@farmcrew.email",
              "gitRepo": "",
              "keywords": "hapi web",
              "license": "ISC"
            })
            .on("end", done);
  });

  lab.after((done) => {

    Rimraf(testDest, done);
  });

  lab.test("it generates files successfully", (done) => {

    YeomanAssert.file([
      Path.join(appDest, "index.js"),
      Path.join(appDest, "package.json"),
      Path.join(appDest, "README.md")
    ]);

    YeomanAssert.noFile([
      Path.join(appDest, "LICENSE")
    ]);

    done();
  });
});
