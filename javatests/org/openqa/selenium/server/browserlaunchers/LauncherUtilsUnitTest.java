package org.openqa.selenium.server.browserlaunchers;

import junit.framework.TestCase;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;

import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.server.BrowserConfigurationOptions;

public class LauncherUtilsUnitTest extends TestCase {

    private static String COOKIE_SUFFIX = "txt";

    public void testCopySingleFileWithOverwrite() throws IOException {
        File srcFile = createFileWithData("src-dir", "cert8.db", "src text"); 	    
        File destFile = createFileWithData("dest-dir", "cert8.db", "some text"); 	    
        LauncherUtils.copySingleFileWithOverwrite(srcFile, destFile, true);
        String destText = getFileContent(destFile.getAbsolutePath());
        assertEquals("src text", destText);

    }

    // create file with name fileName under <temp-dir>/<parentDirName> and write <data> into the created file.
    private File createFileWithData(String parentDirName, String fileName, String data) throws IOException {
        File tempDir = File.createTempFile("LauncherUtilsUnitTest", "dir");
        tempDir.delete();

        File parentDir = new File(tempDir, parentDirName);
        parentDir.deleteOnExit();
        System.out.println("Making dirs for path " + parentDir.getPath() + " (assuming path has not already been created)");
        assertTrue(parentDir.mkdirs());
        File file = new File(parentDir, fileName);
        file.deleteOnExit();
        assertTrue(file.createNewFile());
        writeDataToFile(file, data); 
        return file;
    }

    private void writeDataToFile(File file, String data) throws IOException {
        FileWriter writer = new FileWriter(file);
	writer.write(data);
	writer.close();
    }

    public void testCopyDirectoryWithNonMatchingSuffix() throws IOException {
        File srcDir = makeSourceDirAndCookie();
        File destDir = getNonexistentDestDir();
        LauncherUtils.copyDirectory(srcDir, COOKIE_SUFFIX + "foo", destDir);
        assertTrue(destDir.exists());
        assertEquals(0, destDir.listFiles().length);
        copyDirectoryCleanUp(srcDir, destDir);
    }

    public void testCopyDirectoryWithMatchingSuffix() throws IOException {
        File srcDir = makeSourceDirAndCookie();
        File destDir = getNonexistentDestDir();
        LauncherUtils.copyDirectory(srcDir, COOKIE_SUFFIX, destDir);
        assertTrue(destDir.exists());
        assertEquals(1, destDir.listFiles().length);
        copyDirectoryCleanUp(srcDir, destDir);
    }

    private File makeSourceDirAndCookie() throws IOException {
        File tempDir = new File(System.getProperty("java.io.tmpdir"));
        File srcDir = new File(tempDir, "rc-lut-src");
        srcDir.deleteOnExit();
        assertTrue(srcDir.mkdir());
        File cookieFile = File.createTempFile("testcookie", COOKIE_SUFFIX, srcDir);
        cookieFile.deleteOnExit();
        assertTrue(cookieFile.exists());
        return srcDir;
    }

    private File getNonexistentDestDir() {
        File tempDir = new File(System.getProperty("java.io.tmpdir"));
        File destDir = new File(tempDir, "rc-lut-dest");
        destDir.deleteOnExit();
        assertFalse(destDir.exists());
        return destDir;
    }

    public void copyDirectoryCleanUp(File srcDir, File destDir) {
        LauncherUtils.deleteTryTryAgain(srcDir, 1);
        LauncherUtils.deleteTryTryAgain(destDir, 1);
        assertFalse(srcDir.exists());
        assertFalse(destDir.exists());
    }

    public void testProxyPacMaking() {
        doProxyPacTest(true, null, "448", "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; PROXY confProxy:448'; }\n"
            + "  return 'PROXY confProxy:448';\n"
            + "}\n");
        doProxyPacTest(false, null, "448", "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
            + "  return 'PROXY localhost:999; PROXY confProxy:448';\n"
            + "}\n");
        doProxyPacTest(true, null, "448", "confProxy", false, 999, "function FindProxyForURL(url, host) {\n"
            + "  return 'PROXY localhost:999; PROXY confProxy:448';\n"
            + "}\n");
        doProxyPacTest(false, null, "448", "confProxy", false, 999, "function FindProxyForURL(url, host) {\n"
            + "  return \'PROXY localhost:999; PROXY confProxy:448\';\n"
            + "}\n");
        doProxyPacTest(true, "someHost", "448", "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(host, 'someHost')) { return 'DIRECT'; }\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; PROXY confProxy:448'; }\n"
            + "  return 'PROXY confProxy:448';\n"
            + "}\n");
        doProxyPacTest(false, "someHost", "448", "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
            + "  return 'PROXY localhost:999; PROXY confProxy:448';\n"
            + "}\n");
        doProxyPacTest(true, "someHost", "448", "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy:448\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "someHost", "448", "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy:448\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", "448", "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; PROXY confProxy:448'; }\n"
            + "  return 'PROXY confProxy:448';\n"
            + "}\n");
        doProxyPacTest(false, "   ", "448", "confProxy", true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy:448\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", "448", "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy:448\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "   ", "448", "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy:448\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, null, "448", null, true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; DIRECT'; }\n"
            + "}\n");
        doProxyPacTest(false, null, "448", null, true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, null, "448", null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, null, "448", null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "someHost", "448", null, true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(host, 'someHost')) { return 'DIRECT'; }\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; DIRECT'; }\n"
            + "}\n");
        doProxyPacTest(false, "someHost", "448", null, true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "someHost", "448", null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "someHost", "448", null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", "448", null, true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; DIRECT'; }\n"
            + "}\n");
        doProxyPacTest(false, "   ", "448", null, true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", "448", null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "   ", "448", null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, null, null, "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; PROXY confProxy'; }\n"
            + "  return 'PROXY confProxy';\n"
            + "}\n");
        doProxyPacTest(false, null, null, "confProxy", true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, null, null, "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, null, null, "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "someHost", null, "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
           + "  if (shExpMatch(host, 'someHost')) { return 'DIRECT'; }\n"
           + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; PROXY confProxy'; }\n"
           + "  return 'PROXY confProxy';\n"
           + "}\n");
        doProxyPacTest(false, "someHost", null, "confProxy", true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "someHost", null, "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "someHost", null, "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", null, "confProxy", true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; PROXY confProxy'; }\n"
            + "  return 'PROXY confProxy';\n"
            + "}\n");
        doProxyPacTest(false, "   ", null, "confProxy", true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", null, "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "   ", null, "confProxy", false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; PROXY confProxy\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, null, null, null, true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; DIRECT'; }\n"
            + "}\n");
        doProxyPacTest(false, null, null, null, true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, null, null, null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, null, null, null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "someHost", null, null, true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(host, 'someHost')) { return 'DIRECT'; }\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; DIRECT'; }\n"
            + "}\n");
        doProxyPacTest(false, "someHost", null, null, true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "someHost", null, null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "someHost", null, null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", null, null, true, 999, "function FindProxyForURL(url, host) {\n"
            + "  if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:999; DIRECT'; }\n"
            + "}\n");
        doProxyPacTest(false, "   ", null, null, true, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(true, "   ", null, null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
        doProxyPacTest(false, "   ", null, null, false, 999, "function FindProxyForURL(url, host) {\n" +
                "  return \'PROXY localhost:999; DIRECT\';\n" +
                "}\n" +
                "");
    }

    private void doProxyPacTest(boolean avoidProxy, String nonProxyHosts, String proxyPort, String configuredProxy,
                                boolean proxySeleniumTrafficOnly, int port, String expectedProxyPac) {
        File parentDir = new File(System.getProperty("java.io.tmpdir"));

        String proxyPacPath = parentDir.getAbsolutePath() + "/proxy.pac";
        File proxyPacFile = new File(proxyPacPath);
        if (proxyPacFile.exists()) {
            proxyPacFile.delete();
        }
        try {
          BrowserConfigurationOptions options = new BrowserConfigurationOptions();
          options.setAvoidProxy(avoidProxy);
          options.setOnlyProxySeleniumTraffic(proxySeleniumTrafficOnly);
          Proxies.makeProxyPAC(parentDir, port, configuredProxy, proxyPort, nonProxyHosts, options.asCapabilities());
        } catch (FileNotFoundException e) {
            fail();
        }
        String actualContent = getFileContent(proxyPacPath);
        assertNotNull(actualContent);
        if (!"".equals(expectedProxyPac)) {
            actualContent = actualContent.replaceAll("\r\n", "\n"); // resolve win32 CR nonsense
            assertEquals(expectedProxyPac, actualContent);
        }
    }

    private String getFileContent(String path) {
        File f = new File(path);
        FileInputStream input;
        try {
            input = new FileInputStream(f);
            byte buf[] = new byte[2048];
            int len = input.read(buf);
            return new String(buf, 0, len);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
