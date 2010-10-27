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
                getLoInterface());
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
                getLoInterface(),
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
                getLoInterface());
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
                getLoInterface());
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
                getLoInterface());
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
            getLoInterface());
      }

      public NetworkInterface getLoInterface() {
        return new NetworkInterface("lo0",
            new INetAddress("localhost", "127.0.0.1", true),
            new INetAddress("somemachine.local", "fe80:0:0:0:0:0:0:1%1", false),
            new INetAddress("localhost", "0:0:0:0:0:0:0:1", true));
      }
    };
  }
}
