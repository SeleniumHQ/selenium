package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestModalDialog extends InternalSelenseTestBase {
	@Test
  public void testModalDialog() throws Exception {
		selenium.open("../tests/html/test_modal_dialog.html");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_modal_dialog\\.html$"));
		verifyEquals(selenium.getTitle(), "Modal Dialog Host Window");

		verifyEquals(selenium.getText("changeText"), "before modal dialog");

    // TODO(simon): re-enable this test
    return;

//		selenium.click("modal");
//		// selenium.waitForPopup("Modal Dialog Popup", "5000");
//		selenium.selectWindow("Modal Dialog Popup");
//		verifyEquals(selenium.getTitle(), "Modal Dialog Popup");
//		selenium.click("change");
//		selenium.click("close");
//		selenium.selectWindow("Modal Dialog Host Window");
//		verifyEquals(selenium.getText("changeText"), "after modal dialog");
//		verifyEquals(selenium.getTitle(), "Modal Dialog Popup");
	}
}
