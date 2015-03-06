// Copyright 2014 Software Freedom Conservancy. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.require('goog.testing.jsunit');
goog.require('webdriver.Builder');



function testInitializeSessionIdFromQueryString_notSet() {
  var builder = new webdriver.Builder({
    location: '/somelocation'
  });
  assertUndefined(builder.getSession());
}


function testInitializeSessionIdfromQueryString_set() {
  var builder = new webdriver.Builder({
    location: '/somelocation?wdsid=foo'
  });
  assertEquals('foo', builder.getSession());
}


function testInitializeServerUrlFromQueryString_notSet() {
  var builder = new webdriver.Builder({
    location: '/somelocation'
  });
  assertEquals(webdriver.Builder.DEFAULT_SERVER_URL,
      builder.getServerUrl());
}


function testInitializeServerUrlFromQueryString_set() {
  var builder = new webdriver.Builder({
    location: '/somelocation?wdurl=http://www.example.com'
  });
  assertEquals('http://www.example.com', builder.getServerUrl());
}
