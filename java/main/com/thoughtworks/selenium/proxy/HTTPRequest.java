package com.thoughtworks.selenium.proxy;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.6 $
 */
public interface HTTPRequest {
    String CRLF = "\r\n";

    String getDestinationServer();

    void setDestinationServer(String destinationServer);

    int getDestinationPort();

    void setDestinationPort(int destinationPort);

    String getMethod();

    String getHost();

    void setMethod(String method);

    String getUri();

    void setUri(String uri);

    String getProtocol();

    void setProtocol(String protocol);

    String getHeaderField(String fieldId);

    String getRequest();

    void setHost(String host);

    String getOriginalRequest();

    void setHeaderField(String key, String value);
}
