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

package org.openqa.testing;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.KnownElements;
import org.openqa.selenium.remote.server.Session;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class TestSession implements Session {

  private final SessionId sessionId;
  private final WebDriver driver;
  private final Capabilities capabilities;
  private final KnownElements knownElements;
  private final ExecutorService executor;
  private volatile Thread inUseWithThread = null;


  private long lastAccess;

  public TestSession(SessionId sessionId, WebDriver driver,
      Capabilities capabilities) {
    this.sessionId = sessionId;
    this.driver = driver;
    this.capabilities = capabilities;
    this.knownElements = new KnownElements();
    this.executor = new ThreadPoolExecutor(1, 1, 600L, TimeUnit.SECONDS,
        new LinkedBlockingQueue<Runnable>());
  }

  public void close() {
    executor.shutdown();
  }

  public <X> X execute(final FutureTask<X> future) throws Exception {
    executor.execute(new Runnable() {
          public void run() {
            inUseWithThread = Thread.currentThread();
            inUseWithThread.setName("Session " + sessionId + " processing inside browser");
            try {
              future.run();
            } finally {
              inUseWithThread = null;
              Thread.currentThread().setName("Session " + sessionId + " awaiting client");
            }
          }
        });
    return future.get();
  }

  public WebDriver getDriver() {
    updateLastAccessTime();
    return driver;
  }

  public KnownElements getKnownElements() {
    return knownElements;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public void attachScreenshot(String base64EncodedImage) {
  }

  public String getAndClearScreenshot() {
    return null;
  }

  public boolean isTimedOut(long timeout) {
    return timeout > 0 && (lastAccess + timeout) < System.currentTimeMillis();
  }

  public void updateLastAccessTime() {
    lastAccess = System.currentTimeMillis();
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public TemporaryFilesystem getTemporaryFileSystem() {
    return null;
  }

  public boolean isInUse() {
    return inUseWithThread != null;
  }

  public void interrupt() {
    Thread threadToStop = inUseWithThread;
    if (threadToStop != null) {
      synchronized (threadToStop) {
        threadToStop.interrupt();
      }
    }
  }
}
