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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Platform.LINUX;

import org.junit.Assume;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Platform;

import java.io.StringReader;

@RunWith(JUnit4.class)
public class LinuxEphemeralPortRangeDetectorTest {

  @BeforeClass
  public static void requiresLinux() {
    Assume.assumeTrue(Platform.getCurrent().is(LINUX));
  }

  @Test
  public void decodeEphemeralPorts() throws Exception {
    String range ="1234 65533";
    EphemeralPortRangeDetector ephemeralEphemeralPortDetector =
        new LinuxEphemeralPortRangeDetector(new StringReader(range));
    assertEquals( 1234, ephemeralEphemeralPortDetector.getLowestEphemeralPort());
    assertEquals( 65533, ephemeralEphemeralPortDetector.getHighestEphemeralPort());
  }

  @Test
  public void currentValues() {
    LinuxEphemeralPortRangeDetector detector = LinuxEphemeralPortRangeDetector.getInstance();
    assertTrue( detector.getLowestEphemeralPort() > 1024);
    assertTrue( detector.getHighestEphemeralPort() < 65536);
  }
}
