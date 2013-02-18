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

import java.net.InetAddress;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class NetworkInterface {

  private final String name;
  private final Iterable<INetAddress> inetAddresses;
  private boolean isLoopback;

  public NetworkInterface(java.net.NetworkInterface networkInterface) {
    this(networkInterface.getName(), asIterableAddr(networkInterface.getInetAddresses()));
    try {
      // Issue 1181 : determine whether this NetworkInterface instance is loopback
      // from java.net.NetworkInterface API
      this.isLoopback = networkInterface.isLoopback();
    } catch (SocketException ex) {
      Logger.getLogger(NetworkInterface.class.getName()).log(Level.WARNING, null, ex);
      // If an SocketException is caught, determine whether this NetworkInterface
      // instance is loopback from computation from its inetAddresses
      this.isLoopback =
          isLoopBackFromINetAddresses(asIterableAddr(networkInterface.getInetAddresses()));
    }
  }

  NetworkInterface(String name, Iterable<INetAddress> inetAddresses) {
    this.name = name;
    this.inetAddresses = inetAddresses;
  }

  NetworkInterface(String name, INetAddress... inetAddresses) {
    this(name, Arrays.asList(inetAddresses));
    this.isLoopback = isLoopBackFromINetAddresses(Arrays.asList(inetAddresses));
  }

  public boolean isIp4AddressBindingOnly() {
    return getIp6Address() == null;
  }

  public boolean isLoopBack() {
    return isLoopback;
  }

  public final boolean isLoopBackFromINetAddresses(Iterable<INetAddress> inetAddresses) {
    // Let's hope there's no such thing as network interfaces with mixed addresses ;)
    Iterator<INetAddress> iterator = inetAddresses.iterator();
    return iterator.hasNext() && iterator.next().isLoopbackAddress();
  }

  public INetAddress getIp4LoopbackOnly() {
    // Goes by the wildly unscientific assumption that if there are more than one set of
    // loopback addresses, firefox will bind to the last one we get.
    // An alternate theory if this fails is that firefox prefers 127.0.0.1
    // Most "normal" boxes don't have multiple addresses so we'll just refine this
    // algorithm until it works.
    // See NetworkUtilsTest#testOpenSuseBoxIssue1181
    INetAddress lastFound = null;
    // Issue 1181
    if (!isLoopback) {
      return lastFound;
    }
    for (INetAddress inetAddress : inetAddresses) {
      if (inetAddress.isLoopbackAddress() && inetAddress.isIPv4Address()) {
        lastFound = inetAddress;
      }
    }
    return lastFound;
  }

  public INetAddress getIp4NonLoopBackOnly() {
    for (INetAddress inetAddress : inetAddresses) {
      if (!inetAddress.isLoopbackAddress() && inetAddress.isIPv4Address()) {
        return inetAddress;
      }
    }
    return null;
  }

  public INetAddress getIp6Address() {
    for (INetAddress inetAddress : inetAddresses) {
      if (inetAddress.isIPv6Address()) {
        return inetAddress;
      }
    }
    return null;
  }

  public Iterable<INetAddress> getInetAddresses() {
    return inetAddresses;
  }

  public String getName() {
    return name;
  }

  static Iterable<INetAddress> asIterableAddr(Enumeration<InetAddress> tEnumeration) {
    List<INetAddress> result = new ArrayList<INetAddress>();
    while (tEnumeration.hasMoreElements()) {
      result.add(new INetAddress(tEnumeration.nextElement()));
    }
    return Collections.unmodifiableList(result);
  }
}
