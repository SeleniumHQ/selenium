package com.thoughtworks.selenium.launchers;

import com.thoughtworks.selenium.BrowserLauncher;

/**
 * This class launches the browser using <a href="http://jrex.mozdev.org/">JRex</a>,
 * a Java Browser Component a set of API's for Embedding Mozilla Gecko within a
 * Java Application.
 * @deprecated This class does nothing, because its body is commented out.
 * @author Paul Hammant
 * @version $Revision: 1.8 $
 */
public class JRexBrowserLauncher implements BrowserLauncher {

// See http://jrex.mozdev.org/

//    JRexWindowManager winManager;

    public JRexBrowserLauncher() { // throws JRexException {
//         System.setProperty("jrex.gre.path","C:/Program Files/mozilla.org/Mozilla");
//
//        //start the JRex XPCOM engine.
//        JRexFactory.getInstance().startEngine();
//
//        //Get the JRex WindowManager implementation.
//        winManager = (JRexWindowManager) JRexFactory.getInstance().getImplInstance(JRexFactory.WINDOW_MANAGER);
//
//        //Create the JRex WindowManager with desired window mode.
//        winManager.create(JRexWindowManager.TAB_MODE);
//
//        //init the window manager with a parent component where JRex browser sits, if component is null then a new JFrame will be used.
//        winManager.init(null);
    }

    public void launch(String url) {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    public void close() {
//        winManager.dispose();
    }


//    public static void main(String[] args) throws JRexException {
//        new JRexBrowserLauncher();
//    }
}
