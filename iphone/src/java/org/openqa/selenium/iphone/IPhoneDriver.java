/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * IPhoneDriver is a driver for running tests on Mobile Safari on the iPhone, 
 * iPad and iPod Touch.
 * 
 * The driver uses WebDriver's remote REST interface to communicate with the
 * iphone. The iphone (or iphone simulator) must be running the iWebDriver app.
 */
public class IPhoneDriver extends RemoteWebDriver {

  /**
   * This is the default port and URL for iWebDriver. Eventually it would
   * be nice to use DNS-SD to detect iWebDriver instances running non
   * locally or on non-default ports.
   */
  protected static final String DEFAULT_IWEBDRIVER_URL = 
	  "http://localhost:3001/hub";

  /**
   * Create an IPhoneDriver that will use the given {@code executor} to
   * communicate with the iWebDriver app.
   *
   * @param executor The executor to use for communicating with the iPhone.
   */
  public IPhoneDriver(CommandExecutor executor) {
    super(executor, DesiredCapabilities.iphone());
  }

  /**
   * Create an IPhoneDriver connected to the remote address passed in.
   * @param remoteAddress The full URL of the remote client (device or 
   *                      simulator).
   * @throws Exception
   * @see #IPhoneDriver(String)
   */
  public IPhoneDriver(URL remoteAddress) throws Exception {
    super(remoteAddress, DesiredCapabilities.iphone());
  }

  /**
   * Create an IPhoneDriver connected to the remote address passed in.
   * @param remoteAddress The full URL of the remote client running iWebDriver.
   * @throws Exception
   * @see #IPhoneDriver(URL)
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
    this(DEFAULT_IWEBDRIVER_URL);
  }

  @Override
  public void close() {
    throw new UnsupportedOperationException("Not yet implemented");
  }

  @Override
  public TargetLocator switchTo() {
    return new IPhoneTargetLocator();
  }

  private class IPhoneTargetLocator implements TargetLocator {

    public WebDriver frame(int frameIndex) {
      // is this even possible to do on the iphone?
      throw new UnsupportedOperationException(
    		  "Frame switching is not supported on the iPhone");
    }

    public WebDriver frame(String frameName) {
      // is this even possible to do on the iphone?
      throw new UnsupportedOperationException(
    		  "Frame switching is not supported on the iPhone");
    }

    public WebDriver window(String windowName) {
      throw new UnsupportedOperationException(
    		  "Window switching is unsupported on the iPhone");
    }

    public WebDriver defaultContent() {
      // is this even possible to do on the iphone?
      throw new UnsupportedOperationException(
    		  "Frame switching is not supported on the iPhone");
    }

    public WebElement activeElement() {
      return (WebElement) executeScript(
    		  "return document.activeElement || document.body;");
    }
  }
}
