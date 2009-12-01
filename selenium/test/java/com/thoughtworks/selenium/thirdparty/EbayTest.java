package com.thoughtworks.selenium.thirdparty;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class EbayTest extends SeleneseTestNgHelper {
    
    @Test
    public void testEbayOpen() throws Throwable {
        // interesting because they use frames served by different domains.  Injected JavaScript
        // which tries to cross frames will be revealed with permission denied errors.
        
        // also there is the unresolved bug for proxy injection mode described by 
        // http://jira.openqa.org/browse/SRC-101
        selenium.open("http://www.ebay.com");
    
        // seem to be seeing the same problem with Yahoo
        selenium.open("http://www.yahoo.com");
    }    
}
