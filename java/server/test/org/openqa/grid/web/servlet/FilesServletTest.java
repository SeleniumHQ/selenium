package org.openqa.grid.web.servlet;

import static org.junit.Assert.assertEquals;

import java.awt.AWTException;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.RandomAccessFile;
import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.FilesHandler.BaseFilesHandler;
import org.openqa.grid.web.servlet.FilesHandler.PostSliderHandler;
import org.openqa.selenium.remote.server.testing.UrlInfo;
import org.seleniumhq.jetty7.server.Server;
import org.seleniumhq.jetty7.server.bio.SocketConnector;
import org.seleniumhq.jetty7.servlet.ServletContextHandler;

public class FilesServletTest {
  public static final String BASE_URL = "http://localhost:4444";
  public static final String CONTEXT_PATH = "/FilesServlet";
  public static final String LOCAL_PATH = new File(System.getProperty("java.io.tmpdir"), "files").getAbsolutePath();
  public static String sessionId = "12345";
  private static boolean init = false;
  private String slidersParam = "?sliders=" + sessionId;
  private String fileParam = "?file=" + sessionId;


  @Before
  public void setUp() throws ServletException, InterruptedException {
    
    if(init) return;
    
    try {
      Server server = new Server();
      Registry registry = Registry.newInstance();
      SocketConnector socketListener = new SocketConnector();
      socketListener.setMaxIdleTime(60000);
      socketListener.setPort(4444);
      server.addConnector(socketListener);

      registry.getConfiguration().setScreenSlidersPath(LOCAL_PATH);

      ServletContextHandler root = new ServletContextHandler(
          ServletContextHandler.SESSIONS);
      root.setContextPath("/");
      server.setHandler(root);

      root.setAttribute(Registry.KEY, registry);

      root.addServlet(FilesServlet.class.getName(), CONTEXT_PATH);

      server.start();
      init = true;

    } catch (Throwable e) {
      throw new RuntimeException("Error initializing the hub" + e.getMessage(),
          e);
    }

  }
  
  @Test
  public void postBasicSlider() throws Exception{
    File file = getScreenshotFile();
    String description = "this is a test slider";
    String mask = String.format("left:%dpx;top:%dpx;height:%dpx;width:%dpx;",
        1, 2, 3, 4);
    HttpResponse response = postSlider(file, mask, description);
    assertEquals(HttpServletResponse.SC_OK, response.getStatusLine().getStatusCode());

    assertEquals(slidersParam, inputStreamToString(response.getEntity().getContent()));


    

    
  }
  
  public void verifyPostedSlider(File file, String mask, String description) throws IOException {
    
    File path = new File(LOCAL_PATH, sessionId);

    HashMap<String, String> slidersData = readSlidersDataFile(new File(path, PostSliderHandler.DATA_FILE_NAME));
    
    String postedFileName = slidersData.get(PostSliderHandler.FILE_FIELD);
    File postedFile = new File(LOCAL_PATH, postedFileName);
    assertEquals(true, postedFile.exists());
    assertEquals(file.length(), postedFile.length());
    if(mask != null)
      assertEquals(mask, slidersData.get(PostSliderHandler.MASK_FIELD));
    if(description != null)
      assertEquals(description, slidersData.get(PostSliderHandler.DESCRIPTION_FIELD));
  }
  
  
  @Test
  public void postSliderWithoutFile() throws Exception{
    String description = "this is a test slider";
    String mask = String.format("left:%dpx;top:%dpx;height:%dpx;width:%dpx;",
        1, 2, 3, 4);
    HttpResponse response = postSlider(null, mask, description);
    assertEquals(HttpServletResponse.SC_NOT_ACCEPTABLE, response.getStatusLine().getStatusCode());

  }
  
  @Test
  public void postSliderLargeFile() throws Exception{
    String description = "this is a test slider";
    String mask = String.format("left:%dpx;top:%dpx;height:%dpx;width:%dpx;",
        1, 2, 3, 4);
    
    File file = new File(System.getProperty("java.io.tmpdir"), "largefile.png");
    file.deleteOnExit();
      RandomAccessFile f = new RandomAccessFile(file, "rw");
      f.setLength(PostSliderHandler.MAX_FILE_SIZE - 1);
      f.close();
      
    HttpResponse response = postSlider(file, mask, description);
    assertEquals(HttpServletResponse.SC_OK, response.getStatusLine().getStatusCode());

  }
  
  @Test
  public void postSliderTooLargeFile() throws Exception{
    String description = "this is a test slider";
    String mask = String.format("left:%dpx;top:%dpx;height:%dpx;width:%dpx;",
        1, 2, 3, 4);
    
    File file = new File(System.getProperty("java.io.tmpdir"), "largefile.png");
    file.deleteOnExit();
      RandomAccessFile f = new RandomAccessFile(file, "rw");
      f.setLength(PostSliderHandler.MAX_FILE_SIZE + 1);
      f.close();
      
    HttpResponse response = postSlider(file, mask, description);
    assertEquals(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, response.getStatusLine().getStatusCode());

  }
  
  @Test
  public void postNoDescriptionMaskSlider() throws Exception{
    File file = getScreenshotFile();
    String description = null;
    String mask = null;
    HttpResponse response = postSlider(file, mask, description);
    assertEquals(HttpServletResponse.SC_OK, response.getStatusLine().getStatusCode());

    assertEquals(slidersParam, inputStreamToString(response.getEntity().getContent()));
    File path = new File(LOCAL_PATH, sessionId);

    String content = readFile(new File(path, PostSliderHandler.DATA_FILE_NAME));
    
    verifyPostedSlider(file, null, null);
  }
  
  @Test
  public void getSliders() throws Exception{
    
    String uri = createUrl(slidersParam).toString();

    HttpClient client = new DefaultHttpClient();
    HttpGet get = new HttpGet(uri);
   

    HttpResponse response = client.execute(get);
    assertEquals(HttpServletResponse.SC_OK, response.getStatusLine().getStatusCode());

    String received = inputStreamToString(response.getEntity().getContent());
    String expected = inputStreamToString(Thread.currentThread().getContextClassLoader().getResourceAsStream(
        "org/openqa/grid/images/sliders.html"));
    assertEquals(expected, received);

  }
  
  @Test
  public void getFile() throws Exception{
    String sampleFileContent = "this is a file for unit test";
    String sampleFileName = "test.png";
    String uri = createUrl(fileParam + "/" + sampleFileName).toString();

    HttpClient client = new DefaultHttpClient();
    HttpGet get = new HttpGet(uri);
    File path = new File(LOCAL_PATH, sessionId);
    File localFile = new File(path, sampleFileName);
    if (!path.exists())
      path.mkdirs();
    if(!localFile.exists())
      localFile.createNewFile();
    FileWriter writer = new FileWriter(localFile);
    writer.write(sampleFileContent);
    writer.close();

    HttpResponse response = client.execute(get);
    assertEquals(HttpServletResponse.SC_OK, response.getStatusLine().getStatusCode());
    
    String received = inputStreamToString(response.getEntity().getContent());

    assertEquals(sampleFileContent, received);
    
    assertEquals("image/png",response.getEntity().getContentType().getValue());

  }

  @Test
  public void getInvalidFile() throws Exception {
    String uri = createUrl(fileParam + "/not_existed.txt" ).toString();

    HttpClient client = new DefaultHttpClient();
    HttpGet get = new HttpGet(uri);

    HttpResponse response = client.execute(get);
    assertEquals(HttpServletResponse.SC_NOT_FOUND, response.getStatusLine().getStatusCode());
  }
  
  private  HttpResponse postSlider(File file, String mask, String description) throws ClientProtocolException, IOException,
      AWTException, InterruptedException {
    String uri = createUrl(slidersParam).toString();
    
    clean();
    
    HttpClient client = new DefaultHttpClient();
    HttpPost post = new HttpPost(uri);
    MultipartEntity entity = new MultipartEntity();
    
    if(file != null){
      FileBody body = new FileBody(file);
      
      entity.addPart(PostSliderHandler.FILE_FIELD, body);
    }
    if(mask != null){
      entity.addPart(PostSliderHandler.MASK_FIELD, new StringBody(mask));
    }
    if(description != null){
      entity.addPart(PostSliderHandler.DESCRIPTION_FIELD, new StringBody(
          description));
    }

    post.setEntity(entity);

    HttpResponse response = client.execute(post);

    return response;

  }
  @After
  public void clean() throws IOException {
    File path = new File(LOCAL_PATH);
    FileUtils.deleteDirectory(path);
  }

  private HashMap<String, String> readSlidersDataFile(File file)
      throws IOException {
    HashMap<String, String> map = new HashMap<String, String>();
    
    HashMap<Pattern, String> patternsMap = new HashMap<Pattern, String>();
    
    patternsMap.put(Pattern.compile(
            ".*<div class='slide'>\\s*<p><img src='\\?file=(.*\\.png)' />.*",
            Pattern.MULTILINE | Pattern.DOTALL), PostSliderHandler.FILE_FIELD);
    patternsMap.put(Pattern
        .compile(
            ".*<a style='(.*)'></a>.*",
            Pattern.MULTILINE | Pattern.DOTALL), PostSliderHandler.MASK_FIELD);
    patternsMap.put(Pattern
        .compile(
            ".*\\s*<div>(.*)</div>\\s*</p>\\s*</div>\\s*$",
            Pattern.MULTILINE | Pattern.DOTALL), PostSliderHandler.DESCRIPTION_FIELD);
    
    String content = readFile(file);
    
    Iterator iter = patternsMap.entrySet().iterator();
    while (iter.hasNext()) {
        Map.Entry entry = (Map.Entry) iter.next();
        Pattern pt = (Pattern) entry.getKey();
        String field = (String) entry.getValue();
        
        Matcher m = pt.matcher(content);
        if(m.matches()){
          map.put(field, m.group(1));
        }
    }
    


    return map;
  }
  

  private static UrlInfo createUrl(String path) {
    return new UrlInfo(BASE_URL, CONTEXT_PATH, path);
  }

  public File getScreenshotFile() throws IOException, AWTException {
    final BufferedImage bufferedImage;
    final Rectangle captureSize;
    final Robot robot;
    File file = File.createTempFile("selenium_ut", ".png");
    file.deleteOnExit();

    robot = new Robot();
    captureSize = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
    bufferedImage = robot.createScreenCapture(captureSize);
    ImageIO.write(bufferedImage, "png", file);
    return file;

  }

  public static String inputStreamToString(InputStream is) throws IOException {
    String line = "";
    StringBuilder total = new StringBuilder();

    // Wrap a BufferedReader around the InputStream
    BufferedReader rd = new BufferedReader(new InputStreamReader(is));

    // Read response until the end
    while ((line = rd.readLine()) != null) {
      total.append(line);
    }

    // Return full string
    return total.toString();
  }

  private String readFile(File file) throws IOException {
    BufferedReader reader = new BufferedReader(new FileReader(file));
    String line = null;
    StringBuilder stringBuilder = new StringBuilder();
    String ls = System.getProperty("line.separator");

    while ((line = reader.readLine()) != null) {
      stringBuilder.append(line);
      stringBuilder.append(ls);
    }

    return stringBuilder.toString();
  }

}
