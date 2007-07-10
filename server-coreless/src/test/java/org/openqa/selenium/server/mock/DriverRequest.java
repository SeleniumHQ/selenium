package org.openqa.selenium.server.mock;

import org.openqa.selenium.server.RemoteCommand;


public class DriverRequest extends AsyncHttpRequest {

    /** Send a command to the server.
     * 
     * @param url the url to contact, not including the command in the GET args
     * @param body the body of the request; normally null
     * @param timeoutInMillis time to wait before giving up on the request
     * @return request object; used to acquire result when it's eventually ready
     */
    public static DriverRequest request(String url, RemoteCommand cmd, String sessionId, int timeoutInMillis) {
        DriverRequest request = new DriverRequest();
        StringBuffer query = new StringBuffer(url);
        query.append('?');
        query.append(cmd.getCommandURLString());
        if (sessionId != null) {
            query.append("&sessionId=");
            query.append(sessionId);
        }
        AsyncHttpRequest.constructRequest(request, "driverRequest: " + query, query.toString(), null, timeoutInMillis);
        return request;
    }
    
    /** returns the result of the previous command, e.g. "OK" or "OK,123" */
    @Override
    public String getResult() throws InterruptedException {
        return super.getResult();
    }
}
