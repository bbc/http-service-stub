{
  "external_dependencies": {},
  "secure_configuration": {},
  "name": "http-service-stub",
  "component_resources_bucket": "",
  "environment": "dev",
  "release": "",
  "configuration": {
    "new_relic_app_name": "http-service-stub (dev)",
    "new_relic_license_key": "license key here",
    "new_relic_logging_filepath": "newrelic_agent.log"
  },
  "devDependencies": {
    "chai": "latest",
    "mocha": "latest",
    "speculate": "1.3.0"
  },
  "spec": {
    "post": [
      "mv /usr/lib/http-service-stub/bake-scripts/etc/bake-scripts/http-service-stub",
      "mv /usr/lib/http-service-stub/httpd-conf/http_vhost.conf /etc/httpd/conf.d/http_vhost.conf",
      "mv /usr/lib/http-service-stub/httpd-conf/cloud_ssl_no_certs.conf /etc/httpd/conf.d/cloud_ssl_no_certs.conf"
    ],
    "executable": [
      "./bake-scripts"
    ],
    "requires": [
      "cloud-httpd24-ssl-includes"
    ]
  }
}
