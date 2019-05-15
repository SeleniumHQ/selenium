package org.openqa.selenium.devtools.network.types;

import org.openqa.selenium.json.JsonInput;

import java.util.HashMap;
import java.util.Map;

/**
 * HTTP response data
 */
public class Response {

  private String url;

  private Integer status;

  private String statusText;

  private Map<String, Object> headers;

  private String headersText;

  private String mimeType;

  private Map<String, Object> requestHeaders;

  private String requestHeadersText;

  private Boolean connectionReused;

  private Double connectionId;

  private String remoteIPAddress;

  private Integer remotePort;

  private Boolean fromDiskCache;

  private Boolean fromServiceWorker;

  private Double encodedDataLength;

  private ResourceTiming timing;

  private String protocol;

  private SecurityState securityState;

  private SecurityDetails securityDetails;

  public Response() {
  }

  public Response(String url, Integer status, String statusText,
                  Map<String, Object> headers, String headersText, String mimeType,
                  Map<String, Object> requestHeaders, String requestHeadersText,
                  Boolean connectionReused, Double connectionId, String remoteIPAddress,
                  Integer remotePort, Boolean fromDiskCache, Boolean fromServiceWorker,
                  Double encodedDataLength,
                  ResourceTiming timing, String protocol,
                  SecurityState securityState,
                  SecurityDetails securityDetails) {
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.headersText = headersText;
    this.mimeType = mimeType;
    this.requestHeaders = requestHeaders;
    this.requestHeadersText = requestHeadersText;
    this.connectionReused = connectionReused;
    this.connectionId = connectionId;
    this.remoteIPAddress = remoteIPAddress;
    this.remotePort = remotePort;
    this.fromDiskCache = fromDiskCache;
    this.fromServiceWorker = fromServiceWorker;
    this.encodedDataLength = encodedDataLength;
    this.timing = timing;
    this.protocol = protocol;
    this.securityState = securityState;
    this.securityDetails = securityDetails;
  }

  /**
   * Response URL. This URL can be different from CachedResource.url in case of redirect.
   */
  public String getUrl() {
    return url;
  }

  /**
   * Response URL. This URL can be different from CachedResource.url in case of redirect.
   */
  public void setUrl(String url) {
    this.url = url;
  }

  /**
   * HTTP response status code.
   */
  public Integer getStatus() {
    return status;
  }

  /**
   * HTTP response status code.
   */
  public void setStatus(Integer status) {
    this.status = status;
  }

  /**
   * HTTP response status text.
   */
  public String getStatusText() {
    return statusText;
  }

  /**
   * HTTP response status text.
   */
  public void setStatusText(String statusText) {
    this.statusText = statusText;
  }

  /**
   * HTTP response headers.
   */
  public Map<String, Object> getHeaders() {
    return headers;
  }

  /**
   * HTTP response headers.
   */
  public void setHeaders(Map<String, Object> headers) {
    this.headers = headers;
  }

  /**
   * HTTP response headers text.
   */
  public String getHeadersText() {
    return headersText;
  }

  /**
   * HTTP response headers text.
   */
  public void setHeadersText(String headersText) {
    this.headersText = headersText;
  }

  /**
   * Resource mimeType as determined by the browser.
   */
  public String getMimeType() {
    return mimeType;
  }

  /**
   * Resource mimeType as determined by the browser.
   */
  public void setMimeType(String mimeType) {
    this.mimeType = mimeType;
  }

  /**
   * Refined HTTP request headers that were actually transmitted over the network.
   */
  public Map<String, Object> getRequestHeaders() {
    return requestHeaders;
  }

  /**
   * Refined HTTP request headers that were actually transmitted over the network.
   */
  public void setRequestHeaders(Map<String, Object> requestHeaders) {
    this.requestHeaders = requestHeaders;
  }

  /**
   * HTTP request headers text.
   */
  public String getRequestHeadersText() {
    return requestHeadersText;
  }

  /**
   * HTTP request headers text.
   */
  public void setRequestHeadersText(String requestHeadersText) {
    this.requestHeadersText = requestHeadersText;
  }

  /**
   * Specifies whether physical connection was actually reused for this request.
   */
  public Boolean getConnectionReused() {
    return connectionReused;
  }

  /**
   * Specifies whether physical connection was actually reused for this request.
   */
  public void setConnectionReused(Boolean connectionReused) {
    this.connectionReused = connectionReused;
  }

  /**
   * Physical connection id that was actually used for this request.
   */
  public Double getConnectionId() {
    return connectionId;
  }

  /**
   * Physical connection id that was actually used for this request.
   */
  public void setConnectionId(Double connectionId) {
    this.connectionId = connectionId;
  }

  /**
   * Remote IP address.
   */
  public String getRemoteIPAddress() {
    return remoteIPAddress;
  }

  /**
   * Remote IP address.
   */
  public void setRemoteIPAddress(String remoteIPAddress) {
    this.remoteIPAddress = remoteIPAddress;
  }

  /**
   * Remote port.
   */
  public Integer getRemotePort() {
    return remotePort;
  }

  /**
   * Remote port.
   */
  public void setRemotePort(Integer remotePort) {
    this.remotePort = remotePort;
  }

  /**
   * Specifies that the request was served from the disk cache.
   */
  public Boolean getFromDiskCache() {
    return fromDiskCache;
  }

  /**
   * Specifies that the request was served from the disk cache.
   */
  public void setFromDiskCache(Boolean fromDiskCache) {
    this.fromDiskCache = fromDiskCache;
  }

  /**
   * Specifies that the request was served from the ServiceWorker.
   */
  public Boolean getFromServiceWorker() {
    return fromServiceWorker;
  }

  /**
   * Specifies that the request was served from the ServiceWorker.
   */
  public void setFromServiceWorker(Boolean fromServiceWorker) {
    this.fromServiceWorker = fromServiceWorker;
  }

  /**
   * Total number of bytes received for this request so far.
   */
  public Double getEncodedDataLength() {
    return encodedDataLength;
  }

  /**
   * Total number of bytes received for this request so far.
   */
  public void setEncodedDataLength(Double encodedDataLength) {
    this.encodedDataLength = encodedDataLength;
  }

  /**
   * Timing information for the given request.
   */
  public ResourceTiming getTiming() {
    return timing;
  }

  /**
   * Timing information for the given request.
   */
  public void setTiming(ResourceTiming timing) {
    this.timing = timing;
  }

  /**
   * Protocol used to fetch this request.
   */
  public String getProtocol() {
    return protocol;
  }

  /**
   * Protocol used to fetch this request.
   */
  public void setProtocol(String protocol) {
    this.protocol = protocol;
  }

  /**
   * Security state of the request resource.
   */
  public SecurityState getSecurityState() {
    return securityState;
  }

  /**
   * Security state of the request resource.
   */
  public void setSecurityState(SecurityState securityState) {
    this.securityState = securityState;
  }

  /**
   * Security details for the request.
   */
  public SecurityDetails getSecurityDetails() {
    return securityDetails;
  }

  /**
   * Security details for the request.
   */
  public void setSecurityDetails(SecurityDetails securityDetails) {
    this.securityDetails = securityDetails;
  }

  public static Response parseResponse(JsonInput input) {
    Response response;
    input.beginObject();

    String responseUrl = null;

    Number status = null;

    String statusText = null;

    Map<String, Object> responseHeaders = null;

    String headersText = null;

    String mimeType = null;

    Map<String, Object> requestHeaders = null;

    String requestHeadersText = null;

    Boolean connectionReused = null;

    Number connectionId = null;

    String remoteIPAddress = null;

    Number remotePort = null;

    Boolean fromDiskCache = null;

    Boolean fromServiceWorker = null;

    Number encodedDataLength = null;

    ResourceTiming timing = null;

    String protocol = null;

    SecurityState securityState = null;

    SecurityDetails securityDetails = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          responseUrl = input.nextString();
          break;
        case "status":
          status = input.nextNumber();
          break;
        case "statusText":
          statusText = input.nextString();
          break;
        case "headers":
          input.beginObject();
          responseHeaders = new HashMap<>();
          while (input.hasNext()) {
            responseHeaders.put(input.nextName(), input.nextString());
          }
          break;
        case "headersText":
          headersText = input.nextString();
          break;
        case "mimeType":
          headersText = input.nextString();
          break;
        case "requestHeaders":
          input.beginObject();
          requestHeaders = new HashMap<>();
          while (input.hasNext()) {
            requestHeaders.put(input.nextName(), input.nextString());
          }
          break;
        case "requestHeadersText":
          requestHeadersText = input.nextString();
          break;
        case "connectionReused":
          connectionReused = input.nextBoolean();
          break;
        case "connectionId":
          connectionId = input.nextNumber();
          break;
        case "remoteIPAddress":
          remoteIPAddress = input.nextString();
          break;
        case "remotePort":
          remotePort = input.nextNumber();
          break;
        case "fromDiskCache":
          fromDiskCache = input.nextBoolean();
          break;
        case "fromServiceWorker":
          fromDiskCache = input.nextBoolean();
          break;
        case "encodedDataLength":
          encodedDataLength = input.nextNumber();
          break;
        case "protocol":
          protocol = input.nextString();
          break;
        case "securityState":
          securityState = SecurityState.valueOf(input.nextString());
          break;
        case "securityDetails":
          securityDetails = SecurityDetails.parseSecurityDetails(input);
          break;
        default:
          input.skipValue();
          break;
      }
    }

    response =
        new Response(responseUrl, Integer.valueOf(String.valueOf(status)), statusText,
                     responseHeaders, headersText, mimeType, requestHeaders,
                     requestHeadersText, connectionReused,
                     Double.valueOf(String.valueOf(connectionId)), remoteIPAddress,
                     Integer.valueOf(String.valueOf(remotePort)), fromDiskCache,
                     fromServiceWorker, Double.valueOf(String.valueOf(encodedDataLength)), timing,
                     protocol, securityState, securityDetails);
    return response;
  }

}
