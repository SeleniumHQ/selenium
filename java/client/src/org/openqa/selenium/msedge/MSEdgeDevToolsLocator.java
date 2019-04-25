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

package org.openqa.selenium.msedge;

import org.openqa.selenium.chromium.ChromiumDevToolsLocator;
import org.openqa.selenium.devtools.Console;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.Log;

class MSEdgeDevToolsLocator extends ChromiumDevToolsLocator {

  public static void main(String[] args) throws Exception {
    MSEdgeDriver driver = new MSEdgeDriver();

    DevTools devTools = driver.getDevTools();

    devTools.createSession();
    devTools.send(Log.enable());

    devTools.addListener(Log.entryAdded(), entry -> System.out.println(entry.asSeleniumLogEntry()));

    devTools.send(Console.enable());
    devTools.addListener(Console.messageAdded(), System.out::println);

    driver.get("http://www.google.com");
    driver.executeScript("console.log('Hello, World!');");

    Thread.sleep(2000);

    driver.quit();
  }

}
