const expect = require('chai').expect;
const PrepareResponse = require('../lib/PrepareResponse.js');

describe('PrepareResponse', function() {

  it('returns response-ready data structures', function(done) {

    var tests = [

      { "input": [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'],
        "output": [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] 
      },      
      { "input": [200, { "Content-Type": "text/html" }, { "foo": "bar" }],
        "output": [200, { "Content-Type": "text/html" }, '{"foo":"bar"}']
      },      
      { "input": [200, { "Content-Type": "text/html" }, { "foo": "bar" }],
        "output": [200, { "Content-Type": "text/html" }, '{"foo":"bar"}']
      }
    ]

    tests.forEach(function(test) {
      expect(PrepareResponse(test.input)).to.deep.equal(test.output);
    })

    done();

  })

})
