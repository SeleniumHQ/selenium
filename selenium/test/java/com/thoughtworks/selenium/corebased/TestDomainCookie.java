package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestDomainCookie extends SeleneseTestNgHelper {
	@Test public void testDomainCookie() throws Exception {
		String host = selenium.getEval("parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).host;");
		System.out.println(host);
		assertTrue(selenium.getExpression(host).matches("^[\\s\\S]*\\.[\\s\\S]*\\.[\\s\\S]*$"));
		String domain = selenium.getEval("var host = parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).host; host.replace(/^[^\\.]*/, \"\");");
		System.out.println(domain);
		String base = selenium.getEval("parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).pathname;");
		System.out.println(base);
		selenium.open(base + "/path1/cookie1.html");
		selenium.deleteCookie("testCookieWithSameName", "path=/");
		selenium.deleteCookie("addedCookieForPath1", "path=" + base + "/path1/");
		selenium.deleteCookie("domainCookie", "domain=" + domain + "; path=/");
		assertEquals(selenium.getCookie(), "");
		selenium.open(base + "/path1/cookie1.html");
		selenium.createCookie("domainCookie=domain value", "domain=" + domain + "; path=/");
		assertEquals(selenium.getCookieByName("domainCookie"), "domain value");
		selenium.deleteCookie("domainCookie", "domain=" + domain + "; path=/");
		assertFalse(selenium.isCookiePresent("domainCookie"));
		assertEquals(selenium.getCookie(), "");
	}
}
