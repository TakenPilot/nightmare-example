var Nightmare = require('nightmare');
var pages = require('./pages.json');
var expect = require('chai').expect; // jshint ignore:line
var _ = require('lodash');

function logAction(action) {
  return function () {
    console.log(action);
  }
}

function resolveFunction(fn, replacements) {
  var fnStr = fn.toString();
  for(var key in replacements) {
    fnStr = fnStr.replace(key, replacements[key]);
  }
  fn = eval("(" + fnStr + ")");
  return fn;
}

function hasElement(elementName) {
  return function (nightmare) {
    return nightmare.wait(elementName);
  }
}

function hasSchemaItemType(schemaName) {
  return function (nightmare) {
    nightmare.evaluate(resolveFunction(function () {
      return document.querySelector('[itemscope][itemtype="http://schema.org/schemaName"]').getAttribute('itemtype');
    }, {'schemaName': schemaName}), function (text) {
      expect(text).to.equal('http://schema.org/' + schemaName);
    }, schemaName);
  }
}

function forEachUrl(urlList, tests) {
  for(var index = 0; index < urlList.length; index++) {
    var url = urlList[index];

    url += "?build=movie-reviews";

    it(url, function (done) {
      //noinspection JSCheckFunctionSignatures

      //setup
      var nightmare = new Nightmare({
        timeout: 1000
      }).on("error", function(msg) {
          console.error("error:", msg);
        })
        .on("timeout", function(msg) {
          console.log("timeout:", msg);
        })
        .on("initialized", function (msg) {
          console.log("initialized:", msg);
        })
        .on("loadStarted", function (msg) {
          console.log("loadStarted:", msg);
        })
        .on("loadFinished", function (msg) {
          console.log("loadFinished:", msg);
        })
        .on("resourceRequested", function (msg) {
          if (msg.url.substr(0, 5) !== 'data:') {
            console.log("resourceRequested:", msg.url);
          }
        })
        .on("resourceReceived", function (msg) {
          if (msg.url.substr(0, 5) !== 'data:') {
            console.log("resourceReceived:", msg.url);
          }
        })
        .on("resourceError", function (msg) {
          console.log("loadFinished:", msg);
        })
        .on("consoleMessage", function (msg) {
          console.log("consoleMessage:", msg);
        })
        .viewport(500, 500)
        .goto(url);


      //tests
      nightmare = _.reduce(tests, function (nightmare, fn) {
        return nightmare.use(fn);
      }, nightmare);

      //teardown
      nightmare.screenshot('./screens/' + (this.test.title.replace(/http:\/\//g, '').replace(/\//g, '.')) + '.png')
        .run(done);
    });
  }
}

function forIndexUrls(items) {
  describe('index', function () {
    forEachUrl(items, [
    ]);
  });
}

function forArticleUrls(items) {
  describe('article', function () {
    forEachUrl(items, [
      hasElement('article'),
      hasSchemaItemType('Article'),
      hasSchemaItemType('Person'),
      hasSchemaItemType('Organization')
    ]);
  });
}

function forReviewUrls(items) {
  describe('review', function () {
    forEachUrl(items, [
      hasElement('article'),
      hasSchemaItemType('Review'),
      hasSchemaItemType('Person'),
      hasSchemaItemType('Organization')
    ]);
  });
}

describe('factory.qa schema.org', function() {
  this.timeout(10000);
  forIndexUrls(pages.index);
  forArticleUrls(pages.article);
  forReviewUrls(pages.review);
});