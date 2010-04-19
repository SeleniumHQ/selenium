package org.openqa.selenium;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;

/**
 * Demonstrates how to use WebDriver with a file input element.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
@Ignore(value = IPHONE, reason = "File uploads not allowed on the iPhone")
public class UploadTest extends AbstractDriverTestCase {

  private static final String LOREM_IPSUM_TEXT = "lorem ipsum dolor sit amet";
  private static final String FILE_HTML = "<div>" + LOREM_IPSUM_TEXT + "</div>";

  private File testFile;

  @Override
  protected void setUp() throws Exception {
    super.setUp();
    testFile = createTmpFile(FILE_HTML);
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, SELENESE},
          reason = "Chrome: File input elements are not supported yet")
  public void testFileUploading() throws Exception {
    driver.get(pages.uploadPage);
    driver.findElement(By.id("upload")).sendKeys(testFile.getAbsolutePath());
    driver.findElement(By.id("go")).submit();

    driver.switchTo().frame("upload_target");

    WebElement body = driver.findElement(By.xpath("//body"));
    assertEquals("Page source is: " + driver.getPageSource(), LOREM_IPSUM_TEXT, body.getText());
  }

  private File createTmpFile(String content) throws IOException {
    File f = File.createTempFile("webdriver", "tmp");
    f.deleteOnExit();

    OutputStream out = new FileOutputStream(f);
    PrintWriter pw = new PrintWriter(out);
    pw.write(content);
    pw.flush();
    pw.close();
    out.close();

    return f;
  }
}
