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

package org.openqa.selenium.iphone;

import java.net.URL;

import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * IPhoneDriver is a driver for running tests on Mobile Safari on the iPhone / iPod Touch.
 * 
 * The driver uses WebDriver's remote REST interface to communicate with the
 * iphone. The iphone (or iphone simulator) must run the iWebDriver app.
 */
public class IPhoneDriver extends RemoteWebDriver {

  public IPhoneDriver(CommandExecutor executor, Capabilities desiredCapabilities) {
    super(executor, desiredCapabilities);
  }

  public IPhoneDriver(Capabilities desiredCapabilities) throws Exception {
    super(desiredCapabilities);
  }

  public IPhoneDriver(URL remoteAddress, Capabilities desiredCapabilities)
  	    throws Exception {
    super(remoteAddress, desiredCapabilities);
  }

}
