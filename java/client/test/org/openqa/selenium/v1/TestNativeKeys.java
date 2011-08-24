package org.openqa.selenium.v1;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.testng.Assert;
import org.testng.annotations.Test;

import java.awt.event.KeyEvent;

public class TestNativeKeys extends InternalSelenseTestBase {
  @Test(dataProvider = "system-properties")
  public void testKeyPressNative() {
    selenium.open("/selenium-server/tests/html/test_type_page1.html");
    selenium.focus("username");
    selenium.keyPressNative(Integer.toString(KeyEvent.VK_H));
    Assert.assertEquals(selenium.getValue("username"), "h");
  }
}
