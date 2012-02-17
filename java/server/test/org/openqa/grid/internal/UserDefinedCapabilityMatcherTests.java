package org.openqa.grid.internal;

import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.Hub;

public class UserDefinedCapabilityMatcherTests {

  @Test
  public void defaultsToDefaultMatcher() {
    Registry registry = Registry.newInstance();
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-"+RegistrationRequest.ID, "abc");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);
    RemoteProxy p = RemoteProxy.getNewInstance(req, registry);

    Assert.assertEquals(DefaultCapabilityMatcher.class,p.getCapabilityHelper().getClass());

  }
  
  // issue #2118
  @Test
  public void capabilityMatcherCanBeSpecified() {
    GridHubConfiguration hubConfig = new GridHubConfiguration();
    String myMatcherClass = MyCapabilityMatcher.class.getCanonicalName();
    hubConfig.setCapabilityMatcher(myMatcherClass);
    Registry registry = Registry.newInstance((Hub)null,hubConfig);
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-"+RegistrationRequest.ID, "abc");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);
    RemoteProxy p = RemoteProxy.getNewInstance(req, registry);

    Assert.assertEquals(MyCapabilityMatcher.class,p.getCapabilityHelper().getClass());
  }

}
