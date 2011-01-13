package org.openqa.selenium.iphone;

import java.net.URL;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class IPhoneSimulatorDriver extends IPhoneDriver {

  public IPhoneSimulatorDriver(URL iWebDriverUrl, IPhoneSimulatorBinary iphoneSimulator)
      throws Exception {
    super(new IPhoneSimulatorCommandExecutor(iWebDriverUrl, iphoneSimulator));
  }

  public IPhoneSimulatorDriver(String iWebDriverUrl, IPhoneSimulatorBinary iphoneSimulator)
      throws Exception {
    this(new URL(iWebDriverUrl), iphoneSimulator);
  }

  public IPhoneSimulatorDriver(IPhoneSimulatorBinary iphoneSimulator) throws Exception {
    this(DEFAULT_IWEBDRIVER_URL, iphoneSimulator);
  }

  @Override
  protected void startClient() {
    ((IPhoneSimulatorCommandExecutor) getCommandExecutor()).startClient();
  }

  @Override
  protected void stopClient() {
    ((IPhoneSimulatorCommandExecutor) getCommandExecutor()).stopClient();
  }
}
