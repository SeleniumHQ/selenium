package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestStore.html.
 */
public class TestStore extends SeleneseTestCase
{
   public void testStore() throws Throwable {
		try {
			

/* Test store and variations */
			// open|../tests/html/test_verifications.html|
			selenium.open("/selenium-server/tests/html/test_verifications.html");
			// storeValue|theHidden|storedHiddenValue
			String storedHiddenValue = selenium.getValue("theHidden");
			// storeText|theSpan|storedSpanText
			String storedSpanText = selenium.getText("theSpan");
			// storeAttribute|theText@class|storedTextClass
			String storedTextClass = selenium.getAttribute("theText@class");
			// storeTitle|storedTitle|
			String storedTitle = selenium.getTitle();
			// store|PLAIN TEXT|textVariable
			String textVariable = "PLAIN TEXT";

			/* The expression for the 2nd parm used to be: javascript{'javascript' + 'Variable'}      For me to support this kind of thing, I would need to save "stored" variables in a       hash, since the names wouldn't be known at compile time.  I think this is not the      best translation; surely test writers will prefer that new variables in the native      language be instantiated.  So I'm changing the expression to a literal:  -ns */
			// store|javascript{'Pi ~= ' +                     (Math.round(Math.PI * 100) / 100)}|javascriptVariable
			String javascriptVariable = selenium.getEval("'Pi ~= ' +                     (Math.round(Math.PI * 100) / 100)");
			// open|../tests/html/test_store_value.html
			selenium.open("/selenium-server/tests/html/test_store_value.html");
			// type|theText|${storedHiddenValue}
			selenium.type("theText", storedHiddenValue);
			// verifyValue|theText|the hidden value
			verifyEquals("the hidden value", selenium.getValue("theText"));
			// type|theText|${storedSpanText}
			selenium.type("theText", storedSpanText);
			// verifyValue|theText|this is the span
			verifyEquals("this is the span", selenium.getValue("theText"));
			// type|theText|${storedTextClass}
			selenium.type("theText", storedTextClass);
			// verifyValue|theText|foo
			verifyEquals("foo", selenium.getValue("theText"));
			// type|theText|${textVariable}
			selenium.type("theText", textVariable);
			// verifyValue|theText|PLAIN TEXT
			verifyEquals("PLAIN TEXT", selenium.getValue("theText"));
			// type|theText|${javascriptVariable}
			selenium.type("theText", javascriptVariable);
			// verifyValue|theText|Pi ~= 3.14
			verifyEquals("Pi ~= 3.14", selenium.getValue("theText"));
			// type|theText|${storedTitle}
			selenium.type("theText", storedTitle);
			// verifyValue|theText|theTitle
			verifyEquals("theTitle", selenium.getValue("theText"));

			/* Test multiple output variables in a single expression */
			// type|theText|'${storedHiddenValue}'_'${storedSpanText}'
			selenium.type("theText", "'" + storedHiddenValue + "'_'" + storedSpanText + "'");
			// verifyValue|theText|'the hidden value'_'this is the span'
			verifyEquals("'the hidden value'_'this is the span'", selenium.getValue("theText"));

			/* backward compatibility */
			// open|../tests/html/test_just_text.html|
			selenium.open("/selenium-server/tests/html/test_just_text.html");

			/* This new command should replace the old usage of storeValue */
			// storeBodyText|storedBodyText|
			String storedBodyText = this.getText();
			// open|../tests/html/test_store_value.html
			selenium.open("/selenium-server/tests/html/test_store_value.html");
			// verifyValue|theText|
			verifyEquals("", selenium.getValue("theText"));
			// type|theText|${storedBodyText}
			selenium.type("theText", storedBodyText);
			// verifyValue|theText|This is the entire text of the page.
			verifyEquals("This is the entire text of the page.", selenium.getValue("theText"));
			// verifyExpression|${storedBodyText}|This is the entire text of the page.
			verifyEquals(storedBodyText, "This is the entire text of the page.");

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
