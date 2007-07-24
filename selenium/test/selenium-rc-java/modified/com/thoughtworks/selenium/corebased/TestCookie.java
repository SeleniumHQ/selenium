package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestCookie.html.
 */
public class TestCookie extends SeleneseTestCase
{
   public void testCookie() throws Throwable {
		try {
			

/* Test Cookie */
			// open|/path1/cookies|
			selenium.open("/path1/cookies");
			// deleteCookie| testCookieWithSameName| /
			selenium.deleteCookie(" testCookieWithSameName", " /");
			// deleteCookie| addedCookieForPath1| /path1/
			selenium.deleteCookie(" addedCookieForPath1", " /path1/");
			// verifyCookie||
			verifyEquals("", selenium.getCookie());
			// open|/path2/cookies|
			selenium.open("/path2/cookies");
			// deleteCookie| testCookieWithSameName| /path2/
			selenium.deleteCookie(" testCookieWithSameName", " /path2/");
			// deleteCookie| addedCookieForPath2| /path2/
			selenium.deleteCookie(" addedCookieForPath2", " /path2/");
			// verifyCookie||
			verifyEquals("", selenium.getCookie());
			// open|/path1/cookies|
			selenium.open("/path1/cookies");
			// createCookie|addedCookieForPath1=new value1|
			selenium.createCookie("addedCookieForPath1=new value1", "");
			// createCookie|addedCookieForPath2=new value2|path=/path2/, max_age=60
			selenium.createCookie("addedCookieForPath2=new value2", "path=/path2/, max_age=60");
			// open|/path1/cookies|
			selenium.open("/path1/cookies");
			// verifyCookie|regex:addedCookieForPath1=new value1|
			verifyEquals("regex:addedCookieForPath1=new value1", selenium.getCookie());
			// verifyNotCookie|regex:testCookie|
			verifyNotEquals("regex:testCookie", selenium.getCookie());
			// verifyNotCookie|regex:addedCookieForPath2|
			verifyNotEquals("regex:addedCookieForPath2", selenium.getCookie());
			// deleteCookie| addedCookieForPath1| /path1/
			selenium.deleteCookie(" addedCookieForPath1", " /path1/");
			// verifyCookie||
			verifyEquals("", selenium.getCookie());
			// open|/path2/cookies|
			selenium.open("/path2/cookies");
			// verifyCookie|addedCookieForPath2=new value2|
			verifyEquals("addedCookieForPath2=new value2", selenium.getCookie());
			// verifyNotCookie|regex:addedCookieForPath1|
			verifyNotEquals("regex:addedCookieForPath1", selenium.getCookie());
			// deleteCookie| addedCookieForPath2| /path2/
			selenium.deleteCookie(" addedCookieForPath2", " /path2/");
			// verifyCookie||
			verifyEquals("", selenium.getCookie());
			// createCookie|testCookieWithSameName=new value1|path=/
			selenium.createCookie("testCookieWithSameName=new value1", "path=/");
			// createCookie|testCookieWithSameName=new value2|path=/path2/
			selenium.createCookie("testCookieWithSameName=new value2", "path=/path2/");
			// open|/path1/cookies|
			selenium.open("/path1/cookies");
			// verifyCookie|testCookieWithSameName=new value1|
			verifyEquals("testCookieWithSameName=new value1", selenium.getCookie());
			// open|/path2/cookies|
			selenium.open("/path2/cookies");
			// verifyCookie|regex:testCookieWithSameName=new value1|
			verifyEquals("regex:testCookieWithSameName=new value1", selenium.getCookie());
			// verifyCookie|regex:testCookieWithSameName=new value2|
			verifyEquals("regex:testCookieWithSameName=new value2", selenium.getCookie());
			// deleteCookie| testCookieWithSameName| /path2/
			selenium.deleteCookie(" testCookieWithSameName", " /path2/");
			// open|/path2/cookies|
			selenium.open("/path2/cookies");
			// verifyCookie|testCookieWithSameName=new value1|
			verifyEquals("testCookieWithSameName=new value1", selenium.getCookie());
			// verifyNotCookie|regex:testCookieWithSameName=new value2|
			verifyNotEquals("regex:testCookieWithSameName=new value2", selenium.getCookie());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
