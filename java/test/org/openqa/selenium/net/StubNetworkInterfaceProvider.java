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

import java.io.UncheckedIOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;

/**
 * Contains stub data based on data from real systems.
 *
 * Please note that a lot of the ips/addresses have been changed somewhat to make the test results
 * more unique and to protect the innocent. Most notably, most of the loopback ip4 addresses have
 * been set to something other than localhost/127.0.0.1, although the real systems use
 * localhost/127.0.0.1
 */
public class StubNetworkInterfaceProvider {
  private StubNetworkInterfaceProvider() {
  }

  private static NetworkInterface newInterface(String interfaceName) {
    return new NetworkInterface(interfaceName);
  }

  private static NetworkInterface newInterface(String ifName, InetAddress... interfaces) {
    return new NetworkInterface(ifName, interfaces);
  }

  private static InetAddress inetAddress(String host, String addressString) {
    try {
      // getByName will not do a name lookup if given a literal IPv4/6 address, so we can use
      // it to cheat and convert our string to the network byte representation.
      InetAddress tmp = InetAddress.getByName(addressString);
      return InetAddress.getByAddress(host, tmp.getAddress());
    } catch (UnknownHostException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static InetAddress inetAddress(String addressString) {
    try {
      // getByName will not do a name lookup if given a literal IPv4/6 address, so we can use
      // it to cheat and convert our string to the network byte representation.
      InetAddress tmp = InetAddress.getByName(addressString);
      return InetAddress.getByAddress(addressString, tmp.getAddress());
    } catch (UnknownHostException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static NetworkInterfaceProvider getUbuntu1010SingleNICAndWlan() {
    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("wlan0", inetAddress("chunky.local", "169.254.8.180")),
            newInterface("eth0",
                inetAddress("fe80:0:0:0:21e:33ff:fe24:6295%2"),
                inetAddress("192.168.1.13")),
            newInterface("lo",
                inetAddress("localhost", "0:0:0:0:0:0:0:1%1"),
                inetAddress("localhost", "127.0.0.3")));
      }

      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo",
            inetAddress("localhost", "0:0:0:0:0:0:0:1%1"),
            inetAddress("localhost", "127.0.0.3")); // Just for fun set to .3
      }
    };
  }



  public static NetworkInterfaceProvider getWindowsXpWithIp4Only() {
    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("lo", inetAddress("localXhost", "127.0.0.4")),
            newInterface("eth0", inetAddress("myip4.mydomain.com", "169.254.8.182")));
      }

      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo", inetAddress("localXhost", "127.0.0.4")); // Just for fun set to .4
      }
    };
  }

  public static NetworkInterfaceProvider getRHEL5Box() {
    // Linux woz-woz23 2.6.18-92.el5 #1 SMP Tue Apr 29 13:16:15 EDT 2008 x86_64 x86_64 x86_64
    // GNU/Linux

    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("eth2", inetAddress("woz-woz23", "157.120.190.200")),
            newInterface("eth0", inetAddress("woz-woz23-eth0", "10.10.8.101")),
            newInterface("lo", inetAddress("localhost.localdomain", "127.0.0.2")));
      }

      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo",
            inetAddress("localhost.localdomain", "127.0.0.2")); // Just for fun set to .2
      }
    };
  }

  public static NetworkInterfaceProvider getSolarisBox() {
    // SunOS woz-woz01 5.10 Generic_142909-17 sun4u sparc SUNW,Sun-Fire-V245

    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("bge1", inetAddress("woz-woz01-adm", "10.100.8.99")),
            newInterface("bge1", inetAddress("157.120.190.198")),
            newInterface("lo", inetAddress("localhost", "127.0.0.1")));
      }

      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo",
            inetAddress("localhost", "127.0.0.1")); // Just for fun set to .2
      }
    };
  }

  public static NetworkInterfaceProvider getUbuntu09XSingleNIC() {
    // Linux playwoz 2.6.28-18-server #59-Ubuntu SMP Thu Jan 28 02:23:52 UTC 2010 i686 GNU/Linux

    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("eth0",
                inetAddress("fe80:0:0:1:215:41ff:fe3a:1882%2", "e80:0:0:1:215:41ff:fe3a:1882%2"),
                inetAddress("157.120.171.97")),
            newInterface("lo",
                inetAddress("p6-localhost", "0:0:0:0:0:0:0:1%1"),
                inetAddress("playwoz", "127.0.0.1")));
      }

      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo",
            inetAddress("p6-localhost", "0:0:0:0:0:0:0:1%1"),
            inetAddress("playwoz", "127.0.0.1"));
      }
    };
  }

  public static NetworkInterfaceProvider getOsXWiredAndWireless() {
    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("vmnet8", inetAddress("192.168.4.1")),
            newInterface("vmnet1", inetAddress("192.168.166.1")),
            newInterface("en1",
                inetAddress("somehost.subd.test.com", "172.12.8.7"),
                inetAddress("2620:0:1042:13:3bb0:35fe:fe7c:629c"),
                inetAddress("fe80:0:0:0:3bb0:35fe:fe7c:629c%6")),
            newInterface("en0",
                inetAddress("someotherhost.subd.test.com", "172.12.8.9"),
                inetAddress("fe80:0:0:0:6e6d:63ff:fe8c:bd10%4")),
            newInterface("lo0",
                inetAddress("localhost", "127.0.0.1"),
                inetAddress("somemachine.local", "fe80:0:0:0:0:0:0:1%1"),
                inetAddress("localhost", "0:0:0:0:0:0:0:1")));
      }

      @Override
      public NetworkInterface getLoInterface() {
        return null;
      }
    };
  }

  public static NetworkInterfaceProvider getFreeBsd() {
    // FreeBSD minotaur.apache.org 8.0-STABLE FreeBSD 8.0-STABLE #0 r204183:204434: Sat Feb 27
    // 22:11:44 UTC 2010
    // root@loki.apache.org:/usr/obj/usr/src/sys/MINOTAUR amd64

    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("lo0", inetAddress("localhost.apache.org", "127.0.0.1")),
            newInterface("bge1", inetAddress("192.168.0.4", "192.168.0.4")),
            newInterface("nfe1",
                inetAddress("minotaur-2.apache.org", "140.211.11.10"),
                inetAddress("minotaur.apache.org", "140.211.11.9")));
      }

      // This method should only return an interface if it's named exactly "lo"
      @Override
      public NetworkInterface getLoInterface() {
        return null;
      }
    };

  }

  public static NetworkInterfaceProvider getVistaBox() {
    // The world is a wild and wonderful place
    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            getLoInterface(),
            newInterface("net0"),
            newInterface("net1"),
            newInterface("ppp0"),
            newInterface("eth0"),
            newInterface("eth1"),
            newInterface("ppp1"),
            newInterface("net2"),
            newInterface("eth2"),
            newInterface("net3", inetAddress("fe80:0:0:0:0:100:7", "fe80:0:0:0:0:10::")),
            newInterface("eth3",
                inetAddress("woz134.wozms", "fe80:0:0:0:4d74::"),
                inetAddress("woz134", "10.0.0.108")),
            newInterface("net3", inetAddress("fe80:0:0:0:0:100:7", "fe80:0:0:0:0:10::")),
            newInterface("net5", inetAddress("fe80:0:0:0:0:5efe", "fe80:0:0:0:0:5e::")),
            newInterface("eth4"),
            newInterface("net6"),
            newInterface("net7"),
            newInterface("eth5"),
            newInterface("eth6"),
            newInterface("eth7"),
            newInterface("eth8"),
            newInterface("eth9")
            );
      }

      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo", inetAddress("0:0:0:0:0:0:0:1"),
            inetAddress("hn127.0.0.1", "127.0.0.1")); // Hostname was originally without "hn" prefix
      }

    };
  }


  public static NetworkInterfaceProvider getWindows7Box() {
    // dawagner's windows 7 box
    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            getLoInterface(),
            newInterface("net0"),
            newInterface("net1"),
            newInterface("net2"),
            newInterface("net3"),
            newInterface("ppp0"),
            newInterface("eth0"),
            newInterface("eth1"),
            newInterface("eth2"),
            newInterface("ppp1"),
            newInterface("net3",
                inetAddress("fe80:0:0:0:acc5:fca8:4900:3d5e%11"),
                inetAddress("192.168.1.102")),
            newInterface("net4", inetAddress("fe80:0:0:0:0:5efe:c0a8:166%12")),
            newInterface("net5",
                inetAddress("bruckner", "2001:0:5ef5:79fd:145f:2f8:adef:9d07"),
                inetAddress("bruckner", "fe80:0:0:0:145f:2f8:adef:9d07%13")),
            newInterface("eth4", inetAddress("fe80:0:0:0:e565:922d:d0ed:88ed%14")),
            newInterface("net6"),
            newInterface("eth5"),
            newInterface("eth6"),
            newInterface("eth7"),
            newInterface("eth8"),
            newInterface("eth9"),
            newInterface("eth10"),
            newInterface("eth11"),
            newInterface("net7")
            );
      }

      // This method should only return an interface if it's named exactly "lo"
      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo", inetAddress("0:0:0:0:0:0:0:1", "0:0:0:0:0:0:0:1"),
            inetAddress("hnx127.0.0.1", "127.0.0.1")); // Hostname was originally without
                                                                 // "hnx" prefix
      }

    };
  }

  public static NetworkInterfaceProvider getOpenSuseBoxFromIssue1181() {
    // dawagner's windows 7 box
    return new NetworkInterfaceProvider() {
      @Override
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("wlan0", inetAddress("192.168.37.21", "192.168.37.21")),
            getLoInterface()
            );
      }

      // This method should only return an interface if it's named exactly "lo"
      @Override
      public NetworkInterface getLoInterface() {
        return newInterface("lo",
            inetAddress("127.0.0.2", "127.0.0.2"),
            inetAddress("localhost.localdomain", "127.0.0.1"));
      }

    };
  }


}
