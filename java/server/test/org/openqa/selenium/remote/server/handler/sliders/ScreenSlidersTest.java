package org.openqa.selenium.remote.server.handler.sliders;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.RandomAccessFile;

import javax.servlet.ServletException;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.web.servlet.FilesServletTest;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.StubElement;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.SessionId;

public class ScreenSlidersTest {
  FilesServletTest filesServletTest = null;
  @Before
  public void setUp() throws ServletException, InterruptedException {
    if(filesServletTest != null) return;
    
    filesServletTest = new FilesServletTest();
    filesServletTest.setUp();
    ScreenSliders.setFilesServerUri(FilesServletTest.BASE_URL + FilesServletTest.CONTEXT_PATH);
  }
  
  @After
  public void clean() throws IOException{
    filesServletTest.clean();
  }
  
  @Test
  public void appendWithElement() throws IOException{
    append(true);
  }
  @Test
  public void appendWithoutElement() throws IOException{
    append(false);
  }
  private void append(boolean hasElement) throws IOException{
    String sampleDescription = "sample";
    File file = File.createTempFile("selenium_ut", ".png");
    file.deleteOnExit();
 
    FileWriter writer = new FileWriter(file);
    writer.write("this is a file for unit test");
    writer.close();
    
    
    WebDriver driver = new TestDriver(file);
    
    WebElement element = null;
    String mask = null;
    if(hasElement){
        element = new StubElement(){
          public Point getLocation(){
            return new Point(1,2);
          }
          public Dimension getSize(){
            return new Dimension(4,3);
          }
        };
        mask = String.format(ScreenSliders.MASK_TEMPLATE, 1, 2, 3, 4);
    }
    SessionId sessionId = new SessionId(FilesServletTest.sessionId);
    
    ScreenSliders sc = new ScreenSliders(driver, element, sampleDescription, sessionId);
    sc.append();
    filesServletTest.verifyPostedSlider(file, mask ,sc.description);
  }
  
  class TestDriver extends StubDriver implements TakesScreenshot {
    private File file;
    public TestDriver(File file){
      this.file = file;
    }
    @Override
    public <X> X getScreenshotAs(OutputType<X> target)
        throws WebDriverException {
      byte[] bytes = null;
      try {
        RandomAccessFile f;
        f = new RandomAccessFile(file, "r");
        bytes = new byte[(int)f.length()];
        f.read(bytes);
      } catch (Exception e) {
        e.printStackTrace();
      }
      return target.convertFromPngBytes(bytes);
    }
  };
}
