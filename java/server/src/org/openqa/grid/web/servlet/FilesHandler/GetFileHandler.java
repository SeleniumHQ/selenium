package org.openqa.grid.web.servlet.FilesHandler;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class GetFileHandler extends BaseFilesHandler {
	private static final int BUFSIZE = 4096;
	@Override
	public void handle(HttpServletRequest request,
			HttpServletResponse response, String filePathName, HttpServlet servlet) throws IOException {
		File file = new File(getSlidersPath(servlet), filePathName);
		if(!file.exists()){
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
        int length   = 0;
        ServletOutputStream outStream = response.getOutputStream();
        ServletContext context  = servlet.getServletConfig().getServletContext();
        String mimetype = context.getMimeType(file.getAbsolutePath());
        
        // sets response content type
        if (mimetype == null) {
            mimetype = "text/plain";
        }
        response.setContentType(mimetype);
        response.setContentLength((int)file.length());
        
        byte[] byteBuffer = new byte[BUFSIZE];
        DataInputStream in = new DataInputStream(new FileInputStream(file));
        
        // reads the file's bytes and writes them to the response stream
        while ((in != null) && ((length = in.read(byteBuffer)) != -1))
        {
            outStream.write(byteBuffer,0,length);
        }
        
        in.close();
        outStream.close();
        response.setStatus(HttpServletResponse.SC_OK);
    }
		
}
