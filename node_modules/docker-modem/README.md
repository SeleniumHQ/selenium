# docker-modem [![Build Status](https://travis-ci.org/apocas/docker-modem.svg?branch=master)](https://travis-ci.org/apocas/docker-modem)

[Docker](https://www.docker.com/)'s Remote API network layer module.

`docker-modem` will help you talking with `Docker`, since it already implements all the network strategies needed to support all `Docker`'s Remote API endpoints.

It is the module powering (network wise) [dockerode](https://github.com/apocas/dockerode) and other modules.

## Tests

 * Tests are implemented using `mocha` and `chai`. Run them with `npm test`.
 * Check [dockerode](https://github.com/apocas/dockerode) tests, which is indirectly co-testing `docker-modem`.

## License

Pedro Dias - [@pedromdias](https://twitter.com/pedromdias)

Licensed under the Apache license, version 2.0 (the "license"); You may not use this file except in compliance with the license. You may obtain a copy of the license at:

http://www.apache.org/licenses/LICENSE-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the license is distributed on an "as is" basis, without warranties or conditions of any kind, either express or implied. See the license for the specific language governing permissions and limitations under the license.
