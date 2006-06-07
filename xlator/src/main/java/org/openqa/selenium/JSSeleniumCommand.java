/*
 * Created on Jun 7, 2006
 *
 */
package org.openqa.selenium;

import org.mozilla.javascript.*;

/** @deprecated not actually using this any more */
public class JSSeleniumCommand extends ScriptableObject {

    String command;
    String target;
    String value;
    public JSSeleniumCommand() {}
    
    public JSSeleniumCommand(String command, String target, String value) {
        this.command = command;
        this.target = target;
        this.value = value;
    }
    
    public void jsConstructor(String command, String target, String value) {
        this.command = command;
        this.target = target;
        this.value = value;
    }
    
    public String getClassName() {
        return JSSeleniumCommand.class.getName();
    }
    
    public String jsGet_command() { return command; }
    public String jsGet_target() { return target; }
    public String jsGet_value() { return value; }
    public String jsGet_type() { return "command"; }

    public String jsFunction_getAccessor() { return null; }
}
