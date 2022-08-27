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
package org.openqa.selenium.net;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

@Tag("UnitTests")
public class NetworkUtilsTest {

  @Test
  public void testGetPrivateLocalAddress() {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getUbuntu1010SingleNICAndWlan());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("127.0.0.3");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("169.254.8.180");
  }

  @Test
  public void testPrivateLocalAddress() {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getWindowsXpWithIp4Only());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("localXhost");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("169.254.8.182");
  }

  @Test
  public void testRHELBox() {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getRHEL5Box());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("localhost.localdomain");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("157.120.190.200");
  }

  @Test
  public void testSolarisBox() {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getSolarisBox());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("localhost");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("10.100.8.99");
  }

  @Test
  public void testUbuntu9X() {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getUbuntu09XSingleNIC());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("127.0.0.1");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("157.120.171.97");
  }

  @Test
  public void testOsXSnowLeopard() {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getOsXWiredAndWireless());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("127.0.0.1");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("192.168.4.1");
  }

  @Test
  public void testFreeBsd() {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getFreeBsd());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("localhost.apache.org");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("192.168.0.4");
  }

  @Test
  public void testVistaBox() {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getVistaBox());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("127.0.0.1");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("10.0.0.108");
  }

  @Test
  public void testWindows7Box() {
    NetworkUtils networkUtils = new NetworkUtils(StubNetworkInterfaceProvider.getWindows7Box());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("127.0.0.1");
    assertThat(networkUtils.getNonLoopbackAddressOfThisMachine()).isEqualTo("192.168.1.102");
  }

  @Test
  public void testOpenSuseBoxIssue1181() {
    NetworkUtils networkUtils =
        new NetworkUtils(StubNetworkInterfaceProvider.getOpenSuseBoxFromIssue1181());
    assertThat(networkUtils.obtainLoopbackIp4Address()).isEqualTo("localhost.localdomain");
  }
}
