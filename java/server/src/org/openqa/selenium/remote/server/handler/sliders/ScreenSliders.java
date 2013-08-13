package org.openqa.selenium.remote.server.handler.sliders;

import static org.openqa.selenium.OutputType.BYTES;

import java.net.URI;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.ByteArrayBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.SessionId;
/*
 * create screen shot in sliders
 * 
 */
public class ScreenSliders {
	public static final String MASK_TEMPLATE = "left:%dpx;top:%dpx;height:%dpx;width:%dpx;";
  private static final String DEFAULT_SLIDER_NAME = "screen_shot.png";
	// definition copied from FilesServlet in order to not have dependence with grid module
	public static final String PARAM_SLIDERS = "sliders";
	public static final String DESCRIPTION_FIELD = "description";
	public static final String MASK_FIELD = "mask";
	static final String FILE_FIELD = "file";
	
	private WebDriver driver;
	private WebElement element;
	public String description;
	private SessionId sessionId;
	private static String filesServerUrl = null;
    	
    public ScreenSliders( WebDriver driver, WebElement element, String description, SessionId sessionId){
    	this.driver = driver;
    	this.element = element;
		this.description = description;
		this.sessionId = sessionId;
    }
    
    public static void setFilesServerUri(String url){
    	filesServerUrl = url;
    }
    public static String getFilesServerUri(){
    	return filesServerUrl;
    }
    
	public void append(){
		try {
			byte[] screenShot = ((TakesScreenshot) driver).getScreenshotAs(BYTES);
		    
			ByteArrayBody body = new ByteArrayBody(screenShot, DEFAULT_SLIDER_NAME); 


			URIBuilder builder = new URIBuilder(filesServerUrl);
			builder.setParameter(PARAM_SLIDERS, sessionId.toString());
			URI uri = builder.build();
			
			HttpClient client = new DefaultHttpClient();
		    HttpPost post = new HttpPost(uri);
		    MultipartEntity entity = new MultipartEntity();
		    
			entity.addPart(FILE_FIELD, body);

			if(element != null){
	    	    Point location = element.getLocation();
	    	    Dimension size = element.getSize();
	    	    // format as html style
				String mask = String.format(MASK_TEMPLATE, location.x, location.y, size.height, size.width);
				entity.addPart(MASK_FIELD, new StringBody(mask));
			}
			
			if(description != null){
				description += " @ " + getTimeStamp(); //append time stamp
				entity.addPart(DESCRIPTION_FIELD, new StringBody(description));
			}
			
			post.setEntity(entity);

		    client.execute(post);
		} catch (Exception e) {
	        // ignore all errors to resume test 
		    e.printStackTrace();
		}
		
	}
	
	private String getTimeStamp() {
		SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		return df.format(new Date());
	}
	
}
