package org.openqa.selenium.server;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.Calendar;

import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpHandler;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;

/** This test handler is only needed for testing caching. It prints out the current time, but instructs the browser to cache the result. */
public class CachedContentTestHandler implements HttpHandler {
    private static final long serialVersionUID = -4765843647662493876L;

    HttpContext context;
    boolean started;
    
    public CachedContentTestHandler() {
    }

    public void handle(String pathInContext, String pathParams, HttpRequest httpRequest, HttpResponse res) throws HttpException, IOException {
        if (!"/cachedContentTest".equals(pathInContext)) return;
        res.setField(HttpFields.__ContentType, "text/html");
        
        setAlwaysCacheHeaders(res);
        
        OutputStreamWriter writer = new OutputStreamWriter(res.getOutputStream());
        writer.write("<html><body>");
        writer.write(Long.toString(System.currentTimeMillis()));
        writer.write("</body></html>");
        writer.flush();
        writer.close();
        
        httpRequest.setHandled(true);
    }
    
    /** Sets all the don't-cache headers on the HttpResponse */
    private void setAlwaysCacheHeaders(HttpResponse res) {
        res.setField(HttpFields.__CacheControl, "max-age=29723626");
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.YEAR, 1);
        res.setField(HttpFields.__Expires, HttpFields.formatDate(calendar, false));
        res.setField(HttpFields.__LastModified, HttpFields.__01Jan1970);
        res.removeField(HttpFields.__Pragma);
        res.setField(HttpFields.__ETag, "foo");
    }

    public String getName() {
        return CachedContentTestHandler.class.getName();
    }

    public HttpContext getHttpContext() {
        return context;
    }

    public void initialize(HttpContext c) {
        this.context = c;
        
    }

    public void start() throws Exception {
        started = true;
    }

    public void stop() throws InterruptedException {
        started = false;
    }

    public boolean isStarted() {
        return started;
    }
    
}