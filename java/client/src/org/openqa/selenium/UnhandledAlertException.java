/*
Copyright 2007-2009 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium;

import org.openqa.selenium.security.Credentials;

import java.io.Serializable;

public class UnhandledAlertException extends WebDriverException {
  
  private final String alertText;

  public UnhandledAlertException(String commandName) {
    this(commandName, null);
  }
  
  public UnhandledAlertException(String commandName, String alertText) {
    super(commandName);
    this.alertText = alertText;
  }

  /*
   * Returns null if alert text could not be retrieved.
   */
  public Alert getAlert() {
    return new LocallyStoredAlert(alertText);
  }
  
  private static class LocallyStoredAlert implements Alert, Serializable {
    private static final long serialVersionUID = 1L;

    private final String alertText;

    public LocallyStoredAlert(String alertText) {
      this.alertText = alertText;
    }

    public void dismiss() {
      throwAlreadyDismissed();
    }

    public void accept() {
      throwAlreadyDismissed();
    }

    public String getText() {
      return this.alertText;
    }

    public void sendKeys(String keysToSend) {
      throwAlreadyDismissed();
    }

    @Override
    public void authenticateUsing(Credentials credentials) {
      throwAlreadyDismissed();
    }

    private void throwAlreadyDismissed() {
      throw new UnsupportedOperationException("Alert was already dismissed");
    }
  }
}
