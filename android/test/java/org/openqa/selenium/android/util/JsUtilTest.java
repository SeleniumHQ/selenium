package org.openqa.selenium.android.util;

import junit.framework.TestCase;

import org.junit.Test;

public class JsUtilTest extends TestCase {

  @Test
  public void testShouldConvertBooleanToJsObject() {
    boolean isTrue = true;
    Boolean objIsFalse = new Boolean(false);
    assertEquals("\"true\"", JsUtil.convertArgumentToJsObject(isTrue));
    assertEquals("\"false\"", JsUtil.convertArgumentToJsObject(objIsFalse));
  }

  @Test
  public void testShouldConvertNumberToJsObject() {
    int anInt = 0;
    long aLong = 10;
    Double aDouble = new Double(0.1);
    Number aFloat = 0.3f;
    assertEquals("\"0\"", JsUtil.convertArgumentToJsObject(anInt));
    assertEquals("\"10\"", JsUtil.convertArgumentToJsObject(aLong));
    assertEquals("\"0.1\"", JsUtil.convertArgumentToJsObject(aDouble));
    assertEquals("\"0.3\"", JsUtil.convertArgumentToJsObject(aFloat));
  }

  @Test
  public void testShouldConvertStringToJsObject() {
    String aString = "My simple string";
    String stringObj = new String();
    assertEquals("\"My simple string\"", JsUtil.convertArgumentToJsObject(aString));
    assertEquals("\"\"", JsUtil.convertArgumentToJsObject(stringObj));
  }
  
  @Test
  public void testShouldThrowIllegalArgumentException() {
    Object obj = new Object();
    try {
      JsUtil.convertArgumentToJsObject(obj);
      fail("Expected IllegalArgumentException");
    } catch (IllegalArgumentException e) {
      // Do nothing, this is expected.
    }
  }
  
  @Test
  public void testShouldAddEscapedDoubleQuotesToSingleQuotedString() {
    assertEquals("\"f'oo\"", JsUtil.escapeQuotes("f'oo"));
  }
  
  @Test
  public void testShouldAddSingleQuotesToDoubleQuotedString() {
    assertEquals("'f\"oo'", JsUtil.escapeQuotes("f\"oo"));
  }
  
  @Test
  public void testShouldConvertSingleAndDoubleQuotedStringIntoConcatenatedStrings() {
    assertEquals("\"f\" + '\"' + \"o'o\"", JsUtil.escapeQuotes("f\"o'o"));
    assertEquals("\"'\" + '\"'", JsUtil.escapeQuotes("'\""));
  }

  @Test
  public void testShouldAddEscapedDoubleQuotesToUnquotedString() {
    assertEquals("\"foo\"", JsUtil.escapeQuotes("foo"));
  }
}
