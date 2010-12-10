package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestRollup extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testRollup() throws Exception {
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
