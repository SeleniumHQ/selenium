/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.grid.selenium.proxy;


public class SeleniumRemoteProxyTest {
 /* private SeleniumRemoteProxy proxy;
  private Registry registry;

  @Before
  public void setup() {
    Map<String, Object> config = new HashMap<String, Object>();
    config.put(REMOTE_HOST, "http://machine1:4444");
    config.put(MAX_SESSION, 5);

    Map<String, Object> app1 = new HashMap<String, Object>();
    app1.put(CapabilityType.BROWSER_NAME, "app1");

    RegistrationRequest req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.setConfiguration(config);

    registry = Registry.newInstance();
    proxy = new SeleniumRemoteProxy(req, registry);
  }

  @Test
  public void beforeReleaseWithExternalSession() {
    TestSession session = proxy.getTestSlots().get(0).getNewSession(new HashMap<String, Object>());
    session.setExternalKey("abc123");

    proxy.beforeRelease(session);
    registry.stop();
  }

  @Test
  public void beforeReleaseWithoutExternalSession() {
    TestSession session = proxy.getTestSlots().get(0).getNewSession(new HashMap<String, Object>());
    session.setExternalKey(null);

    proxy.beforeRelease(session);
    registry.stop();
  }*/
}
