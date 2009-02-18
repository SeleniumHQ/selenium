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

import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * IPhoneDriver is a driver for running tests on Mobile Safari on the iPhone
 *  and iPod Touch.
 * 
 * The driver uses WebDriver's remote REST interface to communicate with the
 * iphone. The iphone (or iphone simulator) must be running the iWebDriver app.
 */
public class IPhoneDriver extends RemoteWebDriver {

  /**
   * Create an IPhoneDriver connected to the remote address passed in.
   * @param remoteAddress The full URL of the remote client (device or 
   *                      simulator).
   * @throws Exception
   * @see IPhoneDriver(String remoteAddress)
   */
  public IPhoneDriver(URL remoteAddress) throws Exception {
    super(remoteAddress, DesiredCapabilities.iphone());
  }

  /**
   * Create an IPhoneDriver connected to the remote address passed in.
   * @param remoteAddress The full URL of the remote client running iWebDriver.
   *                      No trailing slash.
   * @throws Exception
   * @see IPhoneDriver(URL remoteAddress)
   */
  public IPhoneDriver(String remoteAddress) throws Exception {
    this(new URL(remoteAddress));
  }
  
  /**
   * Create an IPhoneDriver connected to an iphone simulator running on the
   * local machine.
   * 
   * @throws Exception
   */
  public IPhoneDriver() throws Exception {
    // This is the default port and URL for iWebDriver. Eventually it would
    // be nice to use DNS-SD to detect iWebDriver instances running non
    // locally or on non-default ports.
    this("http://localhost:16000/hub");
  }
}
