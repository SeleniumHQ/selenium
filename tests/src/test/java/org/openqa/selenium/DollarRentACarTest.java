package org.openqa.selenium;

import static org.testng.Assert.assertTrue;
import org.testng.annotations.Test;

public class DollarRentACarTest extends AbstractTest {
    @Test
    public void searchAndRent() {
        try {
            selenium.open("http://www.dollar.com/default.aspx?AspxAutoDetectCookieSupport=1");
            selenium.type("ctl04_ctl01_ResStartColumnLayout_LocationTime_PickupLocationTextBox", "PDX");
            selenium.select("ctl04_ctl01_ResStartColumnLayout_LocationTime_CarTypeDropDownList", "label=Intermediate");
            selenium.click("ctl04_ctl01_ResStartColumnLayout_LocationTime_GetRatesButton");
            selenium.waitForPageToLoad("30000");
            selenium.click("ctl04_ctl03_VehicleInformationColumnLayout_GoButton");
            selenium.waitForPageToLoad("30000");
            selenium.select("ctl04_ctl03_PersonalInformationColumnLayout_OptionsColumnLayout_LoyaltyProgramList", "label=Virgin Atlantic Flying Club");
            selenium.click("ctl04_ctl03_PersonalInformationColumnLayout_ReserveNowSitecoreImageButton");
            for (int second = 0; ; second++) {
                if (second >= 60) fail("timeout");
                try {
                    if (selenium.isTextPresent("Please enter your first name")) break;
                } catch (Exception e) {
                }
                Thread.sleep(1000);
            }

            assertTrue(selenium.isTextPresent("Please enter your first name"));
            assertTrue(selenium.isTextPresent("Please enter a valid email address"));
        } catch (Throwable t) {
            fail("DollarRentACarTest.searchAndRent", t);
        }

        pass("DollarRentACarTest.searchAndRent");
    }
}
