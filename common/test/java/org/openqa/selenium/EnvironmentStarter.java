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

package org.openqa.selenium;

import junit.extensions.TestSetup;
import junit.framework.Test;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;

public class EnvironmentStarter extends TestSetup {
	private TestEnvironment environment;

	public EnvironmentStarter(Test test) {
		super(test);
	}
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
		environment = new InProcessTestEnvironment();
		GlobalTestEnvironment.set(environment);
	}
	
	@Override
	protected void tearDown() throws Exception {
		WebDriver driver = DriverTestDecorator.getDriver();
		if (driver != null && !Boolean.getBoolean("webdriver.singletestsuite.leaverunning")) {
			driver.quit();
		}
		
	    environment.stop();
		GlobalTestEnvironment.set(null);
		
		super.tearDown();
	}
}
