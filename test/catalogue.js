const expect = require('chai').expect;
const Catalogue = require('../lib/Catalogue.js')

describe('Catalogue', function() {

  it('stores and retrieves different records', function(done) {

    var catalogue = new Catalogue();

    var examples = { 
      'foo' :
        { 
          'example1' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'], 
          'example2' : [200, { "Content-Type": "text/html" }, { "foo": "bar" }],
          'example3' : [200, { "Content-Type": "text/html" }, ['a','b','c']]
        },
      'bar' : 
        { 
          'example4' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'], 
          'example5' : [200, { "Content-Type": "text/html" }, { "kat": "kit" }],
          'example6' : [200, { "Content-Type": "text/html" }, ['1','2','3']]
        }
      }

    var classifications = Object.keys(examples);

    classifications.forEach(function(classification) {
      var records = examples[classification];
      var keys = Object.keys(records);
      keys.forEach(function(key) {
        var record = records[key];
        catalogue.add(classification, key, record);
        expect(catalogue.retrieve(classification, key)).to.deep.equal(record);
      })
    })  

    done();     

  });

  it('stores and retrieves on the principle last in first out', function(done) {

    var catalogue = new Catalogue();
    var examples = 
      { 'foo':
        [ { 'example' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
          { 'example' : [200, { "Content-Type": "text/html" }, { "foo": "baz" }] },
          { 'example' : [200, { "Content-Type": "text/html" }, ['a','b','c']] } ]
      }

    var keys = Object.keys(examples);

    keys.forEach(function(classification) {
      var entries = examples[classification];

      entries.forEach(function(entry) {
        var keys = Object.keys(entry);
        keys.forEach(function(key) {
          var record = entry[key];
          catalogue.add(classification, key, record);
        })
      })
    })

    expect(catalogue.retrieve("foo", "example")).to.be.deep.equal([200, { "Content-Type": "text/html" }, ['a','b','c'] ]);
    expect(catalogue.retrieve("foo", "example")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "foo": "baz" } ]);
    expect(catalogue.retrieve("foo", "example")).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "foo": "bar" }']);

    done();     

  });

   it('retains the last entry for any subsequent retrivals', function(done) {

    var catalogue = new Catalogue();
    var examples = {  
      "foo" : [ { 'example1' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
                { 'example2' : [200, { "Content-Type": "text/html" }, { "foo": "1" }] },
                { 'example2' : [200, { "Content-Type": "text/html" }, { "bar": "2" }] },
                { 'example2' : [200, { "Content-Type": "text/html" }, { "baz": "3" }] } ]
    }


    var classifications = Object.keys(examples);

    classifications.forEach(function(classification) {
      var entries = examples[classification];

      entries.forEach(function(input) {
        var keys = Object.keys(input);

        keys.forEach(function(key) {
          var record = input[key];
          catalogue.add(classification, key, record);
        })

      })

    })



    expect(catalogue.retrieve("foo", "example1")).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "foo": "bar" }']);
    expect(catalogue.retrieve("foo", "example1")).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "foo": "bar" }']);


    expect(catalogue.retrieve("foo", "example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "baz": "3" }]);
    expect(catalogue.retrieve("foo", "example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "bar": "2" }]);
    expect(catalogue.retrieve("foo", "example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "foo": "1" }]);
    expect(catalogue.retrieve("foo", "example2")).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "foo": "1" }]);

    done();     

  }); 

  it('can be emptied', function(done) {

    var catalogue = new Catalogue();

    expect(catalogue.retrieve('foo', 'example')).to.be.deep.equal([]);

    var examples = { 'foo' :
      [ { 'example' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
        { 'example' : [200, { "Content-Type": "text/html" }, { "foo": "bar" }] },
        { 'example' : [200, { "Content-Type": "text/html" }, ['a','b','c']] } ]
    }

    var classifications = Object.keys(examples);

    classifications.forEach(function(classification) {
      var entries = examples[classification];

      entries.forEach(function(input) {
        var keys = Object.keys(input);

        keys.forEach(function(key) {
          var record = input[key];
          catalogue.add(classification, key, record);
        })

      })
    })

    expect(catalogue.retrieve('foo', 'example')).to.be.deep.equal(examples['foo'][2]['example']);

    catalogue.empty('foo');

    expect(catalogue.retrieve('foo', 'example')).to.be.equal(null);

    done();     

  });

  it('can be delete an entry', function(done) {

    var catalogue = new Catalogue();
    var examples = { 'foo' : 
      [ { 'example1' : [200, { "Content-Type": "text/html" }, '{ "foo": "bar" }'] },
        { 'example1' : [200, { "Content-Type": "text/html" }, '{ "baz": "cat" }'] },
        { 'example2' : [200, { "Content-Type": "text/html" }, { "x": "y" }] },
        { 'example2' : [200, { "Content-Type": "text/html" }, ['a','b','c']] } ]
    }

    var classifications = Object.keys(examples);
    
    classifications.forEach(function(classification) {
      var entries = examples[classification];
      entries.forEach(function(input) {
        var keys = Object.keys(input);

        keys.forEach(function(key) {
          var record = input[key];
          catalogue.add(classification, key, record);
        })

      }) 
    })

    expect(catalogue.retrieve('foo', 'example1')).to.be.deep.equal([200, { "Content-Type": "text/html" }, '{ "baz": "cat" }']);
    expect(catalogue.retrieve('foo', 'example2')).to.be.deep.equal([200, { "Content-Type": "text/html" }, ['a','b','c']]);

    catalogue.delete('foo', 'example1');

    expect(catalogue.retrieve('foo', 'example1')).to.be.equal(null);
    expect(catalogue.retrieve('foo', 'example2')).to.be.deep.equal([200, { "Content-Type": "text/html" }, { "x": "y" }]);

    done();     

  });

});
