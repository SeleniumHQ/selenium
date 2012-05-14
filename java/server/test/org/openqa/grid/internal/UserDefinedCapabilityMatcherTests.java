/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.grid.internal;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.Hub;

public class UserDefinedCapabilityMatcherTests {

  @Test
  public void defaultsToDefaultMatcher() {
    Registry registry = Registry.newInstance();
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-"+RegistrationRequest.ID, "abc","-host","localhost");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    Assert.assertEquals(DefaultCapabilityMatcher.class,p.getCapabilityHelper().getClass());

  }
  
  // issue #2118
  @Test
  public void capabilityMatcherCanBeSpecified() {
    GridHubConfiguration hubConfig = new GridHubConfiguration();
    String myMatcherClass = MyCapabilityMatcher.class.getCanonicalName();
    hubConfig.setCapabilityMatcher(myMatcherClass);
    Registry registry = Registry.newInstance((Hub)null,hubConfig);
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-"+RegistrationRequest.ID, "abc","-host","localhost");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    Assert.assertEquals(MyCapabilityMatcher.class,p.getCapabilityHelper().getClass());
  }

}
