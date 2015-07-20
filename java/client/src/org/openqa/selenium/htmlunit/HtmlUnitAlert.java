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

package org.openqa.selenium.htmlunit;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import org.openqa.selenium.Alert;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.security.Credentials;

import com.gargoylesoftware.htmlunit.AlertHandler;
import com.gargoylesoftware.htmlunit.Page;

class HtmlUnitAlert implements Alert, AlertHandler {

  private HtmlUnitDriver driver;
  private Map<Page, Queue<String>> queues = new HashMap<>();

  HtmlUnitAlert(HtmlUnitDriver driver) {
    this.driver = driver;
    driver.getWebClient().setAlertHandler(this);
  }

  @Override
  public void dismiss() {
    accept();
  }

  @Override
  public void accept() {
    Queue<String> queue = getCurrentQueue();
    if (queue == null || queue.poll() == null) {
      throw new NoAlertPresentException();
    }
  }

  @Override
  public String getText() {
    Queue<String> queue = getCurrentQueue();
    if (queue != null) {
      String text = queue.peek();
      if (text != null) {
        return text;
      }
    }
    throw new NoAlertPresentException();
  }

  @Override
  public void sendKeys(String keysToSend) {
    throw new ElementNotVisibleException("alert is not visible");
  }

  @Override
  public void authenticateUsing(Credentials credentials) {
  }

  @Override
  public void setCredentials(Credentials credentials) {
  }


  @Override
  public void handleAlert(Page page, String message) {
    Queue<String> queue = queues.get(page);
    if (queue == null) {
      queue = new LinkedList<String>();
      queues.put(page, queue);
    }
    queue.add(message);
  }

  Queue<String> getCurrentQueue() {
    return queues.get(driver.getCurrentWindow().getEnclosedPage());
  }

  /**
   * Closes the current window.
   */
  void close() {
    queues.remove(driver.getCurrentWindow());
  }

}
