package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
/**
 * @author Nelson Sproul (nelsons@plumtree.com)
 * based on, but different from, selenium/tests/TestJavascriptParameters.html.
 */
public class TestJavascriptParameters extends SeleneseTestCase
{
	public void test() throws Throwable {
        	try {

/* Test javascript evaluation of parameters       */
		// open|./tests/html/test_store_value.html
		selenium.open("/selenium-server/tests/html/test_store_value.html");
		// type|theText|javascript{[1,2,3,4,5].join(':')}
		selenium.type("theText", selenium.getEval("[1,2,3,4,5].join(':')"));
		// verifyValue|theText|1:2:3:4:5
		verifyEquals("1:2:3:4:5", selenium.getValue("theText"));
		// type|javascript{'the' + 'Text'}|javascript{10 * 5}
		selenium.type(selenium.getEval("'the' + 'Text'"), selenium.getEval("10 * 5"));
		// verifyValue|theText|50
		verifyEquals("50", selenium.getValue("theText"));
		// verifyValue|theText|javascript{10 + 10 + 10 + 10 + 10}
		verifyEquals(selenium.getEval("10 + 10 + 10 + 10 + 10"), selenium.getValue("theText"));

		/* Demonstrate interation between variable substitution and javascript */
		// store|the value|var1
		String var1 = "the value";
		// type|theText|javascript{'${var1}'.toUpperCase()}
		selenium.type("theText", selenium.getEval("'${var1}'.toUpperCase()"));
		// verifyValue|theText|${VAR1}
		verifyEquals("${VAR1}", selenium.getValue("theText"));    // hand translated
		// type|theText|javascript{storedVars['var1'].toUpperCase()}
        selenium.type("theText", selenium.getEval("'" + var1 + "'.toUpperCase()"));
        // verifyValue|theText|THE VALUE
		verifyEquals("THE VALUE", selenium.getValue("theText"));
		
        // verifyExpression|javascript{selenium.getValue('theText')}|regexp:TH[Ee] VALUE
		verifyEquals(selenium.getEval("selenium.getValue('theText')"), "regexp:TH[Ee] VALUE");

		checkForVerificationErrors();
            }
            finally {
            	clearVerificationErrors();
            }
	}
}
