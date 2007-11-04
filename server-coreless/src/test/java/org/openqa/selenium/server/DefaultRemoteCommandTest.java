package org.openqa.selenium.server;

import junit.framework.TestCase;

public class DefaultRemoteCommandTest extends TestCase {

    public DefaultRemoteCommandTest(String name) {
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
    
}
