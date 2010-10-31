/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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
package org.openqa.selenium.networkutils;

import junit.framework.TestCase;

public class NetworkUtilsTest extends TestCase {
  public void testGetPrivateLocalAddress() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getUbuntu1010SingleNICAndWlan());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.3", s);
  }

  public void testPrivateLocalAddress() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getWindowsXpWithIp4Only());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localXhost", s);
  }

  public void testRHELBox() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getRHEL5Box());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localhost.localdomain", s);
  }

  public void testSolarisBox() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getSolarisBox());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localhost", s);
  }

  public void testUbuntu9X() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getUbuntu09XSingleNIC());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.1", s);
  }

  public void testOsXSnowLeopard() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getOsXWiredAndWireless());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.1", s);
  }
  public void testFreeBsd() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getFreeBsd());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localhost.apache.org", s);
  }

  public void testVistaBox() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getVistaBox());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.1", s);
}
}
