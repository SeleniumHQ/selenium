package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestMultiSelect.html.
 */
public class TestMultiSelect extends SeleneseTestCase
{
   public void testMultiSelect() throws Throwable {
		try {
			

/* Test Multiple Select */
			// open|../tests/html/test_multiselect.html|
			selenium.open("/selenium-server/tests/html/test_multiselect.html");
			String[] tmp2 = {"Second Option"};
			// assertSelectedLabels|theSelect|Second Option
			assertEquals(tmp2, selenium.getSelectedLabels("theSelect"));
			// select|theSelect|index=4
			selenium.select("theSelect", "index=4");
			String[] tmp3 = {"Fifth Option"};
			// verifySelectedLabels|theSelect|Fifth Option
			verifyEquals(tmp3, selenium.getSelectedLabels("theSelect"));
			// addSelection|theSelect|Third Option
			selenium.addSelection("theSelect", "Third Option");
			// addSelection|theSelect|value=
			selenium.addSelection("theSelect", "value=");
			String[] tmp4 = {"Third Option", "Fifth Option", "Empty Value Option"};
			// verifySelectedLabels|theSelect|Third Option,Fifth Option,Empty Value Option
			verifyEquals(tmp4, selenium.getSelectedLabels("theSelect"));
			// removeSelection|theSelect|id=o7
			selenium.removeSelection("theSelect", "id=o7");
			String[] tmp5 = {"Third Option", "Fifth Option"};
			// verifySelectedLabels|theSelect|Third Option,Fifth Option
			verifyEquals(tmp5, selenium.getSelectedLabels("theSelect"));
			// removeSelection|theSelect|label=Fifth Option
			selenium.removeSelection("theSelect", "label=Fifth Option");

			boolean sawThrow13 = false;
			try {
				// originally verifySelected|theSelect|Third Option
						assertEquals("Third Option", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow13 = true;
			}
			verifyFalse(sawThrow13);
			
			// addSelection|theSelect|
			selenium.addSelection("theSelect", "");
			String[] tmp6 = {"Third Option", ""};
			// verifySelectedLabels|theSelect|Third Option,
			verifyEquals(tmp6, selenium.getSelectedLabels("theSelect"));
			// removeSelection|theSelect|
			selenium.removeSelection("theSelect", "");
			// removeSelection|theSelect|Third Option
			selenium.removeSelection("theSelect", "Third Option");

			boolean sawThrow18 = false;
			try {
							// assertSelected|theSelect|
			fail("No option selected");
			}
			catch (Throwable e) {
				sawThrow18 = true;
			}
			verifyTrue(sawThrow18);
			

			boolean sawThrow20 = false;
			try {
							String[] tmp7 = {""};
			// assertSelectedLabels|theSelect|
			assertEquals(tmp7, selenium.getSelectedLabels("theSelect"));
			}
			catch (Throwable e) {
				sawThrow20 = true;
			}
			verifyTrue(sawThrow20);
			
			// verifyValue|theSelect|
			verifyEquals("", selenium.getValue("theSelect"));
			// verifyNotSomethingSelected|theSelect|
			try {selenium.getSelectedIndexes("theSelect");} catch(Throwable e) {}
			// addSelection|theSelect|Third Option
			selenium.addSelection("theSelect", "Third Option");
			// addSelection|theSelect|value=
			selenium.addSelection("theSelect", "value=");
			// removeAllSelections|theSelect|
			selenium.removeAllSelections("theSelect");
			// verifyNotSomethingSelected|theSelect|
			try {selenium.getSelectedIndexes("theSelect");} catch(Throwable e) {}

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
