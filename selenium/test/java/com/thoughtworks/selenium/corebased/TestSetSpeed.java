package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestSetSpeed extends SeleneseTestNgHelper {
	@Test public void testSetSpeed() throws Exception {
		String lastSpeed = selenium.getSpeed();
		//  The max value in slider is 1000, but setSpeed command can set higher than this 
		selenium.setSpeed("1600");
		verifyEquals(selenium.getSpeed(), "1600");
		selenium.setSpeed("500");
		verifyEquals(selenium.getSpeed(), "500");
		//  Negative value should be treated as 0 
		selenium.setSpeed("0");
		verifyEquals(selenium.getSpeed(), "0");
		selenium.setSpeed("-100");
		verifyEquals(selenium.getSpeed(), "0");
		selenium.setSpeed(lastSpeed);
		Thread.sleep(100);
	}
}
