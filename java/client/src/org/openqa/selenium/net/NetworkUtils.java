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

import static org.openqa.selenium.net.NetworkInterface.isIpv6;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ConnectException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

public class NetworkUtils {

  private static InetAddress cachedIp4NonLoopbackAddressOfThisMachine;
  private static String cachedIp4NonLoopbackAddressHostName;

  private final NetworkInterfaceProvider networkInterfaceProvider;
  private volatile String hostname;
  private volatile String address;

  NetworkUtils(NetworkInterfaceProvider networkInterfaceProvider) {
    this.networkInterfaceProvider = networkInterfaceProvider;
  }

  public NetworkUtils() {
    this(new DefaultNetworkInterfaceProvider());
  }

  /**
   * Makes a best-effort attempt to figure out an externally addressable name for this host, falling
   * back to a local connection only. This may be a hostname, an IPv4 address, an IPv6 address, or
   * (as a last resort) localhost.
   */
  public String getHostname() {
    determineHostnameAndAddress();

    return hostname;
  }

  public String getHostAddress() {
    determineHostnameAndAddress();

    return address;
  }

  public String getPrivateLocalAddress() {
    List<InetAddress> addresses = getLocalInterfaceAddress();
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
    InetAddress ip4NonLoopbackAddressOfThisMachine = getIp4NonLoopbackAddressOfThisMachine();
    if (! Objects.equals(cachedIp4NonLoopbackAddressOfThisMachine, ip4NonLoopbackAddressOfThisMachine)) {
      cachedIp4NonLoopbackAddressOfThisMachine = ip4NonLoopbackAddressOfThisMachine;
      cachedIp4NonLoopbackAddressHostName = ip4NonLoopbackAddressOfThisMachine.getHostAddress();
    }
    return cachedIp4NonLoopbackAddressHostName;
  }

  /**
   * Returns a non-loopback IP4 hostname of the local host.
   *
   * @return A string hostName
   */
  public InetAddress getIp4NonLoopbackAddressOfThisMachine() {
    for (NetworkInterface iface : networkInterfaceProvider.getNetworkInterfaces()) {
      final InetAddress ip4NonLoopback = iface.getIp4NonLoopBackOnly();
      if (ip4NonLoopback != null) {
        return ip4NonLoopback;
      }
    }
    throw new WebDriverException("Could not find a non-loopback ip4 address for this machine");
  }

  /**
   * Returns a single address that is guaranteed to resolve to an ipv4 representation of localhost
   * This may either be a hostname or an ip address, depending if we can guarantee what that the
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
        final InetAddress netAddress = linuxLoopback.getIp4LoopbackOnly();
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


  private InetAddress grabFirstNetworkAddress() {
    NetworkInterface firstInterface =
        networkInterfaceProvider.getNetworkInterfaces().iterator().next();
    InetAddress firstAddress = null;
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
      final InetAddress netAddress = iface.getIp4LoopbackOnly();
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

  private List<InetAddress> getLocalInterfaceAddress() {
    List<InetAddress> localAddresses = new ArrayList<>();

    for (NetworkInterface iface : networkInterfaceProvider.getNetworkInterfaces()) {
      for (InetAddress addr : iface.getInetAddresses()) {
        // filter out Inet6 Addr Entries
        if (addr.isLoopbackAddress() && !isIpv6(addr))  {
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
        for (InetAddress inetAddress : linuxLoopback.getInetAddresses()) {
          if (!isIpv6(inetAddress)) {
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

  private static void dumpAddresses(StringBuilder result, Iterable<InetAddress> inetAddresses) {
    for (InetAddress address : inetAddresses) {
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

  private synchronized void determineHostnameAndAddress() {
    if (hostname != null) {
      return;
    }

    // Ideally, we'd use InetAddress.getLocalHost, but this does a reverse DNS lookup. On Windows
    // and Linux this is apparently pretty fast, so we don't get random hangs. On OS X it's
    // amazingly slow. That's less than ideal. Figure things out and cache.

    String host = System.getenv("HOSTNAME");  // Most OSs
    if (host == null) {
      host = System.getenv("COMPUTERNAME");  // Windows
    }
    if (host == null && Platform.getCurrent().is(Platform.MAC)) {
      try {
        Process process = Runtime.getRuntime().exec("hostname");

        if (!process.waitFor(2, TimeUnit.SECONDS)) {
          process.destroyForcibly();
          // According to the docs for `destroyForcibly` this is a good idea.
          process.waitFor(2, TimeUnit.SECONDS);
        }
        if (process.exitValue() == 0) {
          try (InputStreamReader isr = new InputStreamReader(process.getInputStream());
               BufferedReader reader = new BufferedReader(isr)) {
            host = reader.readLine();
          }
        }
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      } catch (Exception e) {
        // fall through
      }
    }
    if (host == null) {
      // Give up.
      try {
        host = InetAddress.getLocalHost().getHostName();
      } catch (Exception e) {
        host = "localhost";  // At least we tried.
      }
    }

    this.hostname = host;

    String address = null;
    // Now for the IP address. We're going to do silly shenanigans on OS X only.
    if (Platform.getCurrent().is(Platform.MAC)) {
      try {
        for (NetworkInterface iface : networkInterfaceProvider.getNetworkInterfaces()) {
          if (iface.getName().startsWith("en")) {
            for (InetAddress inetAddress : iface.getInetAddresses()) {
              try {
                if (inetAddress.isReachable(100)) {
                  address = inetAddress.getHostAddress();
                  break;
                }
              } catch (ConnectException e) {
                // Well, this is fine.
              }
            }
          }
          if (address != null) {
            break;
          }
        }
      } catch (Exception e) {
        // Fall through and go the slow way.
      }
    }
    if (address == null) {
      // Alright. I give up.
      try {
        address = InetAddress.getLocalHost().getHostAddress();
      } catch (Exception e) {
        address = "127.0.0.1";
      }
    }

    this.address = address;
  }
}
