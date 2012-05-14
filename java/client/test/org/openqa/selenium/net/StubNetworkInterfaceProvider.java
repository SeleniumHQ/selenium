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

import java.util.Arrays;

/**
 * Contains stub data based on data from real systems.
 * 
 * Please note that a lot of the ips/addresses have been changed somewhat to make the test results
 * more unique and to protect the innocent. Most notably, most of the loopback ip4 addresses have
 * been set to something other than localhost/127.0.0.1, although the real systems use
 * localhost/127.0.0.1
 */
@SuppressWarnings({"UseOfSystemOutOrSystemErr", "UtilityClass"})
public class StubNetworkInterfaceProvider {
  private StubNetworkInterfaceProvider() {
  }

  private static NetworkInterface newInterface(String interfaceName) {
    return new NetworkInterface(interfaceName);
  }

  private static NetworkInterface newInterface(String ifName, INetAddress... interfaces) {
    return new NetworkInterface(ifName, interfaces);
  }

  private static NetworkInterface newInterface(String ifName, String hostName, String hostIp,
      boolean isLoopback) {
    return newInterface(ifName, new INetAddress(hostName, hostIp, isLoopback));
  }

  private static NetworkInterface newInterface(String ifName, String hostName,
      String hostIp, String hostName2, String hostIp2, boolean isLoopback) {
    return newInterface(ifName, new INetAddress(hostName, hostIp, isLoopback), new INetAddress(
        hostName2, hostIp2, isLoopback));
  }

  public static NetworkInterfaceProvider getUbuntu1010SingleNICAndWlan() {
    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("wlan0", "chunky.local", "169.254.8.180", false),
            newInterface("eth0",
                new INetAddress("fe80:0:0:0:21e:33ff:fe24:6295%2",
                    "fe80:0:0:0:21e:33ff:fe24:6295%2", false),
                new INetAddress("192.168.1.13", "192.168.1.13", false)),
            newInterface("lo",
                new INetAddress("localhost", "0:0:0:0:0:0:0:1%1", true),
                new INetAddress("localhost", "127.0.0.3", true)));
      }

      public NetworkInterface getLoInterface() {
        return newInterface("lo",
            new INetAddress("localhost", "0:0:0:0:0:0:0:1%1", true),
            new INetAddress("localhost", "127.0.0.3", true)); // Just for fun set to .3
      }
    };
  }



  public static NetworkInterfaceProvider getWindowsXpWithIp4Only() {
    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            new NetworkInterface("lo",
                new INetAddress("localXhost", "127.0.0.4", true)),
            new NetworkInterface("eth0",
                new INetAddress("myip4.mydomain.com", "169.254.8.182", false))
            );
      }

      public NetworkInterface getLoInterface() {
        return new NetworkInterface("lo",
            new INetAddress("localXhost", "127.0.0.4", true)); // Just for fun set to .4
      }
    };
  }

  public static NetworkInterfaceProvider getRHEL5Box() {
    // Linux woz-woz23 2.6.18-92.el5 #1 SMP Tue Apr 29 13:16:15 EDT 2008 x86_64 x86_64 x86_64
    // GNU/Linux

    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            new NetworkInterface("eth2",
                new INetAddress("woz-woz23", "157.120.190.200", false)
            ),
            new NetworkInterface("eth0",
                new INetAddress("woz-woz23-eth0", "10.10.8.101", false)),
            new NetworkInterface("lo",
                new INetAddress("localhost.localdomain", "127.0.0.2", true)));
      }

      public NetworkInterface getLoInterface() {
        return new NetworkInterface("lo",
            new INetAddress("localhost.localdomain", "127.0.0.2", true)); // Just for fun set to .2
      }
    };
  }

  public static NetworkInterfaceProvider getSolarisBox() {
    // SunOS woz-woz01 5.10 Generic_142909-17 sun4u sparc SUNW,Sun-Fire-V245

    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            new NetworkInterface("bge1",
                new INetAddress("woz-woz01-adm", "10.100.8.99", false)
            ),
            new NetworkInterface("bge1",
                new INetAddress("157.120.190.198", "157.120.190.198", false)),
            new NetworkInterface("lo",
                new INetAddress("localhost", "127.0.0.1", true)));
      }

      public NetworkInterface getLoInterface() {
        return new NetworkInterface("lo",
            new INetAddress("localhost", "127.0.0.1", true)); // Just for fun set to .2
      }
    };
  }

  public static NetworkInterfaceProvider getUbuntu09XSingleNIC() {
    // Linux playwoz 2.6.28-18-server #59-Ubuntu SMP Thu Jan 28 02:23:52 UTC 2010 i686 GNU/Linux

    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("eth0",
                new INetAddress("fe80:0:0:1:215:41ff:fe3a:1882%2",
                    "e80:0:0:1:215:41ff:fe3a:1882%2", false),
                new INetAddress("157.120.171.97", "157.120.171.97", false)),
            newInterface("lo",
                new INetAddress("p6-localhost", "0:0:0:0:0:0:0:1%1", true),
                new INetAddress("playwoz", "127.0.0.1", true)));
      }

      public NetworkInterface getLoInterface() {
        return newInterface("lo", "p6-localhost", "0:0:0:0:0:0:0:1%1", "playwoz", "127.0.0.1", true);
      }
    };
  }

  public static NetworkInterfaceProvider getOsXWiredAndWireless() {
    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("vmnet8", "192.168.4.1", "192.168.4.1", false),
            newInterface("vmnet1", "192.168.166.1", "192.168.166.1", false),
            new NetworkInterface("en1",
                new INetAddress("somehost.subd.test.com", "172.12.8.7", false),
                new INetAddress("2620:0:1042:13:3bb0:35fe:fe7c:629c",
                    "2620:0:1042:13:3bb0:35fe:fe7c:629c", false),
                new INetAddress("fe80:0:0:0:3bb0:35fe:fe7c:629c%6",
                    "fe80:0:0:0:3bb0:35fe:fe7c:629c%6", false)),
            newInterface("en0",
                new INetAddress("someotherhost.subd.test.com", "172.12.8.9", false),
                new INetAddress("fe80:0:0:0:6e6d:63ff:fe8c:bd10%4",
                    "fe80:0:0:0:6e6d:63ff:fe8c:bd10%4", false)),
            new NetworkInterface("lo0",
                new INetAddress("localhost", "127.0.0.1", true),
                new INetAddress("somemachine.local", "fe80:0:0:0:0:0:0:1%1", false),
                new INetAddress("localhost", "0:0:0:0:0:0:0:1", true)));
      }

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
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("lo0", "localhost.apache.org", "127.0.0.1", true),
            newInterface("bge1", "192.168.0.4", "192.168.0.4", false),
            newInterface("nfe1",
                new INetAddress("minotaur-2.apache.org", "140.211.11.10", false),
                new INetAddress("minotaur.apache.org", "140.211.11.9", false)));
      }

      // This method should only return an interface if it's named exactly "lo"
      public NetworkInterface getLoInterface() {
        return null;
      }
    };

  }

  public static NetworkInterfaceProvider getVistaBox() {
    // The world is a wild and wonderful place
    return new NetworkInterfaceProvider() {
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
            newInterface("net3", "fe80:0:0:0:0:100:7", "fe80:0:0:0:0:10", false),
            newInterface("eth3", "woz134.wozms", "fe80:0:0:0:4d74", "woz134", "10.0.0.108", false),
            newInterface("net3", "fe80:0:0:0:0:100:7", "fe80:0:0:0:0:10", false),
            newInterface("net5", "fe80:0:0:0:0:5efe", "fe80:0:0:0:0:5e", false),
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

      public NetworkInterface getLoInterface() {
        return newInterface("lo", new INetAddress("0:0:0:0:0:0:0:1", "0:0:0:0:0:0:0:1", true),
            new INetAddress("hn127.0.0.1", "127.0.0.1", true)); // Hostname was originally without
                                                                // "hn" prefix
      }

    };
  }


  public static NetworkInterfaceProvider getWindows7Box() {
    // dawagner's windows 7 box
    return new NetworkInterfaceProvider() {
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
            newInterface("net3", "fe80:0:0:0:acc5:fca8:4900:3d5e%11",
                "fe80:0:0:0:acc5:fca8:4900:3d5e%11",
                "192.168.1.102", "192.168.1.102", false),
            newInterface("net4", "fe80:0:0:0:0:5efe:c0a8:166%12", "fe80:0:0:0:0:5efe:c0a8:166%12",
                false),
            newInterface("net5", "bruckner", "2001:0:5ef5:79fd:145f:2f8:adef:9d07",
                "bruckner", "fe80:0:0:0:145f:2f8:adef:9d07%13", false),

            newInterface("eth4", "fe80:0:0:0:e565:922d:d0ed:88ed%14",
                "fe80:0:0:0:e565:922d:d0ed:88ed%14", false),
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
      public NetworkInterface getLoInterface() {
        return newInterface("lo", new INetAddress("0:0:0:0:0:0:0:1", "0:0:0:0:0:0:0:1", true),
            new INetAddress("hnx127.0.0.1", "127.0.0.1", true)); // Hostname was originally without
                                                                 // "hnx" prefix
      }

    };
  }

  public static NetworkInterfaceProvider getOpenSuseBoxFromIssue1181() {
    // dawagner's windows 7 box
    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("wlan0", "192.168.37.21", "192.168.37.21", false),
            getLoInterface()
            );
      }

      // This method should only return an interface if it's named exactly "lo"
      public NetworkInterface getLoInterface() {
        INetAddress iNetAddress1 = new INetAddress("127.0.0.2", "127.0.0.2", true);
        INetAddress iNetAddress2 = new INetAddress("localhost.localdomain", "127.0.0.1", true);
        return newInterface("lo", iNetAddress1, iNetAddress2);
      }

    };
  }


}
