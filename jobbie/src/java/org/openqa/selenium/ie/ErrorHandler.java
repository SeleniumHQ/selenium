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

package org.openqa.selenium.ie;

import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.InvalidCookieDomainException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.NoSuchWindowException;

class ErrorHandler {
  public void verifyErrorCode(int errorCode, String message) {
    switch (errorCode) {
    case SUCCESS: 
      break; // Nothing to do
     
    case 7:
      throw new NoSuchElementException(message);
      
    case 8:
      throw new NoSuchFrameException(message);
           
    case 9:
      throw new UnsupportedOperationException("You may not perform the requested action");
      
    case 10:
      throw new StaleElementReferenceException(
          String.format("You may not %s this element. It looks as if the reference is stale. " +
                        "Did you navigate away from the page with this element on?", message));

    case 11:
      throw new ElementNotVisibleException(
          String.format("You may not %s an element that is not displayed", message));
      
    case 12:
      throw new UnsupportedOperationException(
              String.format("You may not %s an element that is not enabled", message));

    case 14:
      throw new WebDriverException("An unhandled exception has occured. " + message);

    case 15:
      throw new UnsupportedOperationException(
              String.format("The element appears to be unselectable: %s", message));

    case 16:
      throw new NoSuchElementException(message + " (no document found)");

    case 17:
      throw new UnexpectedJavascriptExecutionException(message);

    case 21:
      throw new TimedOutException("The driver reported that the command timed out. There may "
                                      + "be several reasons for this. Check that the destination"
                                      + "site is in IE's 'Trusted Sites' (accessed from Tools->"
                                      + "Internet Options in the 'Security' tab) If it is a "
                                      + "trusted site, then the request may have taken more than"
                                      + "a minute to finish.");

    case 23:
      throw new NoSuchWindowException(message);

    case 24:
      throw new InvalidCookieDomainException(message);

    case 25:
      throw new UnableToSetCookieException(message);

    default: 
      throw new IllegalStateException(String.format("%s (%d)", message, errorCode));
    }
  }
}
