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

package org.openqa.selenium.iphone;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.StandardSeleniumTests;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    StandardSeleniumTests.class,
    IPhoneSpecificTests.class
})
public class AlreadyRunningIPhoneDriverTests {

  // TODO(simon): Hook this into the test suite
  public static class AlreadyRunningIPhoneDriver extends RemoteWebDriver {
    public AlreadyRunningIPhoneDriver() throws MalformedURLException {
      super(new URL("http://localhost:3001/hub"), DesiredCapabilities.iphone());
    }
  }

}
