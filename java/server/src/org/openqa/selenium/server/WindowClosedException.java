/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.server;

import java.util.logging.Level;
import java.util.logging.Logger;

public class WindowClosedException extends RemoteCommandException {

  public static final String WINDOW_CLOSED_ERROR = "Current window or frame is closed!";
  private static final long serialVersionUID = 1L;
  static Logger log = Logger.getLogger(WindowClosedException.class.getName());

  public WindowClosedException() {
    super(WINDOW_CLOSED_ERROR, WINDOW_CLOSED_ERROR);
    log.fine(WINDOW_CLOSED_ERROR);
  }

  public WindowClosedException(String message) {
    super(message, message);
    log.fine(message);
  }

  public WindowClosedException(Throwable cause) {
    super(WINDOW_CLOSED_ERROR, WINDOW_CLOSED_ERROR, cause);
    log.log(Level.FINE, WINDOW_CLOSED_ERROR, cause);
  }

  public WindowClosedException(String message, Throwable cause) {
    super(message, message, cause);
    log.log(Level.FINE, message, cause);
  }
}
