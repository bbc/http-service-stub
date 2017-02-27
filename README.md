# HTTP Service Stubs

Node service for stubbing responses to GET requests

## Creating Stubs

Create stubs by sending a PUT request to the path you want stubbed with a triple representing the response you want the next GET request to respond with:

    PUT http://example.org/example_path/ HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    
    [200, {"Content-Type": "application/json"}, "{ \"foo\": \"bar\" }"]

The triple consists of:

1. HTTP response code
2. HTTP headers
3. The body of the response

Additional PUT requests will overwrite the current stub.

## Requests 

A GET request for a stubbed resource will return the stubbed response if one exists or a 404 if one isn't available.

A DELETE request for a stubbed resource will remove the stub if it exists.

### Deployment

Deploy to AWS, or to Heroku with one click [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
