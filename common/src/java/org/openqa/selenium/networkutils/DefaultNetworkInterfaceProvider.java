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

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import java.net.*;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class DefaultNetworkInterfaceProvider implements NetworkInterfaceProvider {
  public Iterable<NetworkInterface> getNetworkInterfaces() {
    Enumeration<java.net.NetworkInterface> interfaces = null;
    try {
      interfaces = java.net.NetworkInterface.getNetworkInterfaces();
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }
    List<NetworkInterface> result = new ArrayList<NetworkInterface>();
    while (interfaces.hasMoreElements()) {
      result.add(createInterface(interfaces.nextElement()));
    }
    return result;
  }

  private String getLocalInterfaceName() {
    if (Platform.getCurrent().is(Platform.MAC)) {
      return "lo0";
    }

    return "lo";
  }

  public NetworkInterface getLoInterface() {
    final String localIF = getLocalInterfaceName();
    try {
      final java.net.NetworkInterface byName = java.net.NetworkInterface.getByName(localIF);
      return (byName != null) ? createInterface(byName) : null;
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }
  }

  private NetworkInterface createInterface(java.net.NetworkInterface s) {
    return new NetworkInterface(s);
  }
}
