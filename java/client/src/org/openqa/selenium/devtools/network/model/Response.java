// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

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
    this.url = requireNonNull(url, "'url' is required for Response");
    this.status = requireNonNull(status, "'status' is required for Response");
    this.statusText = requireNonNull(statusText, "'statusText' is required for Response");
    this.headers = requireNonNull(headers, "'headers' is required for Response");
    this.headersText = headersText;
    this.mimeType = requireNonNull(mimeType, "'mimeType' is required for Response");
    this.requestHeaders = requestHeaders;
    this.requestHeadersText = requestHeadersText;
    this.connectionReused =
        requireNonNull(connectionReused, "'connectionReused' is required for Response");
    this.connectionId = requireNonNull(connectionId, "'connectionId' is required for Response");
    this.remoteIPAddress = remoteIPAddress;
    this.remotePort = remotePort;
    this.fromDiskCache = fromDiskCache;
    this.fromServiceWorker = fromServiceWorker;
    this.encodedDataLength =
        requireNonNull(encodedDataLength, "'encodedDataLength' is required for Response");
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

  private static Response fromJson(JsonInput input) {
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

    Double connectionId = null;

    String remoteIPAddress = null;

    Integer remotePort = null;

    Boolean fromDiskCache = null;

    Boolean fromServiceWorker = null;

    Double encodedDataLength = null;

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
          responseHeaders = input.read(Json.MAP_TYPE);
          break;
        case "headersText":
          headersText = input.nextString();
          break;
        case "mimeType":
          mimeType = input.nextString();
          break;
        case "requestHeaders":
          requestHeaders = input.read(Json.MAP_TYPE);
          break;
        case "requestHeadersText":
          requestHeadersText = input.nextString();
          break;
        case "connectionReused":
          connectionReused = input.nextBoolean();
          break;
        case "connectionId":
          connectionId = input.read(Double.class);
          break;
        case "remoteIPAddress":
          remoteIPAddress = input.nextString();
          break;
        case "remotePort":
          remotePort = input.read(Integer.class);
          break;
        case "fromDiskCache":
          fromServiceWorker = input.nextBoolean();
          break;
        case "fromServiceWorker":
          fromDiskCache = input.nextBoolean();
          break;
        case "encodedDataLength":
          encodedDataLength = input.read(Double.class);
          break;
        case "protocol":
          protocol = input.nextString();
          break;
        case "securityState":
          securityState = SecurityState.valueOf(input.nextString());
          break;
        case "securityDetails":
          securityDetails = input.read(SecurityDetails.class);
          break;
        case "timing":
          timing = input.read(ResourceTiming.class);
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
                     connectionId, remoteIPAddress,
                     remotePort, fromDiskCache,
                     fromServiceWorker, encodedDataLength, timing,
                     protocol, securityState, securityDetails);
    return response;
  }

}
