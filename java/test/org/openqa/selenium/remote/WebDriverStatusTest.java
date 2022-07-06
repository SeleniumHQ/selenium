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

package org.openqa.selenium.remote;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URL;

@Tag("UnitTests")
public class WebDriverStatusTest {

  @Test
  public void shouldGetStatusForWebDriverInstance() throws IOException {
    URI uri = URI.create("http://localhost:9898");
    URL url = uri.toURL();

    DriverService service = new FakeDriverService() {
      @Override
      public URL getUrl() {
        return url;
      }
    };

    assertThrows(UncheckedIOException.class,
                 () -> FirefoxDriver.status(service.getUrl()));
  }

  private static class FakeDriverService extends DriverService {

    private boolean started;

    FakeDriverService() throws IOException {
      super(new File("."), 0, DEFAULT_TIMEOUT, null, null);
    }

    @Override
    public void start() {
      started = true;
    }

    @Override
    public boolean isRunning() {
      return started;
    }

    @Override
    protected void waitUntilAvailable() {
      // return immediately
    }
  }
}
