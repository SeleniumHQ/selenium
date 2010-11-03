/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.firefox.internal;

import junit.framework.TestCase;

import java.net.BindException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.WebDriverException;

/**
 * Tests for the {@link SocketLock} to make sure I'm not batshit crazy.
 * 
 * @author gregory.block@gmail.com (Gregory Block)
 */
public class SocketLockTest extends TestCase {
  private int freePort;
  private final Random portRandom = new Random();

  @Override
  protected void setUp() throws Exception {
    super.setUp();
    int randomPort = 24567;

    Socket testSocket = new Socket();
    boolean portFree = false;
    while (!portFree) {
      try {
        InetSocketAddress addr = new InetSocketAddress("localhost", randomPort);
        testSocket.bind(addr);
        portFree = true;
        testSocket.close();
      } catch (BindException e) {
        final int PORT_START = 1025;
        final int PORT_RANGE = 65535 - PORT_START;
        randomPort = Math.abs(portRandom.nextInt(PORT_RANGE)) + PORT_START;
      }
    }

    freePort = randomPort;
  }

  @Test
  public void testWellKnownLockLocation() {
    Lock lock = new SocketLock(freePort);
    lock.lock(TimeUnit.SECONDS.toMillis(1));
    lock.unlock();
  }
  
  @Test
  public void testSerialLockOnSamePort() {
    for (int i = 0; i < 20; i++) {
      Lock lock = new SocketLock(freePort);
      lock.lock(TimeUnit.SECONDS.toMillis(1));
      lock.unlock();
    }
  }
  
  @Test
  public void testAttemptToReuseLocksFails() {
    Lock lock = new SocketLock(freePort);
    lock.lock(TimeUnit.SECONDS.toMillis(1));
    lock.unlock();
    try {
      lock.lock(TimeUnit.SECONDS.toMillis(1));
      Assert.fail("Expected a SocketException to be thrown when reused");
    } catch (WebDriverException e) {
      
      // Lock reuse not permitted; expected.
    }
  }
}
