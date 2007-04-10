package com.thoughtworks.webdriver.environment.webserver;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import java.io.IOException;


public class PageServlet extends HttpServlet {
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            // Do nothing
        }

        response.setContentType("text/html");

        response.getOutputStream().println("<html><head><title>");
        int lastIndex = request.getPathInfo().lastIndexOf('/');
        String pageNumber = (lastIndex == -1 ? "Unknown" : request.getPathInfo().substring(lastIndex + 1));
        response.getOutputStream().println("Page" + pageNumber);
        response.getOutputStream().println("</title></head><body>Page number <span id=\"pageNumber\">");
        response.getOutputStream().println(pageNumber);
        response.getOutputStream().println("</span></body></html>");
    }
}
