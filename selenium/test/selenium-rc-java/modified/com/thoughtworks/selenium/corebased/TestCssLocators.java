package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from C:\svn\selenium-rc\trunk\clients\java\target\selenium-server\tests/TestCssLocators.html.
 */
public class TestCssLocators extends SeleneseTestCase
{
   public void testCssLocators() throws Throwable {
		try {
			

/* Test CSS Locators */

			/* Unimplemented features:            namespace            pseudo element                ::first-line                ::first-letter                ::selection                ::before                ::after            pseudo class including:                :nth-of-type                :nth-last-of-type                :first-of-type                :last-of-type                :only-of-type                :visited                :hover                :active                :focus                :indeterminate */
			// open|../tests/html/test_locators.html|
			selenium.open("/selenium-server/tests/html/test_locators.html");

			/* css2 selector test */

			/* universal selector */

			boolean sawThrow10 = false;
			try {
				// originally verifyElementPresent|css=*|
						assertTrue(selenium.isElementPresent("css=*"));
			}
			catch (Throwable e) {
				sawThrow10 = true;
			}
			verifyFalse(sawThrow10);
			

			/* only element type */
			// verifyText|css=p|this is the first element in the document
			verifyEquals("this is the first element in the document", selenium.getText("css=p"));
			// verifyText|css=a|this is the first element
			verifyEquals("this is the first element", selenium.getText("css=a"));

			/* id selector */
			// verifyText|css=a#id3|this is the third element
			verifyEquals("this is the third element", selenium.getText("css=a#id3"));

			/* attribute selector */

			boolean sawThrow20 = false;
			try {
				// originally verifyElementPresent|css=input[name]|
						assertTrue(selenium.isElementPresent("css=input[name]"));
			}
			catch (Throwable e) {
				sawThrow20 = true;
			}
			verifyFalse(sawThrow20);
			
			// verifyText|css=a[href="#id3"]|this is the third element
			verifyEquals("this is the third element", selenium.getText("css=a[href=\"#id3\"]"));

			boolean sawThrow22 = false;
			try {
				// originally verifyElementNotPresent|css=span[selenium:foo]|
						assertTrue(!selenium.isElementPresent("css=span[selenium:foo]"));
			}
			catch (Throwable e) {
				sawThrow22 = true;
			}
			verifyFalse(sawThrow22);
			
			// verifyText|css=a[class~="class2"]|this is the fifth element
			verifyEquals("this is the fifth element", selenium.getText("css=a[class~=\"class2\"]"));
			// verifyText|css=a[lang|="en"]|this is the sixth element
			verifyEquals("this is the sixth element", selenium.getText("css=a[lang|=\"en\"]"));

			/* class selector */

			boolean sawThrow27 = false;
			try {
				// originally verifyElementPresent|css=a.a1|this is the first element
						assertTrue(selenium.isElementPresent("css=a.a1"));
			}
			catch (Throwable e) {
				sawThrow27 = true;
			}
			verifyFalse(sawThrow27);
			

			/* pseudo class selector */
			// verifyText|css=th:first-child|theHeaderText
			verifyEquals("theHeaderText", selenium.getText("css=th:first-child"));
			// verifyText|css=a:lang(en)|this is the first element
			verifyEquals("this is the first element", selenium.getText("css=a:lang(en)"));
			// verifyText|css=#linkPseudoTest :link|link pseudo test
			verifyEquals("link pseudo test", selenium.getText("css=#linkPseudoTest :link"));

			/* descendant combinator */
			// verifyText|css=div#combinatorTest a|and grandson
			verifyEquals("and grandson", selenium.getText("css=div#combinatorTest a"));

			/* child combinator */
			// verifyText|css=div#combinatorTest &gt; span|this is a child and grandson
			verifyEquals("this is a child and grandson", selenium.getText("css=div#combinatorTest > span"));

			/* preceding combinator */
			// verifyText|css=span#firstChild + span|another child
			verifyEquals("another child", selenium.getText("css=span#firstChild + span"));

			/* css3 selector test */

			/* attribuite test */
			// verifyText|css=a[name^="foo"]|foobar
			verifyEquals("foobar", selenium.getText("css=a[name^=\"foo\"]"));
			// verifyText|css=a[name$="foo"]|barfoo
			verifyEquals("barfoo", selenium.getText("css=a[name$=\"foo\"]"));
			// verifyText|css=a[name*="zoo"]|foozoobar
			verifyEquals("foozoobar", selenium.getText("css=a[name*=\"zoo\"]"));
			// verifyText|css=a[name*="name"][alt]|this is the second element
			verifyEquals("this is the second element", selenium.getText("css=a[name*=\"name\"][alt]"));

			/* pseudo class test */

			boolean sawThrow52 = false;
			try {
				// originally verifyElementPresent|css=html:root|
						assertTrue(selenium.isElementPresent("css=html:root"));
			}
			catch (Throwable e) {
				sawThrow52 = true;
			}
			verifyFalse(sawThrow52);
			
			// verifyText|css=div#structuralPseudo :nth-child(2n)|span2
			verifyEquals("span2", selenium.getText("css=div#structuralPseudo :nth-child(2n)"));
			// verifyText|css=div#structuralPseudo :nth-child(2)|span2
			verifyEquals("span2", selenium.getText("css=div#structuralPseudo :nth-child(2)"));
			// verifyText|css=div#structuralPseudo :nth-child(-n+6)|span1
			verifyEquals("span1", selenium.getText("css=div#structuralPseudo :nth-child(-n+6)"));
			// verifyText|css=div#structuralPseudo :nth-last-child(4n+1)|span4
			verifyEquals("span4", selenium.getText("css=div#structuralPseudo :nth-last-child(4n+1)"));
			// verifyText|css=div#structuralPseudo :nth-last-child(2)|div3
			verifyEquals("div3", selenium.getText("css=div#structuralPseudo :nth-last-child(2)"));
			// verifyText|css=div#structuralPseudo :nth-last-child(-n+6)|span3
			verifyEquals("span3", selenium.getText("css=div#structuralPseudo :nth-last-child(-n+6)"));
			// verifyText|css=div#structuralPseudo :first-child|span1
			verifyEquals("span1", selenium.getText("css=div#structuralPseudo :first-child"));
			// verifyText|css=div#structuralPseudo :last-child|div4
			verifyEquals("div4", selenium.getText("css=div#structuralPseudo :last-child"));
			// verifyText|css=div#onlyChild span:only-child|only child
			verifyEquals("only child", selenium.getText("css=div#onlyChild span:only-child"));

			boolean sawThrow62 = false;
			try {
				// originally verifyElementPresent|css=span:empty|
						assertTrue(selenium.isElementPresent("css=span:empty"));
			}
			catch (Throwable e) {
				sawThrow62 = true;
			}
			verifyFalse(sawThrow62);
			
			// verifyText|css=div#targetTest span:target|target
			verifyEquals("target", selenium.getText("css=div#targetTest span:target"));

			boolean sawThrow64 = false;
			try {
				// originally verifyElementPresent|css=input[type="text"]:enabled|
						assertTrue(selenium.isElementPresent("css=input[type=\"text\"]:enabled"));
			}
			catch (Throwable e) {
				sawThrow64 = true;
			}
			verifyFalse(sawThrow64);
			

			boolean sawThrow65 = false;
			try {
				// originally verifyElementPresent|css=input[type="text"]:disabled|
						assertTrue(selenium.isElementPresent("css=input[type=\"text\"]:disabled"));
			}
			catch (Throwable e) {
				sawThrow65 = true;
			}
			verifyFalse(sawThrow65);
			

			boolean sawThrow66 = false;
			try {
				// originally verifyElementPresent|css=input[type="checkbox"]:checked|
						assertTrue(selenium.isElementPresent("css=input[type=\"checkbox\"]:checked"));
			}
			catch (Throwable e) {
				sawThrow66 = true;
			}
			verifyFalse(sawThrow66);
			
			// verifyText|css=a:contains("zoo")|foozoobar
			verifyEquals("foozoobar", selenium.getText("css=a:contains(\"zoo\")"));
			// verifyText|css=div#structuralPseudo span:not(:first-child)|span2
			verifyEquals("span2", selenium.getText("css=div#structuralPseudo span:not(:first-child)"));
			// verifyText|css=div#structuralPseudo :not(span):not(:last-child)|div1
			verifyEquals("div1", selenium.getText("css=div#structuralPseudo :not(span):not(:last-child)"));

			/* combinator test */
			// verifyText|css=div#combinatorTest span#firstChild ~ span|another child
			verifyEquals("another child", selenium.getText("css=div#combinatorTest span#firstChild ~ span"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
