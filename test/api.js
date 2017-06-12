const supertest = require('supertest');
const PORT = (process.env.PORT || 8080);
const server = require('../server.js')

server.listen(PORT, function(){});
request = supertest(server);

describe('/', function() {

  it('defaults to 200', function(done) {
    request.get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {}, done);
  });

});

describe('requests for unstubbed responses', function() {

  it('receive a 404 Unavailable', function(done) {
    request.get('/example')
      .set('Accept', 'application/xml')
      .expect(404, done);
  });

});

describe('creating', function() {

  describe('stubs with a string body', function() {

    it('receives a 201 Created', function(done) {
      request.put('/example')
        .set('Accept', 'application/json')
        .send([200, { "Content-Type": "application/json" }, "{ \"foo\": 1 }"])
        .expect(201, done);
    });

    it('creates the stub', function(done) {
      request.get('/example')
        .set('Accept', 'application/json')
        .expect(200, { "foo": "1" })
        .expect('Content-Type', /json/, done)
    });

    it('persists', function(done) {
      request.get('/example')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, { "foo": "1" }, done);
    });

  });

  describe('stubs with a json body', function() {

    it('receives a 201 Created', function(done) {
      request.put('/example')
        .set('Accept', 'application/json')
        .send([200, { "Content-Type": "application/json" }, { "foo": 1 }])
        .expect(201, done);
    });

    it('creates the stub', function(done) {
      request.get('/example')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, { "foo": "1" }, done);
    });

    it('persists', function(done) {
      request.get('/example')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, { "foo": "1" }, done);
    });

  });

  describe('stubs without a body', function() {

    it('receives a 201 Created', function(done) {
      request.put('/example')
        .set('Accept', 'application/json')
        .send([500])
        .expect(201, done);
    });

    it('creates the stub', function(done) {
      request.get('/example')
        .set('Accept', 'application/json')
        .expect(500, done);
    });

  });

  describe('unsuccessfully due to incomplete stub', function() {

    it('receives a 400 Bad Request', function(done) {
      request.put('/example')
        .set('Accept', 'application/xml')
        .expect(400, done);
    });

  }); 

  describe('adding successive stubs', function() {

    beforeEach(function(done) {
      request.delete('/')
      .expect(200, done)
    });

    it('has a policy of last in first out with the oldest one cached', function(done) {

      request.put('/example')
        .set('Accept', 'application/json')
        .send([200, { "Content-Type": "application/json" }, "{ \"foo\": 1 }"])
        .expect(201).end(function() {

            request.put('/example')
            .set('Accept', 'application/json')
            .send([200, { "Content-Type": "application/json" }, "{ \"bar\": 2 }"])
            .expect(201).end(function() {

              request.put('/example')
              .set('Accept', 'application/json')
              .send([200, { "Content-Type": "application/json" }, "{ \"baz\": 3 }"])
              .expect(201).end(function() {

                  request.get('/example')
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200, { "baz": 3 }).end(function() {

                    request.get('/example')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200, { "bar": 2 }).end(function() {

                      request.get('/example')
                      .set('Accept', 'application/json')
                      .expect('Content-Type', /json/)
                      .expect(200, { "foo": 1 }).then(function() {

                        request.get('/example')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200, { "foo": 1 }, done)

                      })

                    });

                  });

                });

            });

        });

    })

  });

});

describe('deleting', function() { 

  describe('individual stubs', function() {

    describe('successfully', function() {

      request.put('/example')
        .set('Accept', 'application/json')
        .send([200, { "Content-Type": "application/json" }, "{ \"qux\": 1 }"])


      it('receives a 200 Success', function(done) {
        request.delete('/example')
          .expect(200, done);
      });

      it('deletes the stub', function(done) {
        request.get('/example')
          .expect(404, done);
      });

    });

  });

  describe('all stubs', function() {

    describe('successfully', function() {

      request.put('/example')
        .set('Accept', 'application/json')
        .send([200, { "Content-Type": "application/json" }, "{ \"quux\": 1 }"])


      request.put('/second_example')
        .set('Accept', 'application/json')
        .send([200, { "Content-Type": "application/json" }, "{ \"corge\": 2 }"])


      it('receives a 200 Success', function(done) {
        request.delete('/')
          .expect(200, done)
      });

      it('deletes the first stub', function(done) {
        request.get('/example')
          .expect(404, done);
      });

      it('deletes the second stub', function(done) {
        request.get('/second_example')
          .expect(404, done);
      });

    });

  });

});
