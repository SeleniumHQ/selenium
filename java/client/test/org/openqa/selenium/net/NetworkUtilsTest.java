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
package org.openqa.selenium.net;

import junit.framework.TestCase;

public class NetworkUtilsTest extends TestCase {
  public void testGetPrivateLocalAddress() throws Exception {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getUbuntu1010SingleNICAndWlan());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.3", s);
    assertEquals("chunky.local", networkUtils.getNonLoopbackAddressOfThisMachine());
  }

  public void testPrivateLocalAddress() throws Exception {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getWindowsXpWithIp4Only());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localXhost", s);
    assertEquals("myip4.mydomain.com", networkUtils.getNonLoopbackAddressOfThisMachine());
  }

  public void testRHELBox() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getRHEL5Box());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localhost.localdomain", s);
    assertEquals("woz-woz23", networkUtils.getNonLoopbackAddressOfThisMachine());

  }

  public void testSolarisBox() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getSolarisBox());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localhost", s);
    assertEquals("woz-woz01-adm", networkUtils.getNonLoopbackAddressOfThisMachine());
  }

  public void testUbuntu9X() throws Exception {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getUbuntu09XSingleNIC());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.1", s);
    assertEquals("157.120.171.97", networkUtils.getNonLoopbackAddressOfThisMachine());

  }

  public void testOsXSnowLeopard() throws Exception {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getOsXWiredAndWireless());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.1", s);
    assertEquals("192.168.4.1", networkUtils.getNonLoopbackAddressOfThisMachine());
  }

  public void testFreeBsd() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getFreeBsd());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("localhost.apache.org", s);
    assertEquals("192.168.0.4", networkUtils.getNonLoopbackAddressOfThisMachine());
  }

  public void testVistaBox() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getVistaBox());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.1", s);
    assertEquals("woz134", networkUtils.getNonLoopbackAddressOfThisMachine());
  }

  public void testWindows7Box() throws Exception {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getWindows7Box());
    String s = networkUtils.obtainLoopbackIp4Address();
    assertEquals("127.0.0.1", s);
    assertEquals("192.168.1.102", networkUtils.getNonLoopbackAddressOfThisMachine());
  }
}
