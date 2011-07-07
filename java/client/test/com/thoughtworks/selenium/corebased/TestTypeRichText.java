package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestTypeRichText extends InternalSelenseTestBase {
	@Test public void testTypeRichText() throws Exception {
    String isIe = selenium.getEval("browserVersion.isIE");
    if (Boolean.valueOf(isIe)) {
      return;
    }

    selenium.open("../tests/html/test_rich_text.html");
		selenium.selectFrame("richtext");
		verifyEquals(selenium.getText("//body"), "");
		selenium.type("//body", "hello world");
		verifyEquals(selenium.getText("//body"), "hello world");
	}
}
