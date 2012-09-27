/*
Copyright 2012 Software Freedom Conservancy
Copyright 2007-2010 Selenium committers

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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.Alert;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.collect.ImmutableMap;

/**
 * IPhoneDriver is a driver for running tests on Mobile Safari on the iPhone, iPad and iPod Touch.
 * 
 * The driver uses WebDriver's remote REST interface to communicate with the iphone. The iphone (or
 * iphone simulator) must be running the iWebDriver app.
 */
public class IPhoneDriver extends RemoteWebDriver implements TakesScreenshot, WebStorage {

  /**
   * This is the default port and URL for iWebDriver. Eventually it would be nice to use DNS-SD to
   * detect iWebDriver instances running non locally or on non-default ports.
   */
  protected static final String DEFAULT_IWEBDRIVER_URL =
      "http://localhost:3001/wd/hub";
  
  public enum STORAGE_TYPE { local, session }

  /**
   * Create an IPhoneDriver that will use the given {@code executor} to communicate with the
   * iWebDriver app.
   * 
   * @param executor The executor to use for communicating with the iPhone.
   */
  public IPhoneDriver(CommandExecutor executor) {
    super(executor, DesiredCapabilities.iphone());
  }

  /**
   * Create an IPhoneDriver connected to the remote address passed in.
   * 
   * @param remoteAddress The full URL of the remote client (device or simulator).
   * @throws Exception
   * @see #IPhoneDriver(String)
   */
  public IPhoneDriver(URL remoteAddress) throws Exception {
    super(remoteAddress, DesiredCapabilities.iphone());
  }

  /**
   * Create an IPhoneDriver connected to the remote address passed in.
   * 
   * @param remoteAddress The full URL of the remote client running iWebDriver.
   * @throws Exception
   * @see #IPhoneDriver(URL)
   */
  public IPhoneDriver(String remoteAddress) throws Exception {
    this(new URL(remoteAddress));
  }

  /**
   * Create an IPhoneDriver connected to an iphone simulator running on the local machine.
   * 
   * @throws Exception
   */
  public IPhoneDriver() throws Exception {
    this(DEFAULT_IWEBDRIVER_URL);
  }

  public IPhoneDriver(Capabilities ignored) throws Exception {
    this();
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  @Override
  public void close() {
    throw new UnsupportedOperationException("Not yet implemented");
  }

  @Override
  public TargetLocator switchTo() {
    return new IPhoneTargetLocator();
  }

  private class IPhoneTargetLocator extends RemoteTargetLocator {

    public WebElement activeElement() {
      return (WebElement) executeScript("return document.activeElement || document.body;");
    }

    public Alert alert() {
      throw new UnsupportedOperationException("alert()");
    }
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    String png = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(png);
  }

  public LocalStorage getLocalStorage() {
    return new IPhoneStorage(STORAGE_TYPE.local);
  }

  public SessionStorage getSessionStorage() {
    return new IPhoneStorage(STORAGE_TYPE.session);
  }

  private class IPhoneStorage implements LocalStorage, SessionStorage {

	private STORAGE_TYPE t;
	
	public IPhoneStorage(STORAGE_TYPE type) {
		t = type;
	}
	
	public String getItem(String key) {
		return (String) execute(t==STORAGE_TYPE.local?
				DriverCommand.GET_LOCAL_STORAGE_ITEM : DriverCommand.GET_SESSION_STORAGE_ITEM, 
				ImmutableMap.of("key", key)).getValue();
	}

	@SuppressWarnings("unchecked")
	public Set<String> keySet() {
		return new HashSet<String>((List<String>) execute(t==STORAGE_TYPE.local?
				DriverCommand.GET_LOCAL_STORAGE_KEYS : DriverCommand.GET_SESSION_STORAGE_KEYS).getValue());
	}

	public void setItem(String key, String value) {
		execute(t==STORAGE_TYPE.local?
				DriverCommand.SET_LOCAL_STORAGE_ITEM : DriverCommand.SET_SESSION_STORAGE_ITEM, 
				ImmutableMap.of("key", key, "value", value));
	}

	public String removeItem(String key) {
		return (String) execute(t==STORAGE_TYPE.local?
				DriverCommand.REMOVE_LOCAL_STORAGE_ITEM : DriverCommand.REMOVE_SESSION_STORAGE_ITEM, 
				ImmutableMap.of("key", key)).getValue();
	}

	public void clear() {
		execute(t==STORAGE_TYPE.local?
				DriverCommand.CLEAR_LOCAL_STORAGE : DriverCommand.CLEAR_SESSION_STORAGE);
	}

	public int size() {
		return ((Number) execute(t==STORAGE_TYPE.local?
				DriverCommand.GET_LOCAL_STORAGE_SIZE : DriverCommand.GET_SESSION_STORAGE_SIZE).getValue()).intValue();
	}
	  
  }
}
