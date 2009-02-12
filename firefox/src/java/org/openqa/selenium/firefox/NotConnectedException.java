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

package org.openqa.selenium.firefox;

import java.io.IOException;
import java.net.Socket;

public class NotConnectedException extends IOException {
  public NotConnectedException(Socket socket, long timeToWaitInMilliSeconds) {
    super(getMessage(socket, timeToWaitInMilliSeconds));
  }
  
  private static final String getMessage(Socket socket, long timeToWaitInMilliSeconds) {
    if (socket == null || socket.getInetAddress() == null) {
      return String.format("Failed to start up socket within %d", timeToWaitInMilliSeconds);
    } else {
      return String.format("Unable to connect to host %s on port %d after %d ms", 
          socket.getInetAddress().toString(), socket.getPort(), timeToWaitInMilliSeconds);
    }
  }
}
