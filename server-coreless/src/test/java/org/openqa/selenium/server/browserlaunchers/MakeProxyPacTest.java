package org.openqa.selenium.server.browserlaunchers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import junit.framework.TestCase;

public class MakeProxyPacTest extends TestCase {
    public MakeProxyPacTest(String name) {
        super(name);
    }
    private File parentDir, pacFile;
    private boolean proxySeleniumTrafficOnly = true;
    private boolean avoidProxy = false;
    private String httpProxyHost = null;
    private String httpProxyPort = null;
    
    public void setUp() {
        parentDir = LauncherUtils.createCustomProfileDir("LauncherUtilsTest");
        pacFile = new File(parentDir, "proxy.pac");
    }
    
    public void tearDown() {
        LauncherUtils.recursivelyDeleteDir(parentDir);
    }
    
    public void testBasic() throws IOException {
        LauncherUtils.makeProxyPAC(parentDir, 4444, proxySeleniumTrafficOnly, httpProxyHost, httpProxyPort, avoidProxy);
        String pac = readEntirePacFile();
        String expected = "function FindProxyForURL(url, host) { return 'PROXY localhost:4444; DIRECT'; } ";
        assertEquals(expected, pac);
    }
    
    public void testNeverProxySeleniumTrafficOnly() throws IOException {
    	proxySeleniumTrafficOnly = false;
    	LauncherUtils.makeProxyPAC(parentDir, 4444, proxySeleniumTrafficOnly, httpProxyHost, httpProxyPort, avoidProxy);
    	String pac = readEntirePacFile();
        String expected = "function FindProxyForURL(url, host) { return 'PROXY localhost:4444; DIRECT'; } ";
        assertEquals(expected, pac);
    }
    
    public void testAvoidProxyNeverProxySeleniumTrafficOnly() throws IOException {
    	proxySeleniumTrafficOnly = false;
    	avoidProxy = true;
    	LauncherUtils.makeProxyPAC(parentDir, 4444, proxySeleniumTrafficOnly, httpProxyHost, httpProxyPort, avoidProxy);
    	String pac = readEntirePacFile();
        String expected = "function FindProxyForURL(url, host) { return 'PROXY localhost:4444; DIRECT'; } ";
        assertEquals(expected, pac);
    }
    
    public void testAvoidProxy() throws IOException {
    	avoidProxy = true;
    	LauncherUtils.makeProxyPAC(parentDir, 4444, proxySeleniumTrafficOnly, httpProxyHost, httpProxyPort, avoidProxy);
    	String pac = readEntirePacFile();
        String expected = "function FindProxyForURL(url, host) { if(shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:4444; DIRECT'; } } ";
        assertEquals(expected, pac);
    }
    
    public void testConfiguredProxy() throws IOException {
    	httpProxyHost = "foo";
    	LauncherUtils.makeProxyPAC(parentDir, 4444, proxySeleniumTrafficOnly, httpProxyHost, httpProxyPort, avoidProxy);
    	String pac = readEntirePacFile();
        String expected = "function FindProxyForURL(url, host) { return 'PROXY localhost:4444; PROXY foo'; } ";
        assertEquals(expected, pac);
    }
    
    public void testConfiguredProxyAvoidProxy() throws IOException {
    	httpProxyHost = "foo";
    	avoidProxy = true;
    	LauncherUtils.makeProxyPAC(parentDir, 4444, proxySeleniumTrafficOnly, httpProxyHost, httpProxyPort, avoidProxy);
    	String pac = readEntirePacFile();
        String expected = "function FindProxyForURL(url, host) { if(shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:4444; PROXY foo'; } else { return 'PROXY foo'; } } ";
        assertEquals(expected, pac);
    }
    
    public String normalizeWhitespace(String pac) {
    	return pac.replaceAll("\\s+", " ");
    }
    
    public String readEntirePacFile() throws IOException {
        FileReader fileReader = new FileReader(pacFile);
        BufferedReader reader = new BufferedReader(fileReader);
        StringBuffer sb = new StringBuffer();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append('\n');
        }
        String pac = sb.toString();
        return pac.replaceAll("\\s+", " ");
    }
}
