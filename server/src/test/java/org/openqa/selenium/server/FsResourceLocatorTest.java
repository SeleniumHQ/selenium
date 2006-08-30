package org.openqa.selenium.server;

import junit.framework.TestCase;
import org.mortbay.http.HttpContext;
import org.mortbay.util.Resource;

import java.io.File;

public class FsResourceLocatorTest extends TestCase {
    private File tempFile;
    private FsResourceLocator resourceLocator;
    private HttpContext context;

    public void setUp() throws Exception {
        super.setUp();
        tempFile = File.createTempFile("selenium-test-", "");
        tempFile.deleteOnExit();
        resourceLocator = new FsResourceLocator(tempFile.getParentFile());
        context = new HttpContext();
    }

    public void testShouldGetResourceFromRootDir() throws Exception {
        Resource resource = resourceLocator.getResource(context, tempFile.getName());
        assertTrue(resource.exists());
        assertNotNull(resource.getInputStream());
        assertEquals(tempFile.getAbsolutePath(), resource.getFile().getAbsolutePath());
    }

    public void testShouldReturnMissingResourceIfResourceNotFound() throws Exception {
        assertFalse(resourceLocator.getResource(context, "not_exists").exists());
    }

    public void testHackForJsUserExtensionsLocating() throws Exception {
        File extension = new File("user-extensions.js");
        extension.createNewFile();
        extension.deleteOnExit();
        FsResourceLocator extensionLocator = new FsResourceLocator(extension.getParentFile());
        Resource resource = extensionLocator.getResource(context, "some/path/user-extensions.js");
        assertTrue(resource.exists());
        assertEquals(extension.getAbsolutePath(), resource.getFile().getAbsolutePath());
    }
}
