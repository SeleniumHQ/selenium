package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from C:\svn\selenium\rc\trunk\clients\java\target\selenium-server\tests/TestCookie.html.
 */
public class TestCookie extends SeleneseTestCase
{
   public void testCookie() throws Throwable {
		try {
			

/* Test Cookie */
			// storeEval|parseUrl(canonicalize(absolutify("html", selenium.browserbot.baseUrl))).pathname;|base
			String base = "/selenium-server/tests/html";
			// echo|${base}|			: op not meaningful from rc client
			// open|${base}/path1/cookie1.html|
			selenium.open(base + "/path1/cookie1.html");
			// deleteCookie| testCookieWithSameName| /
			selenium.deleteCookie(" testCookieWithSameName", " /");
			// deleteCookie| addedCookieForPath1|${base}/path1/
			selenium.deleteCookie(" addedCookieForPath1", base + "/path1/");
			// assertCookie||
			assertEquals("", selenium.getCookie());
			// open|${base}/path2/cookie2.html|
			selenium.open(base + "/path2/cookie2.html");
			// deleteCookie| testCookieWithSameName| ${base}/path2/
			selenium.deleteCookie(" testCookieWithSameName", " " + base + "/path2/");
			// deleteCookie| addedCookieForPath2| ${base}/path2/
			selenium.deleteCookie(" addedCookieForPath2", " " + base + "/path2/");
			// assertCookie||
			assertEquals("", selenium.getCookie());
			// open|${base}/path1/cookie1.html|
			selenium.open(base + "/path1/cookie1.html");
			// createCookie|addedCookieForPath1=new value1|
			selenium.createCookie("addedCookieForPath1=new value1", "");
			// createCookie|addedCookieForPath2=new value2|path=${base}/path2/, max_age=60
			selenium.createCookie("addedCookieForPath2=new value2", "path=" + base + "/path2/, max_age=60");
			// open|${base}/path1/cookie1.html|
			selenium.open(base + "/path1/cookie1.html");
			// verifyCookie|regex:addedCookieForPath1=new value1|
			verifyEquals("regex:addedCookieForPath1=new value1", selenium.getCookie());
			// verifyNotCookie|regex:testCookie|
			verifyNotEquals("regex:testCookie", selenium.getCookie());
			// verifyNotCookie|regex:addedCookieForPath2|
			verifyNotEquals("regex:addedCookieForPath2", selenium.getCookie());
			// deleteCookie| addedCookieForPath1|${base}/path1/
			selenium.deleteCookie(" addedCookieForPath1", base + "/path1/");
			// verifyCookie||
			verifyEquals("", selenium.getCookie());
			// open|${base}/path2/cookie2.html|
			selenium.open(base + "/path2/cookie2.html");
			// verifyCookie|addedCookieForPath2=new value2|
			verifyEquals("addedCookieForPath2=new value2", selenium.getCookie());
			// verifyNotCookie|regex:addedCookieForPath1|
			verifyNotEquals("regex:addedCookieForPath1", selenium.getCookie());
			// deleteCookie| addedCookieForPath2|${base}/path2/
			selenium.deleteCookie(" addedCookieForPath2", base + "/path2/");
			// verifyCookie||
			verifyEquals("", selenium.getCookie());
			// createCookie|testCookieWithSameName=new value1|path=/
			selenium.createCookie("testCookieWithSameName=new value1", "path=/");
			// createCookie|testCookieWithSameName=new value2|path=${base}/path2/
			selenium.createCookie("testCookieWithSameName=new value2", "path=" + base + "/path2/");
			// open|${base}/path1/cookie1.html|
			selenium.open(base + "/path1/cookie1.html");
			// verifyCookie|testCookieWithSameName=new value1|
			verifyEquals("testCookieWithSameName=new value1", selenium.getCookie());
			// open|${base}/path2/cookie2.html|
			selenium.open(base + "/path2/cookie2.html");
			// verifyCookie|regex:testCookieWithSameName=new value1|
			verifyEquals("regex:testCookieWithSameName=new value1", selenium.getCookie());
			// verifyCookie|regex:testCookieWithSameName=new value2|
			verifyEquals("regex:testCookieWithSameName=new value2", selenium.getCookie());
			// deleteCookie| testCookieWithSameName|${base}/path2/
			selenium.deleteCookie(" testCookieWithSameName", base + "/path2/");
			// open|${base}/path2/cookie2.html|
			selenium.open(base + "/path2/cookie2.html");
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
