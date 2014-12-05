var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line

describe('test yahoo search results', function() {
  this.timeout(30000);

  it('should find the nightmare github link first', function(done) {
    new Nightmare()
      .goto('http://yahoo.com')
      .type('input[title="Search"]', 'github nightmare')
      .click('.searchsubmit')
      .wait('.url.breadcrumb')
      .evaluate(function () {
        return document.querySelector('.url.breadcrumb').innerText;
      }, function (breadcrumb) {
        expect(breadcrumb).to.equal('github.com');
      })
      .run(done);
  });
});