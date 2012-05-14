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

package org.openqa.selenium.browserlaunchers;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.browserlaunchers.locators.Firefox3LocatorUnitTest;
import org.openqa.selenium.browserlaunchers.locators.SingleBrowserLocatorUnitTest;

@RunWith(Suite.class)
@Suite.SuiteClasses(value = {
    Firefox3LocatorUnitTest.class,
    LauncherUtilsUnitTest.class,
    MacProxyManagerUnitTest.class,
    ProxiesTest.class,
    ProxyPacTest.class,
    WindowsProxyManagerUnitTest.class,
    SingleBrowserLocatorUnitTest.class
})
public class RcBrowserLauncherTests {
}
