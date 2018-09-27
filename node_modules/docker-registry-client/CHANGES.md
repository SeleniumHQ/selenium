# node-docker-registry-client Changelog

## not yet released

(nothing yet)

## 3.3.0

- DOCKER-524 Implement docker push. Adds uploadBlob and putManifest API methods.

## 3.2.13

- DOCKER-1050 add redirect handling for docker registry client getManifest call

## 3.2.12

- joyent/node-docker-registry-client#23 Namespace validation too strict

## 3.2.11

- DOCKER-1095 docker pull should distinguish between auth error and not found
  error

## 3.2.10

- DOCKER-1104 support docker manifest lists

## 3.2.9

- DOCKER-1097 docker pull fails for registry server that has no auth setup

## 3.2.8

- DOCKER-1091 Cannot login into Artifactory private docker registry. This change
  drops authorization headers from the first ping request.

## 3.2.7

- joyent/node-docker-registry-client#16 Allow a repo name to have a '/', e.g.
  `registry.gitlab.com/masakura/docker-registry-client-bug-sample/image`
  (by Józsa Péter).

## 3.2.6

- DOCKER-984 Add a 10s connect timeout for endpoints involved in initial
  contact with a given Docker registry. This allows faster failing for
  unreachable hosts.

## 3.2.5

- DOCKER-983 Change v1 registry session setup to *not* do retries. This allows
  failing fast when, for example, the registry endpoint URL is bogus.

## 3.2.4

- DOCKER-959 Unable to pull from registry when registry response sends multiple
  Docker-Distribution-Api-Version headers.

## 3.2.3

- IMGAPI-596 Move from restify-clients fork to restify-clients@1.4.0 with
  upstreamed HTTP proxy support.

## 3.2.2

- DOCKER-950 Docker pull fails on registry that does not use authentication

## 3.2.1

- DOCKER-663 Support Amazon ECR Registry

## 3.2.0

- DOCKER-940: Update to support node v4 without build errors.
- DOCKER-825: Support Google Registry
- DOCKER-929: Support the docker v2.2 manifest format. The `createClientV2` and
  `getManifest` functions now allow an optional `maxSchemaVersion` argument to
  allow you to specify the maximum manifest schema version you will receive for
  getManifest calls. Default is 1 for a schemaVersion 1 format (aka v2.1), a
  value of 2 means schemaVersion 2 (aka v2.2).
- #8 Fix usage against a *http* registry.
- #7 Fix test suite against Docker Hub.


## 3.1.5

- DOCKER-772: Change `pingV2` to `callback(err)` rather than `throw err` if
  the given `opts.indexName` is invalid.


## 3.1.4

- DOCKER-764: As of Docker 1.11, `docker login` will no longer prompt for an
  email (docker/docker#20565). This updates `drc.login()` to no blow up
  attempting to do v1 login if an email is not provided.


## 3.1.3

- DOCKER-689 Don't overwrite `err.body` for an HTTP response error that doesn't have
  a JSON body.


## 3.1.2

- IMGAPI-546: 'docker pull nope.example.com/nope' throws exception in IMGAPI


## 3.1.1

- IMGAPI-542: Don't *require* the Docker-Content-Digest header on v2 GetBlob
  server responses: `RegistryClientV2.prototype.createBlobReadStream`. Also
  don't throw if can't parse an existing Docker-Content-Digest header.


## 3.1.0

- [pull #6, plus some additions] Allow one to ping a v2 registry using bearer
  token auth. Typically one shouldn't need to login for the ping endpoint,
  because the point is to check for 404 (doesn't support v2) or not (supports
  v2). However, there is no good reason one shouldn't be able to ping it
  with auth.

  This adds `RegistryClientV2.prototype.login()` and the top-level `pingV2()`
  accepts a `opts.authInfo` as returned by `loginV2()`.

  Sample code doing this:

        var drc = require('docker-registry-client');
        var bunyan = require('bunyan');

        var log = bunyan.createLogger({name: 'pingplay', level: 'trace'});
        var client = drc.createClientV2({
            name: 'docker.io',
            log: log,
            username: 'MY-USERNAME',
            password: 'MY-PASSWORD'
        });

        client.ping(function(err, body, res) {
            if (!err) {
                console.log('Success on first try');
            } else if (err.statusCode === 401) {
                client.login({
                    pingErr: err,
                    pingRes: res
                }, function(err, result) {
                    client.ping(function(err, body, res) {
                        if (!err) {
                            console.log('Success');
                        } else {
                            console.log('Fail:', err);
                        }
                    });
                });
            } else {
                console.log('Huh?', err);
            }
        });



## 3.0.5

- DOCKER-643: RegistryClientV2 doesn't pass `insecure` flag to `ping()`
  function properly.


## 3.0.4

- DOCKER-640: Fix assertion hit when attempting `getManifest` (or other v2 API
  endpoints) against a v2 Docker Registry that uses Basic auth **but when not
  passing auth info.**

  Triton's IMGAPI currently does the latter as part of a `docker pull` to
  determine if the repo is private. See
  <https://github.com/joyent/sdc-imgapi/blob/f5384db7ddc4e1ef9a54f6e6fbe15d11093e3155/lib/images.js#L3378-L3448>.

- Fix my config error that made me think the v2.quayioprivate tests
  were failing. Re-enable that test in `make test`.


## 3.0.3

- DOCKER-627: Fix login for v2 quay.io. Two issues here:
  1. quay.io has a bug where www-authenticate header isn't always in 401 response headers
  2. passing "scope=" (empty value) query param to quay.io/v2/auth results in a 400


## 3.0.2

- DOCKER-625: Fix v1 pull of 'rhel7' from Docker Hub, which *redirects*
  to the registry.access.redhat.com repository.  Warning: This only
  works if you know apriori to use v1... which typically you would NOT
  know because Docker Hub supports v2. IOW, it is up to the caller
  if this lib to do the appropriate v2 -> v1 fallback logic.

- DOCKER-625: Fix v1 API against registry.access.redhat.com. E.g.
  for `docker pull registry.access.redhat.com/rhel7`. This implementation of
  the Docker Registry v1 involves 3xx redirs for more endpoints. Needed to
  support that.

- DOCKER-622: Tests for quay.io v2: working without auth, fails with auth.
  `make test` is currently wired to skip the known failing v2 quay.io private
  tests. Will revisit this later.  See "test/v2.quayio.test.js" for some
  notes on what I think are quay.io v2 bugs that I'll report.


## 3.0.1

- DOCKER-586 Allow `opts.proxy` to be a boolean.


## 3.0.0

- DOCKER-586 Add `drc.pingV2`, `drc.loginV2` and `drc.login`. The latter knows
  how to login to a Docker Registry API via v1 or v2 (discovering which
  properly).

- (Backward incompatible.) The callback from `pingV1` has this form:
        function (err, result)
  That result has changed from:
        {"Status": "(string status)"}    # old
  to:
        {"status": "(string status)"}    # new (lowercase 'status')
  because (a) let's not depart from the typical starts-with-lowercase naming
  in this module just to follow the form of the Docker Remote API "GET /auth"
  response, and (b) this will mean being compatible with `pingV2`.


## 2.0.2

- DOCKER-583: Docker pull from v1 private registry failed with Resource Not Found error

## 2.0.1

- DOCKER-580 Fix "too few args to sprintf" error when failing token auth.
- Fix passing through of username (for token 'account' field) and basic
  authorization for token auth.


## 2.0.0

- A start at Docker Registry API v2 support. For now just *pull* support (the
  subset of the API needed for `docker pull`). Support for the rest of the API
  is coming.  See the updated README and "examples/v2/".

- Fix reliability issues with v2 download of large layer files.
  My understanding is that this was due to <https://github.com/nodejs/node/issues/3055>.
  This module is now avoiding `agent: false`, at least for the blob downloads.


## 1.4.1

- DOCKER-549 Fix pulling from quay.io *private* repos.


## 1.4.0

- Test suites improvements to actually check against docker.io, quay.io, and
  optionally a jfrog artifactory Docker v1 repo.
- DOCKER-380: Support for quay.io. Quay.io uses cookies for repository sessions.
  This involved refactoring the standalone/token handling to be more generically
  for "sessions". It simplified the code quite a lot.
- DOCKER-540 Update examples to take a '-k,--insecure' option to allow
  access to registries with self-signed certs.
- DOCKER-539 Allow passing through a proxy for `drc.login(...)`.
- v1 Ping should send auth headers, if any. A private registry might very well
  require auth on the ping endpoint.
- v1 Search doesn't need to do a ping. Presumably this is historical for
  mistakenly thinking there was a need to determine `this.standalone`.


## 1.3.0

- [DOCKER-526] HTTP proxy support. This should work either (a) with the
  `http_proxy`/`https_proxy` environment variables, or (b) in code like this:

        var url = require('url');
        var drc = require('docker-registry-client');
        var client = drc.createClient({
            name: 'busybox',
            proxy: url.parse('http://my-proxy.example.com:8080'),
            //...
        });

  One side-effect of this change is the underlying HTTP connections no longer
  set `agent: false` to avoid Node's default HTTP agent. This means that if you
  are **not** using a proxy, you will now get keep-alive, which means a
  persistent connection that could hold your node script/app from exiting. All
  users of this client should explicitly close the client when complete:

        client.close();

  The "example/\*.js" scripts all do this now.



## 1.2.2

- [pull #4] Fix `getImgAncestry` when using node 0.12 (by github.com/vincentwoo).


## 1.2.1

- Sanitize the non-json (text/html) `err.message` from `listRepoImgs` on a 404.
  See before and after: https://gist.github.com/trentm/94c11e1243fb7fd4fe90


## 1.2.0

- Add `drc.login(...)` for handling a Docker Engine would use for the Remote
  API side of `docker login`.


## 1.1.0

- `RegistryClient.ping` will not retry so that a ping failure check is quick.
  Without this it was retrying for ~15s.
- `RegistryClient.search` now does a ping check before searching (fail fast).
- `createClient({userAgent: ...})` option. Defaults to
  'node-docker-registry-client/$ver (...)'.
- A client to localhost will default to the 'http' scheme to (mostly) match
  docker-docker's behaviour here.


## 1.0.0

A major re-write with lots of backwards compat *breakage*.  This release adds
support for indeces/registries other than the "official" docker.io default.
It changes usage to feel a bit more like docker/docker.git's "registry" package.
So far this still only supports Registry API v1.

Basically the whole usage has changed. There is no longer a "Registry Session",
session handling is done lazily under the hood. There is no longer a separate
"Index API Client", the only client object is the "RegistryClient" setup via:

    var client = drc.createClient({...});

There *is* a `drc.pingIndex()` which can be used to check that a registry
host (aka an "index" from the old separation of an "Index API") is up.
Usage is best learned from the complete set of examples in "examples/".


- **Backward incompat change** in return value from `parseRepoAndTag`.
  In addition to adding support for the optional index prefix, and a
  "@DIGEST" suffix, the fields on the return value have been changed to
  more closely match Docker's `RepositoryInfo` fields:

        {
            index: {
                name: INDEX_NAME
                official: BOOL
            },
            remoteName: ...,
            localName: ...,
            canonicalName: ...,
            official: BOOL
        }

  E.g.

        {
            index: {
                name: 'docker.io'
                official: true
            },
            remoteName: 'library/mongo',
            localName: 'mongo',
            canonicalName: 'docker.io/mongo',
            official: true
        }

  See <https://github.com/docker/docker/blob/2e4d36ed80855375231501983f19616ba0238a84/registry/types.go#L71-L96>
  for an example.

  Before:

        {
            ns: NS,
            name: NAME,
            repo: NS/NAME,
            tag: TAG || 'latest'
        }

  e.g.:

        {
            ns: 'library',
            name: 'mongo',
            repo: 'library/mongo',
            tag: '1.2.3'
        }



## 0.3.2

Note: Any 0.x work (I don't anticipate any) will be on the "0.x" branch.

- Update deps to move fwd to 0.12-supporting versions of things.

## 0.3.1

- Switch to '^x.y.x' for deps to allow for node\_modules dedupe in
  apps using this module.

## 0.3.0

- Add `RegistrySession.getImgId()`, `parseRepoAndTag()`,
  `RegistrySession.getImgLayerStream()`.
- Export `parseRepoAndTag()` function.
- Add `repoImgs` to object returned by `IndexClient.getRepoAuth`. For images
  with "checksum" values this could possibly be useful for validation of
  subsequent downloads.
- URL encode params in API call paths.


## 0.2.0

Started changelog after this version.
