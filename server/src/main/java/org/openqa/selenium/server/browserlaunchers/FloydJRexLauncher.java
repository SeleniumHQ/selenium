package org.openqa.selenium.server.browserlaunchers;

import floyd.jrex.JRexBrowser;
import netscape.javascript.JSObject;

/**
 * To effectively use the Floyd JRex browser launcher, two system properties must be supplied when launching
 * the Selenium Server:
 *
 * <ol>
 * <li><b>java.library.path</b>: the path containing JRex native binaries.</li>
 * <li><b>jrex.gre.path</b>: the path to the Gecko Runtime Environment.</li>
 * </ol>
 *
 * <p/>
 * You can both of these items on the <a href="http://jrex.mozdev.org/releases.html">JRex releases page</a>. The GRE is
 * packaged in an odd way: a zipped up directory, which contains the actual GRE, is contained inside of the downloadable
 * jar.
 *
 * <p/>
 * <b>Example</b>: -Djava.library.path=C:\jrex\jrex-bin-nolog-1.0b1_dom3 -Djrex.gre.path=C:\jrex\jrex_gre
 *
 * <p/>
 * <b>Note:</b> If you are using the JDK JRE (rather than the normal JRE), you may also be required to include jawt.dll
 * in your java.library.path (you can just add it to the JRex binaries directory). This file can be found in your JRE
 * directory.
 */
public class FloydJRexLauncher extends FloydBrowserLauncher {
    public FloydJRexLauncher(int port, String sessionId) {
        super(new JRexBrowser());
    }

    protected String parseResult(Object o) {
        if (o == null) {
            return "OK";
        }

        JSObject jsObj = (JSObject) o;
        String result = null;
        Object passedMember = jsObj.getMember("passed");
        boolean passed = passedMember == null || "true".equals(passedMember);
        if (passed) {
            Object resultObj = jsObj.getMember("result");
            if (resultObj != null) {
                result = resultObj.toString();
            }
        } else {
            Object failureObj = jsObj.getMember("failureMessage");
            if (failureObj != null) {
                result = failureObj.toString();
            }
        }

        if (passed && result == null) {
            return "OK";
        } else if (passed) {
            return "OK," + result;
        } else {
            return result;
        }
    }

}
