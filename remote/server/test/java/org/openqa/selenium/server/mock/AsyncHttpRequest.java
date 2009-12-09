package org.openqa.selenium.server.mock;

import java.io.*;
import java.net.*;

import org.apache.commons.logging.*;
import org.openqa.jetty.log.LogFactory;

/**
 * Base class to perform out-of-thread HTTP requests.  We use these to start a request X,
 * then start a request Y, then get the result of request X.  (e.g. driver requests "click",
 * browser requests "OK" [requesting more work], server replies "OK" to the driver.)
 * @author Dan Fabulich
 * @see BrowserRequest
 * @see DriverRequest
 */
public abstract class AsyncHttpRequest {
    _AsyncRunnable runner;
    Thread thread;
    public static final int DEFAULT_TIMEOUT = 30000; //0 = infinite, good for debugging
    protected AsyncHttpRequest() {};
    static Log log = LogFactory.getLog(AsyncHttpRequest.class);
    
    /** reusable "constructor" to be used by child classes */
    protected static <T extends AsyncHttpRequest> T constructRequest(T request, String name, String url, String body, int timeoutInMillis) {
        request.runner = new _AsyncRunnable(url, body, timeoutInMillis);
        request.thread = new Thread(request.runner);
        request.thread.setName(name);
        request.thread.start();
        return request;
    }
    
    /** returns the stringified result of the request, or throws an exception if there was a problem */
    protected String getResult() {
        try {
            thread.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        if (runner.ioex != null) {
            throw new RuntimeException(runner.ioex);
        }
        if (runner.rtex != null) {
            throw new RuntimeException(runner.rtex);
        }
        return runner.resultBody;
    }
    
    /** Performs the actual request, usually in a spawned thread */
    protected static class _AsyncRunnable implements Runnable {

        String url, requestBody, resultBody;
        int timeoutInMillis;
        // if an exception is thrown, put it here
        IOException ioex;
        RuntimeException rtex;
        
        public _AsyncRunnable(String url, String body, int timeoutInMillis) {
            this.url = url;
            this.requestBody = body;
            this.timeoutInMillis = timeoutInMillis;
        }
        
        /** do the actual request, capturing the result or the exception */
        public void run() {
            try {
                log.info("requesting url " + url);
                log.info("request body " + requestBody);
                resultBody = doBrowserRequest(url, requestBody);
                log.info("request got result: " + resultBody);
            } catch (IOException e) {
                ioex = e;
            } catch (RuntimeException e) {
                rtex = e;
            }
            
        }
        
        private String doBrowserRequest(String urlString, String body) throws IOException {
            int responsecode = 200;
            URL result = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) result.openConnection();
            
            conn.setConnectTimeout(timeoutInMillis);
            conn.setReadTimeout(timeoutInMillis);
            conn.setRequestProperty("Content-Type", "application/xml");
            // Send POST output.
            if (body != null) {
                conn.setDoOutput(true);
                OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
                wr.write(body);
                wr.flush();
                wr.close();
            }
            //conn.setInstanceFollowRedirects(false);
            //responsecode = conn.getResponseCode();
            if (responsecode == 301) {
                String pathToServlet = conn.getRequestProperty("Location");
                throw new RuntimeException("Bug! 301 redirect??? " + pathToServlet);
            } else if (responsecode != 200) {
                throw new RuntimeException(conn.getResponseMessage());
            } else {
                InputStream is = conn.getInputStream();
                return stringContentsOfInputStream(is);
            }
        }
        
        private String stringContentsOfInputStream(InputStream is) throws IOException {
            StringBuffer sb = new StringBuffer();
            InputStreamReader r = new InputStreamReader(is, "UTF-8");
            int c;
            while ((c = r.read()) != -1) {
                sb.append((char) c);
            }
            return sb.toString();
        }
        
    }
    
    /**
     * Tests if this request is still active. A thread is alive if it has 
     * been started and has not yet died. 
     *
     * @return  <code>true</code> if this thread is alive;
     *          <code>false</code> otherwise.
     */
    public boolean isAlive() {
        return thread.isAlive();
    }
}
