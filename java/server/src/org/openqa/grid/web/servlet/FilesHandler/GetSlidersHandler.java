package org.openqa.grid.web.servlet.FilesHandler;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.common.JSONConfigurationUtils;

public class GetSlidersHandler extends BaseFilesHandler {

	private static String sliderHtml = null;
	private static final int BUFSIZE = 4096;
	@Override
	public void handle(HttpServletRequest request,
			HttpServletResponse response, String filePathName, HttpServlet servlet) throws IOException {
		
		String body =  getSlidersHtml();
		if(body == null || "".equals(body)){
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return;
		}
		
		PrintWriter writer = response.getWriter();
		writer.write(sliderHtml);
		writer.close();
		response.setStatus(HttpServletResponse.SC_OK);
	}
	
	private String getSlidersHtml() throws IOException{
		
		if(sliderHtml == null){
			StringBuffer buf = new StringBuffer();
		    InputStream inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(
		    		"org/openqa/grid/images/sliders.html");
			 BufferedReader in
			   = new BufferedReader(new InputStreamReader(inputStream));
	        char[] charBuffer = new char[BUFSIZE];
	        int length = 0;
	        // reads the file's bytes and writes them to the response stream
	        while ((in != null) && ((length = in.read(charBuffer)) != -1))
	        {
	        	buf.append(charBuffer, 0, length);
	        }
	        sliderHtml = buf.toString();
		}
		return sliderHtml;

	}
}
