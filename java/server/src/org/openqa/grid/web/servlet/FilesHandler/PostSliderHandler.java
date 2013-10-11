package org.openqa.grid.web.servlet.FilesHandler;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.lang3.StringEscapeUtils;
import org.openqa.grid.web.servlet.FilesServlet;
import org.openqa.grid.web.servlet.beta.ConsoleServlet;

/**
 * 
 * create two files in <FILE_STORAGE_PATH>/sessionId 1. screen file in
 * <uuid>.png 2. data file in html to represent the slider element, which will
 * be insert into sliders template
 * 
 * @author chenhaiq@cn.ibm.com
 * 
 */
public class PostSliderHandler extends BaseFilesHandler {
	private static final Logger log = Logger.getLogger(ConsoleServlet.class
			.getName());

	public static final String FILE_FIELD = "file";
	public static final String DESCRIPTION_FIELD = "description";
	public static final String MASK_FIELD = "mask";

	public static String DATA_FILE_NAME = "sliders_data.html";

	public static int MAX_FILE_SIZE = 10 * 1024 * 1024;
	private static File TEMP_DIR = new File(
			System.getProperty("java.io.tmpdir"));
	private static final int BUFSIZE = 1024;

	private static String SLIDER_ELEMENT = "<div class='slide'>\n"
			+ "<p><img src='%s' />%s</p>\n" + "</div>\n";

	private static String SLIDER_DESCRIPTION = "<div>%s</div>\n";

	private static String SLIDER_MASK = "<a style='%s'></a>\n";

	@Override
	public void handle(HttpServletRequest request,
			HttpServletResponse response, String sessionId, HttpServlet servlet)
			throws IOException {

		if (!ServletFileUpload.isMultipartContent(request)) {
			response.setStatus(HttpServletResponse.SC_NOT_IMPLEMENTED);
		}
		String localFileName = null;
		List<FileItem> fileItems = null;
		DiskFileItemFactory factory = new DiskFileItemFactory(
				MAX_FILE_SIZE * 2, TEMP_DIR);

		ServletFileUpload upload = new ServletFileUpload(factory);
		String sliderMask = "", sliderDescription = "";
		File path = new File(getSlidersPath(servlet), sessionId);

		try {
			fileItems = upload.parseRequest(request);

		} catch (FileUploadException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		for (FileItem item : fileItems) {
			String fieldName = item.getFieldName();

			if (item.isFormField()) {

				String value = item.getString();

				if (MASK_FIELD.equals(fieldName) && value != null
						&& !"".equals(value)) {
					sliderMask = String.format(SLIDER_MASK, value);
				} else if (DESCRIPTION_FIELD.equals(fieldName)) {
					sliderDescription = String
							.format(SLIDER_DESCRIPTION, StringEscapeUtils.escapeHtml4(value));
				} else
					log.warning(String
							.format("PostSliderHandler: form field [%s=%s] is not supported ",
									fieldName, value));

			} // Form's input field
			else {
				localFileName = UUID.randomUUID().toString() + "-"
						+ item.getName();

				File file = new File(path, localFileName);

				if (item.getSize() > MAX_FILE_SIZE) {
					response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
					return;
				}
				writeUploadedFile(item.getInputStream(), file);
			} // File uploaded
		}

		if (localFileName == null) {
			response.setStatus(HttpServletResponse.SC_NOT_ACCEPTABLE);
			return;
		}
		String image_url = String.format("?%s=%s/%s", FilesServlet.PARAM_FILE,
				sessionId, localFileName);
		String slider_url = String.format("?%s=%s", FilesServlet.PARAM_SLIDERS,
				sessionId);
		
		String dataFileBody = String.format(SLIDER_ELEMENT, image_url,
				sliderMask + sliderDescription);
		File dataFile = new File(path, DATA_FILE_NAME);
		FileWriter dataFilewriter = new FileWriter(dataFile, true);
		dataFilewriter.write(dataFileBody);
		dataFilewriter.close();
		
		response.setStatus(HttpServletResponse.SC_OK);
		PrintWriter responseWriter = response.getWriter();
		responseWriter.write(slider_url);
		responseWriter.close();
	}
	private void writeUploadedFile(InputStream in, File file)
			throws IOException {

		// if file does not exists, then create it
		if (!file.exists()) {
			File dir = file.getParentFile();
			if (!dir.exists())
				dir.mkdirs();
			file.createNewFile();
		}

		FileOutputStream ou = new FileOutputStream(file);

		byte[] byteBuffer = new byte[BUFSIZE];
		int length = 0;
		
		try{
			while ((length = in.read(byteBuffer)) > 0)
			{
				ou.write(byteBuffer, 0, length);
			}
		}finally{
			// close the io stream in any condition
			in.close();
			ou.close();
		}


	}
}
