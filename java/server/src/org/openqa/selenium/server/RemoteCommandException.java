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

/**
 * Exception to notify calling methods that an exception occurred when executing the method.
 * 
 * @author Matthew Purland
 */
public class RemoteCommandException extends Exception {
  // Result of the remote command that an exception occurred
  private String result;

  public RemoteCommandException(String message, String result) {
    super(message);

    this.result = result;
  }

  public RemoteCommandException(String message, String result, Throwable throwable) {
    super(message, throwable);

    this.result = result;
  }

  /**
   * Get the result of the remote command that caused the exception.
   */
  public String getResult() {
    return result;
  }
}
