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

package org.openqa.grid.e2e.misc;

@SuppressWarnings("unchecked")
public class GridListActiveSessionsTest {

//  @Test
//  public void testNoSessions() throws Exception {
//    runTest(1, 0, map -> {
//      List<Map<String, Object>> proxies = extractProxies(map);
//      assertTrue("No sessions data should be found", proxies.isEmpty());
//    });
//  }
//
//  @Test
//  public void testOneSessionWithSingleProxy() throws Exception {
//    runTestForMultipleSessions(1, 1, 1);
//  }
//
//  @Test
//  public void testMultipleSessionsWithSingleProxy() throws Exception {
//    runTestForMultipleSessions(1, 2, 2);
//  }
//
//  @Test
//  public void testMultipleSessionsWithMultipleProxies() throws Exception {
//    runTestForMultipleSessions(2, 2, 1);
//  }
//
//  private void runTestForMultipleSessions(int howManyNodes, int howManySessions,
//                                          int expectedSessionsPerProxy) throws Exception {
//    runTest(howManyNodes,
//            howManySessions,
//            map -> {
//              List<Map<String, Object>> proxies = extractProxies(map);
//              assertEquals("Number of proxies", howManyNodes, proxies.size());
//              for (Map<String, Object> proxy : proxies) {
//                Map<String, Object> sessions = (Map<String, Object>) proxy.get("sessions");
//                List<?> values = (List<?>) sessions.get("value");
//                assertEquals("Sessions per proxy", expectedSessionsPerProxy,
//                             values.size());
//              }
//            });
//  }
//
//  private void runTest(int nodesCount, int howMany,
//                       Consumer<Map<String, Object>> assertions) throws Exception {
//    Hub hub = null;
//    List<RemoteWebDriver> drivers = new ArrayList<>();
//    try {
//      hub = GridTestHelper.prepareTestGrid(nodesCount);
//      drivers = createSession(howMany, hub);
//      Map<String, Object> sessions = getSessions(hub);
//      assertions.accept(sessions);
//    } finally {
//      drivers.forEach(RemoteWebDriver::quit);
//      if (hub != null) {
//        hub.stop();
//      }
//    }
//  }
//
//  private List<RemoteWebDriver> createSession(int howMany, Hub hub) {
//    List<RemoteWebDriver> drivers = new ArrayList<>();
//    if (howMany == 0) {
//      return drivers;
//    }
//    URL url;
//    try {
//      url = new URL("http://" + hub.getUrl().getHost() + ":" +
//                    hub.getUrl().getPort() + "/wd/hub");
//    } catch (MalformedURLException e) {
//      return new ArrayList<>();
//    }
//    for (int i = 0; i < howMany; i++) {
//      drivers.add(new RemoteWebDriver(url, GridTestHelper.getDefaultBrowserCapability()));
//    }
//    return drivers;
//
//  }
//
//  private Map<String, Object> getSessions(Hub hub) throws IOException {
//    String url = String.format("http://%s:%d/grid/api/sessions", hub.getUrl().getHost(),
//                               hub.getUrl().getPort());
//    URL grid = new URL(url);
//    URLConnection connection = grid.openConnection();
//    try (InputStream in = connection.getInputStream();
//         JsonInput input = new Json().newInput(new BufferedReader(new InputStreamReader(in)))) {
//      return input.read(Json.MAP_TYPE);
//
//    }
//  }
//
//  private List<Map<String, Object>> extractProxies(Map<String, Object> map) {
//    boolean success = Boolean.parseBoolean(map.get("success").toString());
//    assertTrue("Status should be true", success);
//    return (List<Map<String, Object>>) map.get("proxies");
//  }
//
}
