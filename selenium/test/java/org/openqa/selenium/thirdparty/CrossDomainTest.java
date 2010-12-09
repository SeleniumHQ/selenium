package org.openqa.selenium.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class CrossDomainTest extends InternalSelenseTestNgBase {
    @Test
    public void crossDomain() {
        selenium.open("http://www.yahoo.com");
        selenium.open("http://www.google.com");
        selenium.open("http://www.msn.com");
    }
}
