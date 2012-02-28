/*
Copyright 2012 WebDriver committers
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

package org.openqa.selenium.htmlunit;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.junit.internal.runners.SuiteMethod;
import org.junit.runner.RunWith;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.testing.drivers.Browser;

@RunWith(SuiteMethod.class)
public class LegacyJunit3Tests extends TestSuite {
  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .using(Browser.detect())
        .includeJavascriptTests()
        .create();
  }
}
