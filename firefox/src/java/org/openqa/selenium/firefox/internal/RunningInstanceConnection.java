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

import org.openqa.selenium.WebDriverException;

public class RunningInstanceConnection extends AbstractExtensionConnection {

    public static final long DEFAULT_CONNECT_TIMEOUT = 500;

    public RunningInstanceConnection(String host, int port) throws Exception {
        this(host, port, DEFAULT_CONNECT_TIMEOUT);
    }

    public RunningInstanceConnection(String host, int port, long timeOut) throws Exception {
      super(host, port, timeOut);
    }

    public void quit() {
      // This should only be called after the QUIT command has been sent,
      // so just pause momentarily to give Firefox time to shutdown.
      try {
        Thread.sleep(250);
      } catch (InterruptedException e) {
        throw new WebDriverException(e);
      }
    }
}
