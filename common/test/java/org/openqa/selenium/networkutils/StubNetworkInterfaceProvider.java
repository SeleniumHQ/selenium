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

import java.util.Arrays;

@SuppressWarnings({"UseOfSystemOutOrSystemErr", "UtilityClass"})
public class StubNetworkInterfaceProvider {
  private StubNetworkInterfaceProvider() {
  }

 // TODO: Remove the use of the getLoInterface method, all the way from the top

  public static NetworkInterfaceProvider getUbuntu1010SingleNICAndWlan() {
    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
                new NetworkInterface("wlan0",
                        new INetAddress("chunky.local", "169.254.8.180", false),
                        new INetAddress("chunky.local", "169.254.8.180", false)),
                new NetworkInterface("eth0",
                        new INetAddress("fe80:0:0:0:21e:33ff:fe24:6295%2", "fe80:0:0:0:21e:33ff:fe24:6295%2", false),
                        new INetAddress("192.168.1.13", "192.168.1.13", false)),
                new NetworkInterface("lo",
                        new INetAddress("localhost", "0:0:0:0:0:0:0:1%1", true),
                        new INetAddress("localhost", "127.0.0.3", true)));
      }
      public NetworkInterface getLoInterface() {
        return new NetworkInterface("lo",
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
                new INetAddress("localXhost", "127.0.0.4", true)); // Just for fun set to .3
      }
    };
  }

  public static NetworkInterfaceProvider getRHEL5Box() {
    //Linux woz-woz23 2.6.18-92.el5 #1 SMP Tue Apr 29 13:16:15 EDT 2008 x86_64 x86_64 x86_64 GNU/Linux

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
                new NetworkInterface("eth0",
                        new INetAddress("fe80:0:0:1:215:41ff:fe3a:1882%2", "e80:0:0:1:215:41ff:fe3a:1882%2", false),
                        new INetAddress("157.120.171.97", "157.120.171.97", false)),
                new NetworkInterface("lo",
                        new INetAddress("p6-localhost", "0:0:0:0:0:0:0:1%1", true),
                        new INetAddress("playwoz", "127.0.0.1", true)));
      }

      public NetworkInterface getLoInterface() {
        return new NetworkInterface("lo",
                new INetAddress("p6-localhost", "0:0:0:0:0:0:0:1%1", true),
                new INetAddress("playwoz", "127.0.0.1", true)); // Just for fun set to .3
      }
    };
  }

  private static NetworkInterface newInterface(String ifName, String hostName, String hostIp, boolean isLoopback) {
    return new NetworkInterface(ifName, new INetAddress(hostName, hostIp, isLoopback));
  }

  public static NetworkInterfaceProvider getOsXWiredAndWireless() {
    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
                newInterface("vmnet8", "192.168.4.1", "192.168.4.1", false),
                newInterface("vmnet1", "192.168.166.1", "192.168.166.1", false),
                new NetworkInterface("en1",
                        new INetAddress("somehost.subd.test.com", "172.12.8.7", false),
                        new INetAddress("2620:0:1042:13:3bb0:35fe:fe7c:629c", "2620:0:1042:13:3bb0:35fe:fe7c:629c", false),
                        new INetAddress("fe80:0:0:0:3bb0:35fe:fe7c:629c%6", "fe80:0:0:0:3bb0:35fe:fe7c:629c%6", false)),
                new NetworkInterface("en0",
                        new INetAddress("someotherhost.subd.test.com", "172.12.8.9", false),
                        new INetAddress("fe80:0:0:0:6e6d:63ff:fe8c:bd10%4", "fe80:0:0:0:6e6d:63ff:fe8c:bd10%4", false)),
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

  public static NetworkInterfaceProvider getFreeBsd(){
    // FreeBSD minotaur.apache.org 8.0-STABLE FreeBSD 8.0-STABLE #0 r204183:204434: Sat Feb 27 22:11:44 UTC 2010
    //  root@loki.apache.org:/usr/obj/usr/src/sys/MINOTAUR  amd64

    return new NetworkInterfaceProvider() {
      public Iterable<NetworkInterface> getNetworkInterfaces() {
        return Arrays.asList(
            newInterface("lo0", "localhost.apache.org", "127.0.0.1", true),
            newInterface("bge1", "192.168.0.4", "192.168.0.4", false),
            new NetworkInterface("nfe1",
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
                new NetworkInterface("net0"),
                new NetworkInterface("net1"),
                new NetworkInterface("ppp0"),
                new NetworkInterface("eth0"),
                new NetworkInterface("eth1"),
                new NetworkInterface("ppp1"),
                new NetworkInterface("net2"),
                new NetworkInterface("eth2"),
                newInterface("net3", "fe80:0:0:0:0:100:7", "fe80:0:0:0:0:10", false),
                new NetworkInterface("eth3",
                new INetAddress(" woz134.wozms", "fe80:0:0:0:4d74", false),
                new INetAddress("woz134", "10.0.0.108", false)),
                newInterface("net3", "fe80:0:0:0:0:100:7", "fe80:0:0:0:0:10", false),
                newInterface("net5", "fe80:0:0:0:0:5efe", "fe80:0:0:0:0:5e", false),
                new NetworkInterface("eth4"),
                new NetworkInterface("net6"),
                new NetworkInterface("net7"),
                new NetworkInterface("eth5"),
                new NetworkInterface("eth6"),
                new NetworkInterface("eth7"),
                new NetworkInterface("eth8"),
                new NetworkInterface("eth9")
                );
      }
      public NetworkInterface getLoInterface() {
        return new NetworkInterface("lo",
                new INetAddress("0:0:0:0:0:0:0:1", "0:0:0:0:0:0:0:1", true),
                new INetAddress("hn127.0.0.1", "127.0.0.1", true)); // Hostname was originally without "hn" prefix
      }

    };
  }


}
