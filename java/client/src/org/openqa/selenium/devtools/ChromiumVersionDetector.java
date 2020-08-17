// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.devtools;

import org.openqa.selenium.remote.http.HttpHandler;

import java.net.URI;

public class ChromiumVersionDetector {

  public ChromiumVersionDetector(HttpHandler http) {

  }

  public String read(URI uri) {
    /*
    $ curl http://localhost:9222/json/version                                                                                                                                            trunk!?
{
   "Browser": "Chrome/85.0.4183.59",
   "Protocol-Version": "1.3",
   "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.59 Safari/537.36",
   "V8-Version": "8.5.210.19",
   "WebKit-Version": "537.36 (@7cc9a5ee672625c38427a839cb1b15efd3128084)",
   "webSocketDebuggerUrl": "ws://localhost:9222/devtools/browser/68083013-b4ee-4763-8b6f-25d54e8864e4"
}
$ curl http://localhost:9222/json/version                                                                                                                                            trunk!?
{
   "Browser": "Edg/84.0.522.40",
   "Protocol-Version": "1.3",
   "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 Edg/84.0.522.40",
   "V8-Version": "8.4.371.19",
   "WebKit-Version": "537.36 (@4ede1b0ab15e7ee434735507aa3e79d88ef95c48)",
   "webSocketDebuggerUrl": "ws://localhost:9222/devtools/browser/d5fc670d-d38b-42d0-a68f-b4dad418a324"
}

     */
    return null;
  }

}
