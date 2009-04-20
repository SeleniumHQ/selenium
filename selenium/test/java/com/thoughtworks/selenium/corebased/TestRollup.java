package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestRollup extends SeleneseTestNgHelper {
	@Test public void testRollup() throws Exception {
		selenium.addScript("", "rollup");
		selenium.open("../tests/html/test_rollup.html");
		selenium.rollup("cake", "");
		selenium.rollup("biscuits", "n=1");
		verifyFalse(selenium.isChecked("name=one"));
		verifyTrue(selenium.isChecked("name=dos"));
		verifyTrue(selenium.isChecked("name=san"));
		selenium.rollup("biscuits", "n=2");
		verifyTrue(selenium.isChecked("name=one"));
		verifyFalse(selenium.isChecked("name=dos"));
		verifyTrue(selenium.isChecked("name=san"));
		selenium.rollup("biscuits", "n=3");
		verifyFalse(selenium.isChecked("name=one"));
		verifyTrue(selenium.isChecked("name=dos"));
		verifyFalse(selenium.isChecked("name=san"));
		selenium.rollup("steamed spinach", "");
		selenium.removeScript("rollup");
	}
}
