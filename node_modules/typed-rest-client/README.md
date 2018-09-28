# Typed Rest and Http Client with TypeScript Typings

A lightweight Rest and Http Client optimized for use with TypeScript with generics and async await.

## Status

With 0.9 just published, we believe the API surface for 1.0 has settled.  More testing in progress then we will release 1.0.

## Features

  - Rest Client with typescript generics and async/await/Promises
  - Http Client with pipe stream support and async/await/Promises 

```javascript
import * as rm from 'typed-rest-client/RestClient';

let restc: rm.RestClient = new rm.RestClient('rest-samples', 
                                             'https://mystudentapiserver');

let res: rm.IRestResponse<Student> = await restc.get<Student>('/students/5');

console.log(res.statusCode);
console.log(res.result.name);
```

  - Typings included so no need to acquire separately (great for intellisense and no versioning drift)

![intellisense](./docs/intellisense.png)

  - Basic, Bearer and NTLM Support out of the box
  - Proxy support
  - Certificate support (Self-signed server and client cert)
  - Layered for Rest or Http use
  - Full Samples and Tests included for usage

## Install the library
```
npm install typed-rest-client --save
```

## Samples

See [samples](./samples) for complete coding examples

### Typings

Typings (.d.ts) are distributed with the client, so intellisense and compile support just works from `tsc` and [vscode]()  

## Pre-Requisites

Pre-req: prefer [Node 6.9.3 LTS](https://nodejs.org), minimum [Node >= 4.4.7 LTS](https://nodejs.org)
Typings: `npm install typings -g`  

Once (or when dependencies change):  

```bash
npm install
typings install
```

## Build 

```bash
npm run build
```

## Running Samples

Run samples:  

```bash
$ npm run samples
```

## Contributing

To contribute to this repository, see the [contribution guide](./CONTRIBUTING.md)

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
