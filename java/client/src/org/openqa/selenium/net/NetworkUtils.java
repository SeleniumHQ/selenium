/*
Copyright 2007-2010 Selenium committers

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

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class NetworkUtils {

  private final NetworkInterfaceProvider networkInterfaceProvider;

  NetworkUtils(NetworkInterfaceProvider networkInterfaceProvider) {
    this.networkInterfaceProvider = networkInterfaceProvider;
  }

  public NetworkUtils() {
    this(new DefaultNetworkInterfaceProvider());
  }

  public String getPrivateLocalAddress() {
    List<INetAddress> addresses = getLocalInterfaceAddress();
    if (addresses.isEmpty()) {
      return "127.0.0.1";
    }

    return addresses.get(0).getHostAddress();
  }

  /**
   * Used by the mobile emulators that refuse to access localhost or 127.0.0.1 The IP4/IP6
   * requirements of this method are as-of-yet unspecified, but we return the string that is
   * associated with the IP4 interface
   * 
   * @return A String representing the host name or non-loopback IP4 address of this machine.
   */
  public String getNonLoopbackAddressOfThisMachine() {
    return getIp4NonLoopbackAddressOfThisMachine().getHostName();
  }

  /**
   * Returns a non-loopback IP4 hostname of the local host.
   * 
   * @return A string hostName
   */
  public INetAddress getIp4NonLoopbackAddressOfThisMachine() {
    for (NetworkInterface iface : networkInterfaceProvider.getNetworkInterfaces()) {
      final INetAddress ip4NonLoopback = iface.getIp4NonLoopBackOnly();
      if (ip4NonLoopback != null) {
        return ip4NonLoopback;
      }
    }
    throw new WebDriverException("Could not find a non-loopback ip4 address for this machine");
  }

  /**
   * Returns a single address that is guaranteed to resolve to an ipv4 representation of localhost
   * This may either be a hostname or an ip address, dependending if we can guarantee what that the
   * hostname will resolve to ip4.
   * 
   * @return The address part og such an address
   */
  public String obtainLoopbackIp4Address() {
    final NetworkInterface networkInterface = getLoopBackAndIp4Only();
    if (networkInterface != null) {
      return networkInterface.getIp4LoopbackOnly().getHostName();
    }

    final String ipOfIp4LoopBack = getIpOfLoopBackIp4();
    if (ipOfIp4LoopBack != null) {
      return ipOfIp4LoopBack;
    }

    if (Platform.getCurrent().is(Platform.UNIX)) {
      NetworkInterface linuxLoopback = networkInterfaceProvider.getLoInterface();
      if (linuxLoopback != null) {
        final INetAddress netAddress = linuxLoopback.getIp4LoopbackOnly();
        if (netAddress != null) {
          return netAddress.getHostAddress();
        }
      }
    }

    throw new WebDriverException(
        "Unable to resolve local loopback address, please file an issue with the full message of this error:\n"
            +
            getNetWorkDiags() + "\n==== End of error message");
  }


  private INetAddress grabFirstNetworkAddress() {
    NetworkInterface firstInterface =
        networkInterfaceProvider.getNetworkInterfaces().iterator().next();
    INetAddress firstAddress = null;
    if (firstInterface != null) {
      firstAddress = firstInterface.getInetAddresses().iterator().next();
    }

    if (firstAddress == null) {
      throw new WebDriverException("Unable to find any network address for localhost");
    }

    return firstAddress;
  }

  public String getIpOfLoopBackIp4() {
    for (NetworkInterface iface : networkInterfaceProvider.getNetworkInterfaces()) {
      final INetAddress netAddress = iface.getIp4LoopbackOnly();
      if (netAddress != null) {
        return netAddress.getHostAddress();
      }
    }
    return null;
  }

  private NetworkInterface getLoopBackAndIp4Only() {
    for (NetworkInterface iface : networkInterfaceProvider.getNetworkInterfaces()) {
      if (iface.isIp4AddressBindingOnly() && iface.isLoopBack()) {
        return iface;
      }
    }
    return null;
  }

  private List<INetAddress> getLocalInterfaceAddress() {
    List<INetAddress> localAddresses = new ArrayList<INetAddress>();

    for (NetworkInterface iface : networkInterfaceProvider.getNetworkInterfaces()) {
      for (INetAddress addr : iface.getInetAddresses()) {
        // filter out Inet6 Addr Entries
        if (addr.isLoopbackAddress() && !addr.isIPv6Address()) {
          localAddresses.add(addr);
        }
      }
    }

    // On linux, loopback addresses are named "lo". See if we can find that. We do this
    // craziness because sometimes the loopback device is given an IP range that falls outside
    // of 127/24
    if (Platform.getCurrent().is(Platform.UNIX)) {
      NetworkInterface linuxLoopback = networkInterfaceProvider.getLoInterface();
      if (linuxLoopback != null) {
        for (INetAddress inetAddress : linuxLoopback.getInetAddresses()) {
          if (!inetAddress.isIPv6Address()) {
            localAddresses.add(inetAddress);
          }
        }
      }
    }

    if (localAddresses.isEmpty()) {
      return Collections.singletonList(grabFirstNetworkAddress());
    }

    return localAddresses;
  }

  public static String getNetWorkDiags() {
    StringBuilder result = new StringBuilder();
    DefaultNetworkInterfaceProvider defaultNetworkInterfaceProvider =
        new DefaultNetworkInterfaceProvider();
    for (NetworkInterface networkInterface : defaultNetworkInterfaceProvider
        .getNetworkInterfaces()) {
      dumpToConsole(result, networkInterface);

    }
    NetworkInterface byName = defaultNetworkInterfaceProvider.getLoInterface();
    if (byName != null) {
      result.append("Loopback interface LO:\n");
      dumpToConsole(result, byName);
    }
    return result.toString();
  }

  private static void dumpToConsole(StringBuilder result, NetworkInterface inNetworkInterface) {
    if (inNetworkInterface == null) {
      return;
    }
    result.append(inNetworkInterface.getName());
    result.append("\n");
    dumpAddresses(result, inNetworkInterface.getInetAddresses());
  }

  private static void dumpAddresses(StringBuilder result, Iterable<INetAddress> inetAddresses) {
    for (INetAddress address : inetAddresses) {
      result.append("   address.getHostName() = ");
      result.append(address.getHostName());
      result.append("\n");
      result.append("   address.getHostAddress() = ");
      result.append(address.getHostAddress());
      result.append("\n");
      result.append("   address.isLoopbackAddress() = ");
      result.append(address.isLoopbackAddress());
      result.append("\n");
    }
  }

  @SuppressWarnings({"UseOfSystemOutOrSystemErr"})
  public static void main(String[] args) {
    System.out.println(getNetWorkDiags());
  }


}
