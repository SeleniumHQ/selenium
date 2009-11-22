package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestTypeRichText extends SeleneseTestNgHelper {
	@Test public void testTypeRichText() throws Exception {
		selenium.open("../tests/html/test_rich_text.html");
		selenium.selectFrame("richtext");
		verifyEquals(selenium.getText("//body"), "");
		selenium.type("//body", "hello world");
		verifyEquals(selenium.getText("//body"), "hello world");
	}
}
