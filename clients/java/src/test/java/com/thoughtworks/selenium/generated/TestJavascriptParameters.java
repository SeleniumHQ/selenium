package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestJavascriptParameters.html.
 */
public class TestJavascriptParameters extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test javascript evaluation of parameters*", "info");
  
/* Test javascript evaluation of parameters       */
			// open|./tests/html/test_store_value.html
			selenium.open("./tests/html/test_store_value.html");
			// type|theText|javascript{[1,2,3,4,5].join(':')}
			selenium.type("theText", selenium.getEval(""javascript{[1,2,3,4,5].join(':')}""));
			// verifyValue|theText|1:2:3:4:5
			verifyEquals("1:2:3:4:5", selenium.getValue("theText"));
			// type|javascript{'the' + 'Text'}|javascript{10 * 5}
			selenium.type(selenium.getEval(""javascript{'the' + 'Text'}""), selenium.getEval(""javascript{10 * 5}""));
			// verifyValue|theText|50
			verifyEquals("50", selenium.getValue("theText"));
			// verifyValue|theText|javascript{10 + 10 + 10 + 10 + 10}
			verifyEquals(selenium.getEval(""javascript{10 + 10 + 10 + 10 + 10}""), selenium.getValue("theText"));

		/* Demonstrate interation between variable substitution and javascript */
			// store|the value|var1
			String var1 = "the value";
			// type|theText|javascript{'${var1}'.toUpperCase()}
			selenium.type("theText", selenium.getEval(""javascript{'" + var1 + "'.toUpperCase()}""));
			// verifyValue|theText|${VAR1}
			verifyEquals(VAR1, selenium.getValue("theText"));
			// type|theText|javascript{storedVars['var1'].toUpperCase()}
			selenium.type("theText", selenium.getEval(var1 + ".toUpperCase()"));
			// verifyValue|theText|THE VALUE
			verifyEquals("THE VALUE", selenium.getValue("theText"));
			// verifyExpression|javascript{storedVars['var1'].toUpperCase()}|THE VALUE
			verifyEquals(selenium.getEval(var1 + ".toUpperCase()"), "THE VALUE");
			// verifyExpression|javascript{selenium.getValue('theText')}|regexp:TH[Ee] VALUE
			verifyEquals(selenium.getEval(""javascript{selenium.getValue('theText')}""), "regexp:TH[Ee] VALUE");

		checkForVerificationErrors();
	}
}
