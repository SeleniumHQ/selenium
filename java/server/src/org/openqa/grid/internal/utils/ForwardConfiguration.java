package org.openqa.grid.internal.utils;

import org.openqa.grid.common.SeleniumProtocol;

/**
 * some requests have to be more than just forwarded.
 * For instance for selenium1, the new session request contains
 * the sessionId in the body of the response, so the response has
 * to be read.
 * ForwardConfig gather all those special cases.
 *
 */
public class ForwardConfiguration {
  
    private SeleniumProtocol protocol = null;
    private boolean bodyHasToBeRead = false;
    private boolean isNewSessionRequest = false;
    private String contentOverWrite = null;
    public SeleniumProtocol getProtocol() {
      return protocol;
    }
    public void setProtocol(SeleniumProtocol protocol) {
      this.protocol = protocol;
    }
    public boolean isBodyHasToBeRead() {
      return bodyHasToBeRead;
    }
    
    /**
     * true = the body of the request will be read before being forwarded.
     * @param bodyHasToBeRead
     */
    public void setBodyHasToBeRead(boolean bodyHasToBeRead) {
      this.bodyHasToBeRead = bodyHasToBeRead;
    }
    public boolean isNewSessionRequest() {
      return isNewSessionRequest;
    }
    public void setNewSessionRequest(boolean isNewSessionRequest) {
      this.isNewSessionRequest = isNewSessionRequest;
    }
    public String getContentOverWrite() {
      return contentOverWrite;
    }
    
    /**
     * if !=null : the body of the request will be replaced by contentOverWrite.
     * @param contentOverWrite
     */
    public void setContentOverWrite(String contentOverWrite) {
      this.contentOverWrite = contentOverWrite;
    }
    

    
}

