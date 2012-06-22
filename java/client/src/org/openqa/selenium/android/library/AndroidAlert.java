/*
Copyright 2011 Software Freedom Conservatory.

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

package org.openqa.selenium.android.library;

import android.webkit.JsPromptResult;
import android.webkit.JsResult;

import org.openqa.selenium.Alert;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.security.Credentials;

/**
 * This class represents an Android alert.
 */
public class AndroidAlert implements Alert {

  private final String message;
  private final JsResult result;
  private String textToSend = null;
  private final String defaultValue;

  /* package */ AndroidAlert(String message, JsResult result) {
    this(message, result, null);
  }

  /* package */ AndroidAlert(String message, JsResult result, String defaultValue) {
    this.message = message;
    this.result = result;
    this.defaultValue = defaultValue;
  }

  public void accept() {
    AlertManager.removeAlert(this);
    if (isPrompt()) {
      JsPromptResult promptResult = (JsPromptResult) result;
      String result = textToSend == null ? defaultValue : textToSend;
      promptResult.confirm(result);
    } else {
      result.confirm();
    }
  }

  private boolean isPrompt() {
    return result instanceof JsPromptResult;
  }

  public void dismiss() {
    AlertManager.removeAlert(this);
    result.cancel();
  }

  public String getText() {
    return message;
  }

  @Override
  public void authenticateUsing(Credentials credentials) {
    throw new UnsupportedCommandException("Not implemented yet");
  }

  public void sendKeys(String keys) {
    if (!isPrompt()) {
      throw new ElementNotVisibleException("Alert did not have text field");
    }
    textToSend = (textToSend == null ? "" : textToSend) + keys;
  }
}
