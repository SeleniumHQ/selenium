package org.openqa.selenium.environment.webserver;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


public class PageServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            // Do nothing
        }

        response.setContentType("text/html");

        int lastIndex = request.getPathInfo().lastIndexOf('/');
        String pageNumber = (lastIndex == -1 ? "Unknown" : request.getPathInfo().substring(lastIndex + 1));
        String res = String.format("<html><head><title>Page%s</title></head>" +
        		"<body>Page number <span id=\"pageNumber\">%s</span>" +
        		"<p><a href=\"../xhtmlTest.html\" target=\"_top\">top</a>" +
//        		"<script>var s=''; for (var i in window) {s += i + ' -> ' + window[i] + '<p>';} document.write(s);</script>" +
        		"</body></html>", 
        		pageNumber, pageNumber);
        
        response.getOutputStream().println(res);
    }
}
