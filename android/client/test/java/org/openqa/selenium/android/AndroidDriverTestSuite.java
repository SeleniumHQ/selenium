/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android;

import junit.framework.Test;
import junit.framework.TestCase;

import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.android.environment.AndroidTestEnvironment;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.REMOTE;

/**
 * Unit tests suite for Android driver.
 */
public class AndroidDriverTestSuite extends TestCase {
  
  public static Test suite() throws Exception {
    TestEnvironment env = GlobalTestEnvironment.get();
    if (env != null){
      env.stop();
    }
    GlobalTestEnvironment.set(new AndroidTestEnvironment());

    return new TestSuiteBuilder()
        .addSourceDir("android/client")
        .addSourceDir("remote")
        .addSourceDir("common")
        .usingDriver(AndroidDriver.class)
        .keepDriverInstance()
        .exclude(ANDROID)
        .exclude(REMOTE)
        .includeJavascriptTests()
        .onlyRun("FrameSwitchingTest")
//        .onlyRun("PageLoadingTest")
        .create();
  }
}
