package org.openqa.selenium.v1.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.testng.annotations.Test;

public class CrossDomainTest extends InternalSelenseTestBase {
    @Test(dataProvider = "system-properties")
    public void crossDomain() {
        selenium.open("http://www.yahoo.com");
        selenium.open("http://www.google.com");
        selenium.open("http://www.msn.com");
    }
}
