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

package org.openqa.selenium.docker;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.docker.Port.tcp;

import org.junit.Test;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;

/**
 * This assumes that Docker is listening on port 2375. On OS X and Linux you can make this happen
 * using: `socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock`
 */
public class DockerTest {

  @Test
  public void bootstrap() throws IOException {
    HttpClient client = HttpClient.Factory.createDefault()
        .createClient(new URL("http://localhost:2375"));

    Docker docker = new Docker(client);

    Image pulled = docker.pull("selenium/standalone-firefox", "3.141.59");

    int port = PortProber.findFreePort();
    Container container = docker.create(ContainerInfo.image(pulled).map(tcp(4444), tcp(port)));

    container.start();

    assertTrue(PortProber.pollPort(port, 10, SECONDS));

    container.stop(Duration.ofSeconds(30));
    container.delete();
  }

}
