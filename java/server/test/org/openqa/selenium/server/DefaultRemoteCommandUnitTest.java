/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotSame;

import org.junit.Test;

public class DefaultRemoteCommandUnitTest {

  @Test
  public void testParseNoJs() {
    DefaultRemoteCommand drc = new DefaultRemoteCommand("foo", "bar", "baz");
    RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
    assertEquals(drc, parsed);
  }

  @Test
  public void testParsePiggyBackedJs() {
    DefaultRemoteCommand drc = new DefaultRemoteCommand("foo", "bar", "baz", "2+2");
    RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
    assertEquals(drc, parsed);
  }

  @Test
  public void testEvil() {
    DefaultRemoteCommand drc = new DefaultRemoteCommand("\\\"\'\b\n\r\f\t\u2000", "bar", "baz");
    RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
    assertEquals(drc, parsed);
  }

  @Test
  public void testUnicode() {
    RemoteCommand parsed =
        DefaultRemoteCommand.parse("json={command:\"\\u2000\",target:\"bar\",value:\"baz\"}");
    DefaultRemoteCommand drc = new DefaultRemoteCommand("\u2000", "bar", "baz");
    assertEquals(drc, parsed);
  }

  @Test
  public void testBlankStringNoJs() {
    DefaultRemoteCommand drc = new DefaultRemoteCommand("", "", "");
    RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
    assertEquals(drc, parsed);
  }

  @Test
  public void testBlankStringPiggyBackedJs() {
    DefaultRemoteCommand drc = new DefaultRemoteCommand("", "", "", "");
    RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
    assertEquals(drc, parsed);
  }

  @Test
  public void testEqualReturnsFalseWhenComparedWithNull() {
    assertFalse(new DefaultRemoteCommand("", "", "").equals(null));
  }

  @Test
  public void testEqualReturnsFalseWhenCommandsDoNotMatch() {
    assertFalse(new DefaultRemoteCommand("a command", "", "").equals(
        new DefaultRemoteCommand("another command", "", "")
        ));
  }

  @Test
  public void testEqualReturnsFalseWhenFieldsDoNotMatch() {
    assertFalse(new DefaultRemoteCommand("", "a field", "").equals(
        new DefaultRemoteCommand("", "another field", "")
        ));
  }

  @Test
  public void testEqualReturnsFalseWhenValuesDoNotMatch() {
    assertFalse(new DefaultRemoteCommand("", "", "a value").equals(
        new DefaultRemoteCommand("", "", "another value")
        ));
  }

  @Test
  public void testEqualReturnsTrueWhenCommandsFieldsAndValuesDoMatch() {
    assertEquals(
        new DefaultRemoteCommand("a command", "a field", "a value"),
        new DefaultRemoteCommand("a command", "a field", "a value"));
  }

  @Test
  public void testHascodeIsDifferentWhenCommandsDoNotMatch() {
    assertNotSame(new DefaultRemoteCommand("a command", "", "").hashCode(),
        new DefaultRemoteCommand("another command", "", "").hashCode());
  }

  @Test
  public void testHascodeIsDifferentWhenFieldsDoNotMatch() {
    assertNotSame(new DefaultRemoteCommand("", "a field", "").hashCode(), new DefaultRemoteCommand(
        "", "another field", "").hashCode());
  }

  @Test
  public void testHascodeIsDifferentWhenValuesDoNotMatch() {
    assertNotSame(new DefaultRemoteCommand("", "", "a value").hashCode(), new DefaultRemoteCommand(
        "", "", "another value").hashCode());
  }

  @Test
  public void testHascodeIsIdenticalWhenCommandsFieldsAndValuesDoMatch() {
    assertEquals(
        new DefaultRemoteCommand("a command", "a field", "a value").hashCode(),
        new DefaultRemoteCommand("a command", "a field", "a value").hashCode());
  }
}
