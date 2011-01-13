package org.openqa.selenium.v1;

import java.awt.event.KeyEvent;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.Assert;
import org.testng.annotations.Test;

public class TestNativeKeys extends InternalSelenseTestNgBase {
    @Test(dataProvider = "system-properties") public void testKeyPressNative() {
        selenium.open("/selenium-server/tests/html/test_type_page1.html");
        selenium.focus("username");
        selenium.keyPressNative(Integer.toString(KeyEvent.VK_H));
        Assert.assertEquals(selenium.getValue("username"), "h");
    }
}
