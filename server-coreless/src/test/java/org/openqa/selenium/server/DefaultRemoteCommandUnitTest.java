package org.openqa.selenium.server;

import junit.framework.TestCase;

public class DefaultRemoteCommandUnitTest extends TestCase {

    public DefaultRemoteCommandUnitTest(String name) {
        super(name);
    }

    public void testParseNoJs() {
        DefaultRemoteCommand drc = new DefaultRemoteCommand("foo", "bar", "baz");
        RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
        assertEquals(drc, parsed);
    }
    
    public void testParsePiggyBackedJs() {
        DefaultRemoteCommand drc = new DefaultRemoteCommand("foo", "bar", "baz", "2+2");
        RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
        assertEquals(drc, parsed);
    }
    
    public void testEvil() {
        DefaultRemoteCommand drc = new DefaultRemoteCommand("\\\"\'\b\n\r\f\t\u2000", "bar", "baz");
        RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
        assertEquals(drc, parsed);
    }
    
    public void testUnicode() {
        RemoteCommand parsed = DefaultRemoteCommand.parse("json={command:\"\\u2000\",target:\"bar\",value:\"baz\"}");
        DefaultRemoteCommand drc = new DefaultRemoteCommand("\u2000", "bar", "baz");
        assertEquals(drc, parsed);
    }
    
    public void testBlankStringNoJs() {
        DefaultRemoteCommand drc = new DefaultRemoteCommand("", "", "");
        RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
        assertEquals(drc, parsed);
    }
    
    public void testBlankStringPiggyBackedJs() {
        DefaultRemoteCommand drc = new DefaultRemoteCommand("", "", "", "");
        RemoteCommand parsed = DefaultRemoteCommand.parse(drc.toString());
        assertEquals(drc, parsed);
    }

    public void testEqualReturnsFalseWhenComparedWithNull() {
        assertFalse(new DefaultRemoteCommand("", "", "").equals(null));
    }

    public void testEqualReturnsFalseWhenCommandsDoNotMatch() {
        assertFalse(
            new DefaultRemoteCommand("a command", "", "").equals(
            new DefaultRemoteCommand("another command", "", "")
        ));
    }

    public void testEqualReturnsFalseWhenFieldsDoNotMatch() {
        assertFalse(
            new DefaultRemoteCommand("", "a field", "").equals(
            new DefaultRemoteCommand("", "another field", "")
        ));
    }

    public void testEqualReturnsFalseWhenValuesDoNotMatch() {
        assertFalse(
            new DefaultRemoteCommand("", "", "a value").equals(
            new DefaultRemoteCommand("", "", "another value")
        ));
    }

    public void testEqualReturnsTrueWhenCommandsFieldsAndValuesDoMatch() {
        assertEquals(
            new DefaultRemoteCommand("a command", "a field", "a value"),
            new DefaultRemoteCommand("a command", "a field", "a value")
        );
    }

    public void testHascodeIsDifferentWhenCommandsDoNotMatch() {
        assertNotSame(new DefaultRemoteCommand("a command", "", "").hashCode(), new DefaultRemoteCommand("another command", "", "").hashCode());
    }

    public void testHascodeIsDifferentWhenFieldsDoNotMatch() {
        assertNotSame(new DefaultRemoteCommand("", "a field", "").hashCode(), new DefaultRemoteCommand("", "another field", "").hashCode());
    }

    public void testHascodeIsDifferentWhenValuesDoNotMatch() {
        assertNotSame(new DefaultRemoteCommand("", "", "a value").hashCode(), new DefaultRemoteCommand("", "", "another value").hashCode());
    }

    public void testHascodeIsIdenticalWhenCommandsFieldsAndValuesDoMatch() {
        assertEquals(
            new DefaultRemoteCommand("a command", "a field", "a value").hashCode(),
            new DefaultRemoteCommand("a command", "a field", "a value").hashCode()
        );
    }


}
