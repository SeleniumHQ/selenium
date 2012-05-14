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
