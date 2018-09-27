# node-docker-registry-client

A Docker Registry API client for node.js.

Limitations: Currently only support for Registry API v1
(<https://docs.docker.com/v1.6/reference/api/registry_api/>) *pull* support
(i.e. excluding API endpoints for push) and Registry API v2 *pull* support.
Support for v2 push endpoints is coming.

Note: This repository is part of the Joyent Triton project. See the
[contribution
guidelines](https://github.com/joyent/triton/blob/master/CONTRIBUTING.md) --
*Triton does not use GitHub PRs* -- and general documentation at the main
[Triton project](https://github.com/joyent/triton) page.


## Install

    npm install docker-registry-client


## Overview

Most usage of this package involves creating a *Registry* API client for a
specific *repository* and calling its methods.

A Registry client requires a repository name (called a `repo` in the code):

    [INDEX/]NAME                # a "repo name"

Examples:

    mongo                       # implies default index (docker.io) and namespace (library)
    docker.io/mongo             # same thing
    docker.io/library/mongo     # same thing

    myreg.example.com:5000/busybox   # a "busybox" repo on a private registry

    quay.io/trentm/foo          # trentm's "foo" repo on the quay.io service

The `parseRepo` function is used to parse these. See "examples/parseRepo.js"
to see how they are parsed:

    $ node examples/parseRepo.js mongo
    {
        "index": {
            "name": "docker.io",
            "official": true
        },
        "official": true,
        "remoteName": "library/mongo",
        "localName": "mongo",
        "canonicalName": "docker.io/mongo"
    }


Commonly, a "repo name and tag" string is used for working with a Docker
registry, e.g. `docker pull busybox:latest`. The v2 API adds support for using
"repo name and digest" to stably identify images, e.g. `docker pull
alpine@sha256:fb9f16730ac6316afa4d97caa5130219927bfcecf0b0ce35c01dcb612f449739`.
This package provides a `parseRepoAndRef` (and the synonym `parseRepoAndTag`)
for that, e.g.:

    $ node examples/parseRepoAndRef.js myreg.example.com:5000/busybox:foo
    {
        "index": {
            "name": "myreg.example.com:5000",
            "official": false
        },
        "official": false,
        "remoteName": "busybox",
        "localName": "myreg.example.com:5000/busybox",
        "canonicalName": "myreg.example.com:5000/busybox",
        "tag": "foo"
    }


Slightly different than docker.git's parsing, this package allows the
scheme to be given on the index:

    $ node examples/parseRepoAndRef.js https://quay.io/trentm/foo
    {
        "index": {
            "scheme": "https",              // <--- scheme
            "name": "quay.io",
            "official": false
        },
        "official": false,
        "remoteName": "trentm/foo",
        "localName": "quay.io/trentm/foo",
        "canonicalName": "quay.io/trentm/foo",
        "tag": "latest"                     // <--- default to 'latest' tag
    }

If a scheme isn't given, then "https" is assumed.


## Usage

If you know, for example, that you are only dealing with a v2 Docker Registry,
then simple usage will look like this:

    var drc = require('docker-registry-client');
    var REPO = 'alpine';
    var client = drc.createClientV2({name: REPO});

    client.listTags(function (err, tags) {
        // ...
        console.log(JSON.stringify(tags, null, 4));

        /*
         * Because the client is typically using Keep-Alive, it will maintain
         * open connections. Therefore you should call `.close()` to close
         * those when finished.
         */
        client.close();
    });

A more complete example (showing logging, auth, etc.):

    var bunyan = require('bunyan');
    var drc = require('docker-registry-client');

    // This package uses https://github.com/trentm/node-bunyan for logging.
    var log = bunyan.createLogger({
        name: 'regplay',
        // TRACE-level logging will show you all request/response activity
        // with the registry. This isn't suggested for production usage.
        level: 'trace'
    });

    var REPO = 'alpine';
    var client = drc.createClientV2({
        name: REPO,
        log: log,
        // Optional basic auth to the registry
        username: <username>,
        password: <password>,
        // Optional, for a registry without a signed TLS certificate.
        insecure: <true|false>,
        // ... see the source code for other options
    });


This package also supports the nominal technique for pinging the registry
to see if it supports v2, otherwise falling back to v1:

    var drc = require('docker-registry-client');

    var REPO = 'alpine';
    drc.createClient({name: REPO, /* ... */}, function (err, client) {
        console.log('Got a Docker Registry API v%d client', client.version);
        // ...
    });



## v2 API

A mapping of the [Docker Registry API v2
endpoints](https://docs.docker.com/registry/spec/api/#detail) to the API
equivalents in this client lib. "NYI" means the endpoint is not yet implemented
by this client lib.

| Name                 | Endpoint | Description |
| -------------------- | -------- | ----------- |
| ping                 | `GET /v2/` | Check that the endpoint implements Docker Registry API V2. |
| listTags             | `GET /v2/<name>/tags/list` | Fetch the tags under the repository identified by `name`. |
| getManifest          | `GET /v2/<name>/manifests/<reference>` | Fetch the manifest identified by `name` and `reference` where `reference` can be a tag or digest. |
| putManifest          | `PUT /v2/<name>/manifests/<reference>` | **NYI.** Put the manifest identified by `name` and `reference` where `reference` can be a tag or digest. |
| deleteManifest       | `DELETE /v2/<name>/manifests/<reference>` | **NYI.** Delete the manifest identified by `name` and `reference` where `reference` can be a tag or digest. |
| createBlobReadStream | `GET /v2/<name>/blobs/<digest>` | Retrieve the blob from the registry identified by `digest`. |
| headBlob             | `HEAD /v2/<name>/blobs/<digest>` | Retrieve the blob from the registry identified by `digest` -- just the headers. |
| startBlobUpload      | `POST /v2/<name>/blobs/uploads/` | **NYI.** Initiate a resumable blob upload. If successful, an upload location will be provided to complete the upload. Optionally, if the `digest` parameter is present, the request body will be used to complete the upload in a single request. |
| getBlobUploadStatus  | `GET /v2/<name>/blobs/uploads/<uuid>` | **NYI.** Retrieve status of upload identified by `uuid`. The primary purpose of this endpoint is to resolve the current status of a resumable upload. |
| uploadBlobChunk      | `PATCH /v2/<name>/blobs/uploads/<uuid>` | **NYI.** Upload a chunk of data for the specified upload. |
| completeBlobUpload   | `PUT /v2/<name>/blobs/uploads/<uuid>` | **NYI.** Complete the upload specified by `uuid`, optionally appending the body as the final chunk. |
| cancelBlobUpload     | `DELETE /v2/<name>/blobs/uploads/<uuid>` | **NYI.** Cancel outstanding upload processes, releasing associated resources. If this is not called, the unfinished uploads will eventually timeout. |
| deleteBlob           | `DELETE /v2/<name>/blobs/<digest>` | **NYI.** Delete the blob identified by `name` and `digest`. Warning: From the Docker spec I'm not sure that `deleteBlob` doesn't corrupt images if you delete a shared blob. |
| listRepositories     | `GET /v2/_catalog/` | **NYI** List all repositories in this registry. [Spec.](https://docs.docker.com/registry/spec/api/#listing-repositories) |


See ["examples/v2/*.js"](./examples/) for short code examples one can run from
the CLI for each API endpoint. E.g.:

    $ npm install   # install dependencies for this module
    $ node examples/v2/listTags.js busybox
    {
        "name": "library/busybox",
        "tags": [
            "buildroot-2013.08.1",
            "buildroot-2014.02",
            "latest",
            "ubuntu-12.04",
            "ubuntu-14.04"
        ]
    }

You can also get logging on processing and HTTP requests/responses via the
`-v` option to the example scripts. This library uses
[Bunyan](https://github.com/trentm/node-bunyan) for logging, so you'll
want to pipe the log output (on stderr) through the `bunyan` command for
pretty output:

    $ node examples/v2/listTags.js -v busybox 2>&1 | ./node_modules/.bin/bunyan
    [2015-06-01T22:26:44.065Z] TRACE: v2.listTags/registry/23400 on grape.local: request sent
        GET /v2/ HTTP/1.1
        Host: registry-1.docker.io
        accept: application/json
        user-agent: node-docker-registry-client/2.0.0 (x64-darwin; node/0.10.28)
        date: Mon, 01 Jun 2015 22:26:44 GMT
    [2015-06-01T22:26:44.480Z] TRACE: v2.listTags/registry/23400 on grape.local: Response received (client_res={})
        HTTP/1.1 401 Unauthorized
        content-type: application/json; charset=utf-8
        docker-distribution-api-version: registry/2.0
        www-authenticate: Bearer realm="https://auth.docker.io/token",service="registry.docker.io"
        date: Mon, 01 Jun 2015 22:26:44 GMT
        content-length: 114
        connection: close
        strict-transport-security: max-age=3153600
    [2015-06-01T22:26:44.482Z] TRACE: v2.listTags/registry/23400 on grape.local:
        body received:
        {"errors":[{"code":"UNAUTHORIZED","message":"access to the requested resource is not authorized","detail":null}]}
    [2015-06-01T22:26:44.485Z] TRACE: v2.listTags/registry/23400 on grape.local: login
    [2015-06-01T22:26:44.487Z] DEBUG: v2.listTags/registry/23400 on grape.local: login: get Bearer auth token
    ...
    [2015-06-01T22:26:45.680Z] TRACE: v2.listTags/registry/23400 on grape.local:
        body received:
        {"name":"library/busybox","tags":["buildroot-2013.08.1","buildroot-2014.02","latest","ubuntu-12.04","ubuntu-14.04"]}
    {
        "name": "library/busybox",
        "tags": [
            "buildroot-2013.08.1",
            "buildroot-2014.02",
            "latest",
            "ubuntu-12.04",
            "ubuntu-14.04"
        ]
    }


## v1 API

A mapping of the [Docker Registry API v1
endpoints](https://docs.docker.com/v1.6/reference/api/registry_api/) to the API
equivalents in this client lib.

*Limitation:* Only the read endpoints of the v1 API are implement. I.e.
putting layers, deleting repositories, setting/deleting tags are all not
implemented.

| Name              | Endpoint | Description |
| ----------------- | -------- | ----------- |
| ping              | `GET /v1/_ping` | Check status of the registry. |
| search            | `GET /v1/search` | Search the index. |
| listRepoImgs      | `GET /v1/repositories/$repo/images` | List all images in this repo. This is actually against the ["Index API"](https://docs.docker.com/v1.7/reference/api/docker-io_api/#list-user-repository-images) (aka "Hub API"). |
| listRepoTags      | `GET /v1/repositories/$repo/tags` | List all tags for a repo. |
| getImgAncestry    | `GET /v1/images/$imgId/ancestry` | Get the ancestry of an image. |
| getImgJson        | `GET /v1/images/$imgId/json` | Get the metadata (sometimes called the "image JSON") for an image. |
| getImgLayerStream | `GET /v1/images/$imgId/layer` | Download the image layer file. |
| -                 | `PUT /v1/images/$imgId/layer` | *Not implemented.* Put image layer. |
| -                 | `DELETE /v1/repositories/$repo/tags/$tag` | *Not implemented.* Delete a repo tag. |
| -                 | `PUT /v1/repositories/$repo/tags/$tag` | *Not implemented.* Set a repo tag. |
| -                 | `DELETE /v1/repositories/$repo` | *Not implemented.* Delete a repo. |


See ["examples/v1/*.js"](./examples/) for short code examples one can run from
the CLI for each API endpoint. E.g.:

    $ npm install   # install dependencies for this module
    $ node examples/v1/listRepoTags.js busybox
    {
        "buildroot-2013.08.1": "3dba22db9896eb5f020691e1f8cda46735de533ca7b6b1b3b072272752935bad",
        "buildroot-2014.02": "8c2e06607696bd4afb3d03b687e361cc43cf8ec1a4a725bc96e39f05ba97dd55",
        "latest": "8c2e06607696bd4afb3d03b687e361cc43cf8ec1a4a725bc96e39f05ba97dd55",
        "ubuntu-12.04": "faf804f0e07b2936e84c9fe4ca7c60a6246cc669cf2ff70969f14a9eab6efb48",
        "ubuntu-14.04": "32e97f5f5d6bd15b9cc293b38a5102a7ddac736852811110043992b20553177a"
    }

You can also get logging on processing and HTTP requests/responses via the
`-v` option to the example scripts. This library uses
[Bunyan](https://github.com/trentm/node-bunyan) for logging, so you'll
want to pipe the log output (on stderr) through the `bunyan` command for
pretty output:

    $ node listRepoTags.js -v busybox 2>&1 | bunyan
    [2015-09-02T22:14:35.790Z] TRACE: listRepoTags/registry/13388 on danger0.local: get session token/cookie
    [2015-09-02T22:14:35.836Z] TRACE: listRepoTags/registry/13388 on danger0.local: request sent
        GET /v1/repositories/library/busybox/images HTTP/1.1
        Host: index.docker.io
        X-Docker-Token: true
        accept: application/json
        user-agent: node-docker-registry-client/2.0.0 (x64-darwin; node/0.10.40)
        date: Wed, 02 Sep 2015 22:14:35 GMT
    [2015-09-02T22:14:36.374Z] TRACE: listRepoTags/registry/13388 on danger0.local: Response received (client_res={})
        HTTP/1.1 200 OK
        server: nginx/1.6.2
        date: Wed, 02 Sep 2015 22:14:36 GMT
    ...
    [2015-09-02T22:14:37.888Z] TRACE: listRepoTags/registry/13388 on danger0.local:
        body received:
        {"buildroot-2013.08.1": "3dba22db9...
    [2015-09-02T22:14:37.888Z] TRACE: listRepoTags/registry/13388 on danger0.local: close http client (host=index.docker.io)
    [2015-09-02T22:14:37.889Z] TRACE: listRepoTags/registry/13388 on danger0.local: close http client (host=registry-1.docker.io)
    {
        "buildroot-2013.08.1": "3dba22db9896eb5f020691e1f8cda46735de533ca7b6b1b3b072272752935bad",
        "buildroot-2014.02": "8c2e06607696bd4afb3d03b687e361cc43cf8ec1a4a725bc96e39f05ba97dd55",
        "latest": "8c2e06607696bd4afb3d03b687e361cc43cf8ec1a4a725bc96e39f05ba97dd55",
        "ubuntu-12.04": "faf804f0e07b2936e84c9fe4ca7c60a6246cc669cf2ff70969f14a9eab6efb48",
        "ubuntu-14.04": "32e97f5f5d6bd15b9cc293b38a5102a7ddac736852811110043992b20553177a"
    }


V1 client usage:

    var repo = 'alpine';
    var client = drc.createClientV1({
        name: repo,
        // ...
    });
    client.listRepoTags(function (err, repoTags) {
        client.close();
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log(JSON.stringify(repoTags, null, 4));
    });


## Development

### Naming convensions

For naming this package attempts to consistently use `repo` for repository,
`img` for image, etc.


### Commits

Before commit, ensure that the following checks are clean:

    make prepush

Also see the note at the top that cr.joyent.us is used for code review for
this repo.


### Releases

Changes with possible user impact should:

1. Add a note to the changelog (CHANGES.md).
2. Bump the package version appropriately.
3. Once merged to master, the new version should be tagged and published to npm
   via:

        make cutarelease

   To list to npm accounts that have publish access:

        npm owner ls docker-registry-client

The desire is that users of this package use published versions in their
package.json `dependencies`, rather than depending on git shas.
