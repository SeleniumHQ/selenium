package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;

import com.googlecode.webdriver.environment.GlobalTestEnvironment;
import com.googlecode.webdriver.environment.TestEnvironment;

import junit.framework.TestCase;

public class AbstractDriverTestCase extends TestCase implements NeedsDriver {
	protected WebDriver driver;
	protected String hostName;
	protected String alternateHostName;
	protected String baseUrl;
	protected String alternateBaseUrl;
	protected String simpleTestPage;
	protected String xhtmlTestPage;
	protected String formPage;
	protected String metaRedirectPage;
	protected String redirectPage;
	protected String javascriptPage;
	protected String framesetPage;
	protected String iframePage;
	protected String dragAndDropPage;
	protected String chinesePage;
	protected String nestedPage;
	
	public void setDriver(WebDriver driver) {
		this.driver = driver;
	}
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
        driver.setVisible(true);

        TestEnvironment environment = GlobalTestEnvironment.get();
        
        baseUrl = environment.getAppServer().getBaseUrl();
        simpleTestPage = baseUrl + "simpleTest.html";
        xhtmlTestPage = baseUrl + "xhtmlTest.html";
        formPage = baseUrl + "formPage.html";
        metaRedirectPage = baseUrl + "meta-redirect.html";
        redirectPage = baseUrl + "redirect";
        javascriptPage = baseUrl + "javascriptPage.html";
        framesetPage = baseUrl + "frameset.html";
        iframePage = baseUrl + "iframes.html";
        dragAndDropPage = baseUrl + "dragAndDropTest.html";
        chinesePage = baseUrl + "cn-test.html";
        nestedPage = baseUrl + "nestedElements.html";
        
        hostName = environment.getAppServer().getHostName();
        alternateHostName = environment.getAppServer().getAlternateHostName();
        alternateBaseUrl = environment.getAppServer().getAlternateBaseUrl();

        assertThat(hostName, is(not(equalTo(alternateHostName))));
	}
}
