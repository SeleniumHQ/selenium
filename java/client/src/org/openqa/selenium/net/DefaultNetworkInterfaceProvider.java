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

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.HostIdentifier;

import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

public class DefaultNetworkInterfaceProvider implements NetworkInterfaceProvider {
  // Cache the list of interfaces between instances. This is mostly used
  // to get the loopback interface, so it's ok even though interfaces may go
  // up and down during the test.
  // Caching the result of getNetworkInterfaces saves 2 seconds, which is
  // significant when running the tests.
  private final List<NetworkInterface> cachedInterfaces;


  @Override
  public Iterable<NetworkInterface> getNetworkInterfaces() {
    return cachedInterfaces;
  }

  public DefaultNetworkInterfaceProvider() {
    Enumeration<java.net.NetworkInterface> interfaces = null;
    try {
      interfaces = java.net.NetworkInterface.getNetworkInterfaces();
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }

    // If we can find the default network interface, use that. We want to avoid using
    // InetAddress.getLocalHost() since that does a reverse DNS lookup, which may be slow.
    InetAddress defaultAddress = null;
    if (!"Unknown".equals(HostIdentifier.getHostAddress())) {
      try {
        defaultAddress = InetAddress.getByName(HostIdentifier.getHostAddress());
      } catch (UnknownHostException e) {
        // OK. Fall through.
      }
    }

    List<NetworkInterface> result = new ArrayList<>();
    boolean defaultFound = false;
    while (interfaces.hasMoreElements()) {
      java.net.NetworkInterface jvmNic = interfaces.nextElement();

      NetworkInterface nic = new NetworkInterface(jvmNic);
      result.add(nic);

      if (defaultAddress == null || defaultFound) {
        continue;
      }

      Enumeration<InetAddress> inetAddresses = jvmNic.getInetAddresses();
      while (inetAddresses.hasMoreElements() && !defaultFound) {
        InetAddress address = inetAddresses.nextElement();
        if (defaultAddress.equals(address)) {
          result.add(0, nic);
          defaultFound = true;
        }
      }
    }
    this.cachedInterfaces = Collections.unmodifiableList(result);
  }

  private String getLocalInterfaceName() {
    if (Platform.getCurrent().is(Platform.MAC)) {
      return "lo0";
    }

    return "lo";
  }

  @Override
  public NetworkInterface getLoInterface() {
    final String localIF = getLocalInterfaceName();
    try {
      final java.net.NetworkInterface byName = java.net.NetworkInterface.getByName(localIF);
      return (byName != null) ? new NetworkInterface(byName) : null;
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }
  }

}
