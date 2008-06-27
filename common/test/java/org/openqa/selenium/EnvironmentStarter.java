package org.openqa.selenium;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;

import junit.extensions.TestSetup;
import junit.framework.Test;

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
		if (driver != null) {
			driver.quit();
		}
		environment.stop();
		GlobalTestEnvironment.set(null);
		
		super.tearDown();
	}
}
