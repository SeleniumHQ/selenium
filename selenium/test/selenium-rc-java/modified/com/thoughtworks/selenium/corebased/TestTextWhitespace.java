package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestTextWhitespace.html.
 */
public class TestTextWhitespace extends SeleneseTestCase
{
   public void testTextWhitespace() throws Throwable {
		try {
			

/* Test Text Content */
			// open|../tests/html/test_text_content.html|
			selenium.open("/selenium-server/tests/html/test_text_content.html");
			
			// verifyText|nonTextMarkup|      There is non-visible and visible markup here that doesn't change the text content
//			verifyEquals("      There is non-visible and visible markup here that doesn't change the text content", selenium.getText("nonTextMarkup"));

			/* Match exactly the same space characters */
			// verifyText|spaces|exact:1 space|2  space|3   space|1nbsp|2nbsp|3nbsp|2 space_nbsp|2 nbsp_space|3  space_nbsp_space|3 nbsp_space_nbsp
//			verifyEquals("exact:1 space|2  space|3   space|1nbsp|2nbsp|3nbsp|2 space_nbsp|2 nbsp_space|3  space_nbsp_space|3 nbsp_space_nbsp", selenium.getText("spaces"));
			// verifyText|tabcharacter|tab character between
			verifyEquals("tab character between", selenium.getText("tabcharacter"));
			// verifyText|nonVisibleNewlines|non visible newlines between
			verifyEquals("non visible newlines between", selenium.getText("nonVisibleNewlines"));
			// verifyText|visibleNewlines|regexp:visible\\s*newlines\\s*between
			verifyEquals("regexp:visible\\s*newlines\\s*between", selenium.getText("visibleNewlines"));
			// verifyNotText|visibleNewlines|visible newlines between
			verifyNotEquals("visible newlines between", selenium.getText("visibleNewlines"));
			// verifyText|paragraphs|First paragraph*Second paragraph
			verifyEquals("First paragraph*Second paragraph", selenium.getText("paragraphs"));
			// verifyNotText|paragraphs|First paragraph Second paragraph
			verifyNotEquals("First paragraph Second paragraph", selenium.getText("paragraphs"));
			// verifyText|preformatted|preformatted*newline
			System.err.println("Preformatted: '" + selenium.getText("preformatted") + "'");
			verifyEquals("preformatted*newline", selenium.getText("preformatted"));
			// verifyNotText|preformatted|preformatted newline
			verifyNotEquals("preformatted newline", selenium.getText("preformatted"));
			// verifyText|mixedMarkup|visible*newlines and markup and non-visible newlines and markup*With*a paragraph*and*pre*formatted*text
			verifyEquals("visible*newlines and markup and non-visible newlines and markup*With*a paragraph*and*pre*formatted*text", selenium.getText("mixedMarkup"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
