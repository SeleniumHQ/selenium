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


export const GridConfig = {
  status: {
    // How often we poll the GraphQL endpoint
    xhrPollingIntervalMillis: 5000
  },

  // Server config (Start the Selenium Server with the "--allow-cors true" flag)
  serverUri:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4444/graphql'
      : document.location.protocol + '//' + document.location.host + document.location.pathname.replace("/ui/", "") + '/graphql'
}
