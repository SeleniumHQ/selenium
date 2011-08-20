package org.openqa.grid.plugin;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.PROXY_CLASS;

import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;


public class RemoteProxyInheritanceTest {

  private Registry registry = Registry.newInstance();

  @Test
  public void defaultToRemoteProxy() {


    RegistrationRequest req = RegistrationRequest.webdriverNoCapabilities();

    Map<String, Object> app1 = new HashMap<String, Object>();
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");


    req.addDesiredCapabilitiy(app1);
    req.setConfiguration(config);

    // requires Custom1 & Custom1 set in config to work.
    RemoteProxy p = RemoteProxy.getNewInstance(req, registry);
    Assert.assertEquals(RemoteProxy.class, p.getClass());
  }


  @Test
  public void existing() {
    RegistrationRequest req = new RegistrationRequest();
    Map<String, Object> app1 = new HashMap<String, Object>();
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    config.put(PROXY_CLASS, "org.openqa.grid.plugin.MyRemoteProxy");

    config.put("Custom1", "A");
    config.put("Custom2", "B");

    req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.setConfiguration(config);

    RemoteProxy p = RemoteProxy.getNewInstance(req, registry);

    Assert.assertEquals(p.getClass(), MyRemoteProxy.class);
    MyRemoteProxy myRemoteProxy = (MyRemoteProxy) p;
    Assert.assertEquals("A", myRemoteProxy.getCustom1());
    Assert.assertEquals("B", myRemoteProxy.getCustom2());
    Assert.assertEquals("A", myRemoteProxy.getConfig().get("Custom1"));
    Assert.assertEquals("B", myRemoteProxy.getConfig().get("Custom2"));

  }

  @Test(expected = InvalidParameterException.class)
  public void notExisting() {
    RegistrationRequest req = new RegistrationRequest();
    Map<String, Object> app1 = new HashMap<String, Object>();
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    config.put(PROXY_CLASS, "I Don't exist");

    req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.setConfiguration(config);

    RemoteProxy.getNewInstance(req, registry);
  }

  @Test(expected = InvalidParameterException.class)
  public void notExtendingProxyExisting() {
    RegistrationRequest req = new RegistrationRequest();
    Map<String, Object> app1 = new HashMap<String, Object>();
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    config.put(PROXY_CLASS, "java.lang.String");


    req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.setConfiguration(config);

    RemoteProxy.getNewInstance(req, registry);
  }

  // when some mandatory param are missing -> InvalidParameterException
  @Test(expected = InvalidParameterException.class)
  public void badConfig() {
    RegistrationRequest req = new RegistrationRequest();
    Map<String, Object> app1 = new HashMap<String, Object>();
    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    config.put(PROXY_CLASS, "I Don't exist");

    req = new RegistrationRequest();
    req.addDesiredCapabilitiy(app1);
    req.setConfiguration(config);

    // requires Custom1 & Custom1 set in config to work.
    RemoteProxy.getNewInstance(req, registry);
  }


}
