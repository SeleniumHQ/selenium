package org.openqa.selenium.thirdparty;

import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class DollarRentACarTest extends SeleneseTestNgHelper {
    public static String TIMEOUT = "120000";
    @Test
    public void searchAndRent() throws InterruptedException {
        selenium.open("http://www.dollar.com/default.aspx?AspxAutoDetectCookieSupport=1");
        selenium.type("ctl05_ctl01_ResStartColumnLayout_LocationTime_PickupLocationTextBox", "PDX");
        selenium.select("ctl05_ctl01_ResStartColumnLayout_LocationTime_CarTypeDropDownList", "label=Compact");
        selenium.click("ctl05_ctl01_ResStartColumnLayout_LocationTime_GetRatesButton");
        selenium.waitForPageToLoad(TIMEOUT);
        selenium.click("ctl04_ctl03_VehicleInformationColumnLayout_GoButton");
        selenium.waitForPageToLoad(TIMEOUT);
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
    }
}
