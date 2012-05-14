package org.openqa.selenium.net;

/*
Copyright 2011 Selenium committers

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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;

public class LinuxEphemeralPortRangeDetector
        implements EphemeralPortRangeDetector {

  final int firstEphemeralPort;
  final int lastEphemeralPort;

  public static LinuxEphemeralPortRangeDetector getInstance() {
    File file = new File("/proc/sys/net/ipv4/ip_local_port_range");
    if (file.exists() && file.canRead()) {
      Reader inputFil = null;
      try {
        inputFil = new FileReader(file);
      } catch (FileNotFoundException e) {
        throw new RuntimeException(e);
      }
      return new LinuxEphemeralPortRangeDetector(inputFil);
    }
    return new LinuxEphemeralPortRangeDetector(new StringReader("49152 65535"));
  }

  LinuxEphemeralPortRangeDetector(Reader inputFil) {
    FixedIANAPortRange defaultRange = new FixedIANAPortRange();
    int lowPort = defaultRange.getLowestEphemeralPort();
    int highPort = defaultRange.getHighestEphemeralPort();
    try {
      BufferedReader in = new BufferedReader(inputFil);
      final String s;
      s = in.readLine();
      final String[] split = s.split("\\s");
      lowPort = Integer.parseInt(split[0]);
      highPort = Integer.parseInt(split[1]);
    } catch (IOException ignore) {
    }
    firstEphemeralPort = lowPort;
    lastEphemeralPort = highPort;
  }

  public int getLowestEphemeralPort() {
    return firstEphemeralPort;
  }

  public int getHighestEphemeralPort() {
    return lastEphemeralPort;
  }
}
