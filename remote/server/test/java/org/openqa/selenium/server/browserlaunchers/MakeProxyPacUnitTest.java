package org.openqa.selenium.server.browserlaunchers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import junit.framework.TestCase;

public class MakeProxyPacUnitTest extends TestCase {
    public MakeProxyPacUnitTest(String name) {
        super(name);
    }
    private File parentDir, pacFile;
    private boolean proxySeleniumTrafficOnly = true;
    private boolean avoidProxy = false;
    private String httpProxyHost = null;
    private String httpProxyPort = null;
    private String httpNonProxyHosts = null;
    
    public void setUp() {
        parentDir = LauncherUtils.createCustomProfileDir("LauncherUtilsUnitTest");
        pacFile = new File(parentDir, "proxy.pac");
    }
    
    public void tearDown() {
        LauncherUtils.recursivelyDeleteDir(parentDir);
    }

    private String makeProxyPAC() throws FileNotFoundException, IOException {
        LauncherUtils.makeProxyPAC(parentDir, 4444, proxySeleniumTrafficOnly, httpProxyHost, httpProxyPort, httpNonProxyHosts, avoidProxy);
        return readEntirePacFile();
    }
    private String readEntirePacFile() throws IOException {
        FileReader fileReader = new FileReader(pacFile);
        BufferedReader reader = new BufferedReader(fileReader);
        StringBuffer sb = new StringBuffer();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append('\n');
        }
        String pac = sb.toString();
        return pac.replaceAll("\\s+", " ").trim();
    }
    
    public void testBasic() throws IOException {
        String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) " +
        		"{ return 'PROXY localhost:4444; DIRECT'; }";
        assertEquals(expected, pac);
    }
    
    public void testNeverProxySeleniumTrafficOnly() throws IOException {
    	proxySeleniumTrafficOnly = false;
    	String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) " +
        		"{ return 'PROXY localhost:4444; DIRECT'; }";
        assertEquals(expected, pac);
    }
    
    public void testAvoidProxyNeverProxySeleniumTrafficOnly() throws IOException {
    	proxySeleniumTrafficOnly = false;
    	avoidProxy = true;
    	String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) " +
        		"{ return 'PROXY localhost:4444; DIRECT'; }";
        assertEquals(expected, pac);
    }
    
    public void testAvoidProxy() throws IOException {
    	avoidProxy = true;
    	String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) " +
            "{ if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:4444; DIRECT'; } }";
        assertEquals(expected, pac);
    }
    
    public void testConfiguredProxy() throws IOException {
    	httpProxyHost = "foo";
    	String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) " +
        		"{ return 'PROXY localhost:4444; PROXY foo'; }";
        assertEquals(expected, pac);
    }
    
    public void testConfiguredProxyAvoidProxy() throws IOException {
    	httpProxyHost = "foo";
    	avoidProxy = true;
    	String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) " +
        		"{ if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:4444; PROXY foo'; } return 'PROXY foo'; }";
        assertEquals(expected, pac);
    }
    
    public void testAvoidProxyNonProxyHost() throws IOException {
        avoidProxy = true;
        httpNonProxyHosts = "www.google.com";
        String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) { "
                          + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
                          + "if (shExpMatch(url, '*/selenium-server/*')) "
                          + "{ return 'PROXY localhost:4444; DIRECT'; } }";
        assertEquals(expected, pac);
    }
    
    public void testConfiguredProxyAvoidProxyNonProxyHost() throws IOException {
        avoidProxy = true;
        httpProxyHost = "foo";
        httpNonProxyHosts = "www.google.com";
        String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) { "
                          + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
                          + "if (shExpMatch(url, '*/selenium-server/*')) { "
                          + "return 'PROXY localhost:4444; PROXY foo'; } return 'PROXY foo'; }";
        assertEquals(expected, pac);
    }
    
    public void testAvoidProxyNonProxyHosts() throws IOException {
        avoidProxy = true;
        httpNonProxyHosts = "www.google.com|*.yahoo.com";
        String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) { "
                          + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
                          + "if (shExpMatch(host, '*.yahoo.com')) { return 'DIRECT'; } "
                          + "if (shExpMatch(url, '*/selenium-server/*')) { "
                          + "return 'PROXY localhost:4444; DIRECT'; } }";
        assertEquals(expected, pac);
    }
    
    public void testConfiguredProxyAvoidProxyNonProxyHosts() throws IOException {
        avoidProxy = true;
        httpProxyHost = "foo";
        httpNonProxyHosts = "www.google.com|*.yahoo.com";
        String pac = makeProxyPAC();
        String expected = "function FindProxyForURL(url, host) { "
                          + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
                          + "if (shExpMatch(host, '*.yahoo.com')) { return 'DIRECT'; } "
                          + "if (shExpMatch(url, '*/selenium-server/*')) "
                          + "{ return 'PROXY localhost:4444; PROXY foo'; } return 'PROXY foo'; }";
        assertEquals(expected, pac);
    }


}
