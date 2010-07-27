package com.thoughtworks.selenium.corebased;

import java.util.regex.Pattern;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestCookie extends SeleneseTestNgHelper {
	@Test public void testCookie() throws Exception {
		String base = selenium.getEval("parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).pathname;");
		System.out.println(base);
		selenium.open(base + "/path1/cookie1.html");
		selenium.deleteAllVisibleCookies();
		assertEquals(selenium.getCookie(), "");
		selenium.open(base + "/path2/cookie2.html");
		selenium.deleteAllVisibleCookies();
		assertEquals(selenium.getCookie(), "");
		selenium.open(base + "/path1/cookie1.html");
		selenium.createCookie("addedCookieForPath1=new value1", "");
		selenium.createCookie("addedCookieForPath2=new value2", "path=" + base + "/path2/, max_age=60");
		selenium.open(base + "/path1/cookie1.html");
		verifyTrue(Pattern.compile("addedCookieForPath1=new value1").matcher(selenium.getCookie()).find());
		assertTrue(selenium.isCookiePresent("addedCookieForPath1"));
		verifyEquals(selenium.getCookieByName("addedCookieForPath1"), "new value1");
		verifyFalse(selenium.isCookiePresent("testCookie"));
		verifyFalse(selenium.isCookiePresent("addedCookieForPath2"));
		selenium.deleteCookie("addedCookieForPath1", base + "/path1/");
		verifyEquals(selenium.getCookie(), "");
		selenium.open(base + "/path2/cookie2.html");
		verifyEquals(selenium.getCookieByName("addedCookieForPath2"), "new value2");
		verifyFalse(selenium.isCookiePresent("addedCookieForPath1"));
		selenium.deleteCookie("addedCookieForPath2", base + "/path2/");
		verifyEquals(selenium.getCookie(), "");
		selenium.createCookie("testCookieWithSameName=new value1", "path=/");
		selenium.createCookie("testCookieWithSameName=new value2", "path=" + base + "/path2/");
		selenium.open(base + "/path1/cookie1.html");
		verifyEquals(selenium.getCookieByName("testCookieWithSameName"), "new value1");
		selenium.open(base + "/path2/cookie2.html");
		verifyTrue(Pattern.compile("testCookieWithSameName=new value1").matcher(selenium.getCookie()).find());
		verifyTrue(Pattern.compile("testCookieWithSameName=new value2").matcher(selenium.getCookie()).find());
		selenium.deleteCookie("testCookieWithSameName", base + "/path2/");
		selenium.open(base + "/path2/cookie2.html");
		verifyEquals(selenium.getCookieByName("testCookieWithSameName"), "new value1");
		verifyFalse(Pattern.compile("testCookieWithSameName=new value2").matcher(selenium.getCookie()).find());
	}
}
