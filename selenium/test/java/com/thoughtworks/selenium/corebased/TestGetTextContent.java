package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestGetTextContent extends SeleneseTestNgHelper {
	@Test public void testGetTextContent() throws Exception {
		selenium.open("../tests/html/test_gettextcontent.html");
		verifyTrue(selenium.isTextPresent("Text1"));
		verifyFalse(selenium.isTextPresent("Text2"));
		verifyFalse(selenium.isTextPresent("Text3"));
		verifyFalse(selenium.isTextPresent("Text4"));
		verifyFalse(selenium.isTextPresent("Text5"));
		verifyFalse(selenium.isTextPresent("Text6"));
		verifyFalse(selenium.isTextPresent("Text7"));
		verifyFalse(selenium.isTextPresent("Text8"));
	}
}
