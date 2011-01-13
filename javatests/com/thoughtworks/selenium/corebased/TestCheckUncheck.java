package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestCheckUncheck extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testCheckUncheck() throws Exception {
		selenium.open("../tests/html/test_check_uncheck.html");
		verifyTrue(selenium.isChecked("base-spud"));
		verifyFalse(selenium.isChecked("base-rice"));
		verifyTrue(selenium.isChecked("option-cheese"));
		verifyFalse(selenium.isChecked("option-onions"));
		selenium.check("base-rice");
		verifyFalse(selenium.isChecked("base-spud"));
		verifyTrue(selenium.isChecked("base-rice"));
		selenium.uncheck("option-cheese");
		verifyFalse(selenium.isChecked("option-cheese"));
		selenium.check("option-onions");
		verifyTrue(selenium.isChecked("option-onions"));
		verifyFalse(selenium.isChecked("option-chilli"));
		selenium.check("option chilli");
		verifyTrue(selenium.isChecked("option-chilli"));
		selenium.uncheck("option index=3");
		verifyFalse(selenium.isChecked("option-chilli"));
	}
}
