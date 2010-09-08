package org.openqa.selenium;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class NetworkUtils {
  public static String getPrivateLocalAddress() {
    List<InetAddress> addresses = getLocalInterfaceAddress();
    if (addresses.isEmpty()) {
      return "127.0.0.1";
    }

    return addresses.get(0).getHostAddress();
  }

  public static Set<InetSocketAddress> obtainLoopbackAddresses(int port) {
    List<InetAddress> addresses = getLocalInterfaceAddress();
    Set<InetSocketAddress> returnAddresses = new HashSet<InetSocketAddress>();

    for (InetAddress address : addresses) {
      returnAddresses.add(new InetSocketAddress(address, port));
    }

    if (returnAddresses.isEmpty()) {
      throw new WebDriverException("Unable to find loopback address for localhost");      
    }
    return returnAddresses;
  }

  private static boolean isIPv6Address(InetAddress addr) {
    return addr.getHostAddress().indexOf(":") != -1;
  }

  private static InetAddress grabFirstNetworkAddress() {
    NetworkInterface firstInterface;
    try {
      firstInterface = NetworkInterface.getNetworkInterfaces().nextElement();
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }
    InetAddress firstAddress = null;
    if (firstInterface != null) {
      firstAddress = firstInterface.getInetAddresses().nextElement();
    }

    if (firstAddress == null) {
      new WebDriverException("Unable to find loopback address for localhost");      
    }

    return firstAddress;
  }

  private static List<InetAddress> getLocalInterfaceAddress() {
    List<InetAddress> localAddresses = new ArrayList<InetAddress>();

    Enumeration<NetworkInterface> allInterfaces = null;
    try {
      allInterfaces = NetworkInterface.getNetworkInterfaces();
      while (allInterfaces.hasMoreElements()) {
        NetworkInterface iface = allInterfaces.nextElement();
        Enumeration<InetAddress> allAddresses = iface.getInetAddresses();
        while (allAddresses.hasMoreElements()) {
          InetAddress addr = allAddresses.nextElement();
          // filter out Inet6 Addr Entries
          if (addr.isLoopbackAddress() && !isIPv6Address(addr)) {
            localAddresses.add(addr);
          }
        }
      }

      // On linux, loopback addresses are named "lo". See if we can find that. We do this
      // craziness because sometimes the loopback device is given an IP range that falls outside
      // of 127/24
      if (Platform.getCurrent().is(Platform.UNIX)) {
        NetworkInterface linuxLoopback = NetworkInterface.getByName("lo");
        if (linuxLoopback != null) {
          Enumeration<InetAddress> possibleLoopbacks = linuxLoopback.getInetAddresses();
          while (possibleLoopbacks.hasMoreElements()) {
            InetAddress inetAddress = possibleLoopbacks.nextElement();
            if (!isIPv6Address(inetAddress)) {
              localAddresses.add(inetAddress);
            }
          }
        }
      }
    } catch (SocketException e) {
      throw new WebDriverException(e);
    }


    if (localAddresses.isEmpty()) {
      return Collections.singletonList(grabFirstNetworkAddress());
    }

    return localAddresses; 
  }
}
