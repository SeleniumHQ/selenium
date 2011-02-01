package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestDomainCookie extends InternalSelenseTestNgBase {
	@Test public void testDomainCookie() throws Exception {
		String host = selenium.getEval("parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).host;");

    if (!selenium.getExpression(host).matches("^[\\s\\S]*\\.[\\s\\S]*\\.[\\s\\S]*$")) {
      System.out.println("Skipping test: hostname too short: " + host);
      return;
    }

		assertTrue(selenium.getExpression(host).matches("^[\\s\\S]*\\.[\\s\\S]*\\.[\\s\\S]*$"));
		String domain = selenium.getEval("var host = parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).host; host.replace(/^[^\\.]*/, \"\");");
		String base = selenium.getEval("parseUrl(canonicalize(absolutify(\"html\", selenium.browserbot.baseUrl))).pathname;");
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
