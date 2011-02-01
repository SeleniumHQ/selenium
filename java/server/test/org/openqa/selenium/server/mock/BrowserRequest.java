package org.openqa.selenium.server.mock;

import junit.framework.Assert;

import org.openqa.selenium.server.DefaultRemoteCommand;
import org.openqa.selenium.server.RemoteCommand;


public class BrowserRequest extends AsyncHttpRequest {
    protected BrowserRequest() {}
    
    /** Request more work from the server and reply with the previous result
     * 
     * @param url the url to contact
     * @param body the body of the response; normally the result of the previous command, e.g. "OK"
     * @return request object; used to acquire result when it's eventually ready
     */
    public static BrowserRequest request(String url, String body) {
        return request(url, body, AsyncHttpRequest.DEFAULT_TIMEOUT);
    }

    /** Request more work from the server and reply with the previous result
     * 
     * @param url the url to contact
     * @param body the body of the response; normally the result of the previous command, e.g. "OK"
     * @param timeoutInMillis time to wait before giving up on the request
     * @return request object; used to acquire result when it's eventually ready
     */
    public static BrowserRequest request(String url, String body, int timeoutInMillis) {
        BrowserRequest request = new BrowserRequest();
        AsyncHttpRequest.constructRequest(request, "browserRequest: " + body, url, body, timeoutInMillis);
        return request;
    }
    
    /** Parses the result of the browser request and returns a RemoteCommand */
    public RemoteCommand getCommand() {
        return DefaultRemoteCommand.parse(getResult());
    }
    
    public RemoteCommand expectCommand(String cmd, String arg1, String arg2) {
        RemoteCommand actual = getCommand();
        RemoteCommand expected = new DefaultRemoteCommand(cmd, arg1, arg2);
        Assert.assertEquals(cmd + " command got mangled", expected, actual);
        return actual;
    }
}
