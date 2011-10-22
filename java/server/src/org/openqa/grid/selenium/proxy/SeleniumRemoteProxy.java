package org.openqa.grid.selenium.proxy;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;

/**
 * WebdriverRemoteProxy and SeleniumRemoteProxy have been merged into DefaultRemoteProxy. Use that
 * instead. The distinction between the RC/Selenium protocol and WebDriver protocol is now done at
 * the TestSlot level, so if you want your custom proxy to do something specific for only one of
 * those protocol, you'll have to check the protocol of each slot :
 * getTestSlots().get(index).getProtocol()
 */
@Deprecated
public class SeleniumRemoteProxy extends DefaultRemoteProxy {

  public SeleniumRemoteProxy(RegistrationRequest request, Registry registry) {
    super(request, registry);
  }

}
