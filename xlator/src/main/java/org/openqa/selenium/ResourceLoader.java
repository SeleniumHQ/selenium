/*
 * Created on Jun 7, 2006
 *
 */
package org.openqa.selenium;

import java.io.*;

import org.mozilla.javascript.*;

public class ResourceLoader {

    Context cx;
    Scriptable scope;
    
    public ResourceLoader(Context cx, Scriptable scope) {
        this.cx = cx;
        this.scope = scope;
    }
    
    public Object evalResource(String resourceName) throws IOException {
        String source = Xlator.loadResource(resourceName);
        return cx.evaluateString(scope, source, resourceName, 1, null);
    }


}
