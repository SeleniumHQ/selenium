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

import static org.assertj.core.api.Assertions.assertThat;

import java.net.InetSocketAddress;
import java.net.ServerSocket;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
public class PortProberTest {

  private static final int TEST_PORT = 12345;

  @Test
  void checkPortIsFree_checksIpv4Localhost() throws Exception {
    try (ServerSocket socket = new ServerSocket()) {
      socket.bind(new InetSocketAddress("localhost", TEST_PORT));
      assertThat(PortProber.checkPortIsFree(TEST_PORT)).isEqualTo(-1);
    }
  }

  @Test
  void checkPortIsFree_checksIpv4AllInterfaces() throws Exception {
    try (ServerSocket socket = new ServerSocket()) {
      socket.bind(new InetSocketAddress("0.0.0.0", TEST_PORT));
      assertThat(PortProber.checkPortIsFree(TEST_PORT)).isEqualTo(-1);
    }
  }

  @Test
  void checkPortIsFree_checksIpv6AllInterfaces() throws Exception {
    try (ServerSocket socket = new ServerSocket()) {
      socket.bind(new InetSocketAddress("::", TEST_PORT));
      assertThat(PortProber.checkPortIsFree(TEST_PORT)).isEqualTo(-1);
    }
  }
}
