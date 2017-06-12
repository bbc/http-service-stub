const expect = require('chai').expect;
const Catalogue = require('../lib/Catalogue.js')

describe('Catalogue', function() {

  it('stores and retrieves different records', function(done) {

    var catalogue = new Catalogue();
    var inputs = { 'example1' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'], 
                   'example2' : [200, { "Content-Type": "text/html" }, { "foo": "bar" }],
                   'example3' : [200, { "Content-Type": "text/html" }, ['a','b','c']]
                 }

    var keys = Object.keys(inputs);

    keys.forEach(function(key) {
      var record = inputs[key];
      catalogue.add(key, record);
      expect(catalogue.retrieve(key)).to.deep.equal(record);
    })  

    done();     

  });

  it('stores and retrieves on the principle last in first out', function(done) {

    var catalogue = new Catalogue();
    var inputs = [ { 'example' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
                   { 'example' : [200, { "Content-Type": "text/html" }, { "foo": "baz" }] },
                   { 'example' : [200, { "Content-Type": "text/html" }, ['a','b','c']] } ]

    inputs.forEach(function(input) {
      var keys = Object.keys(input);

      keys.forEach(function(key) {
        var record = input[key];
        catalogue.add(key, record);
      })

    })

    expect(catalogue.retrieve("example")).to.be.deep.equal([200, { "Content-Type": "text/html" }, ['a','b','c'] ]);
    expect(catalogue.retrieve("example")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "foo": "baz" } ]);
    expect(catalogue.retrieve("example")).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "foo": "bar" }']);

    done();     

  });

   it('retains the last entry for any subsequent retrivals', function(done) {

    var catalogue = new Catalogue();
    var inputs = [ { 'example1' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
                   { 'example2' : [200, { "Content-Type": "text/html" }, { "foo": "1" }] },
                   { 'example2' : [200, { "Content-Type": "text/html" }, { "bar": "2" }] },
                   { 'example2' : [200, { "Content-Type": "text/html" }, { "baz": "3" }] } ]

    inputs.forEach(function(input) {
      var keys = Object.keys(input);

      keys.forEach(function(key) {
        var record = input[key];
        catalogue.add(key, record);
      })

    })

    expect(catalogue.retrieve("example1")).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "foo": "bar" }']);
    expect(catalogue.retrieve("example1")).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "foo": "bar" }']);


    expect(catalogue.retrieve("example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "baz": "3" }]);
    expect(catalogue.retrieve("example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "bar": "2" }]);
    expect(catalogue.retrieve("example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "foo": "1" }]);
    expect(catalogue.retrieve("example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "foo": "1" }]);

    done();     

  }); 

  it('can be emptied', function(done) {

    var catalogue = new Catalogue();

    expect(catalogue.retrieve('example')).to.be.equal(null);

    var inputs = [ { 'example' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
                   { 'example' : [200, { "Content-Type": "text/html" }, { "foo": "bar" }] },
                   { 'example' : [200, { "Content-Type": "text/html" }, ['a','b','c']] } ]

    inputs.forEach(function(input) {
      var keys = Object.keys(input);

      keys.forEach(function(key) {
        var record = input[key];
        catalogue.add(key, record);
      })

    })

    expect(catalogue.retrieve('example')).to.be.deep.equal(inputs[2]['example']);

    catalogue.empty();

    expect(catalogue.retrieve('example')).to.be.equal(null);

    done();     

  });

  it('can be delete an entry', function(done) {

    var catalogue = new Catalogue();
    var inputs = [ { 'example1' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
                   { 'example1' : [200, { "Content-Type": "text/html" }, '{ "baz": "cat" }'] },
                   { 'example2' : [200, { "Content-Type": "text/html" }, { "x": "y" }] },
                   { 'example2' : [200, { "Content-Type": "text/html" }, ['a','b','c']] } ]

    inputs.forEach(function(input) {
      var keys = Object.keys(input);

      keys.forEach(function(key) {
        var record = input[key];
        catalogue.add(key, record);
      })

    }) 

    expect(catalogue.retrieve('example1')).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "baz": "cat" }']);
    expect(catalogue.retrieve('example2')).to.be.deep.equal([200, { "Content-Type": "text/html" }, ['a','b','c']]);

    catalogue.delete('example1');

    expect(catalogue.retrieve('example1')).to.be.equal(null);
    expect(catalogue.retrieve('example2')).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "x": "y" }]);

    done();     

  });

});
