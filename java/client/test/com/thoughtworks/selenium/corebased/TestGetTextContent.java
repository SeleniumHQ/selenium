package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

import static org.openqa.selenium.testing.drivers.BackedBy.*;
import static org.openqa.selenium.testing.drivers.Browser.*;

public class TestGetTextContent extends InternalSelenseTestBase {
  @Test
  public void testGetTextContent() throws Exception {
    selenium.open("../tests/html/test_gettextcontent.html");
    verifyTrue(selenium.isTextPresent("Text1"));

    if (!is(rc, ie)) {  // TODO(simon): Fix this lameness.
      verifyFalse(selenium.isTextPresent("Text2"));
      verifyFalse(selenium.isTextPresent("Text3"));
      verifyFalse(selenium.isTextPresent("Text4"));
      verifyFalse(selenium.isTextPresent("Text5"));
      verifyFalse(selenium.isTextPresent("Text6"));
      verifyFalse(selenium.isTextPresent("Text7"));
      verifyFalse(selenium.isTextPresent("Text8"));
    }
  }
}
