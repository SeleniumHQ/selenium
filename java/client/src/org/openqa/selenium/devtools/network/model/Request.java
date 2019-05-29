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
 * HTTP request data
 */
public class Request {

  private String url;

  private String urlFragment;

  private String method;

  private Map<String, Object> headers;

  private String postData;

  private Boolean hasPostData;

  private MixedContentType mixedContentType;

  private ResourcePriority initialPriority;

  private RequestReferrerPolicy referrerPolicy;

  private Boolean isLinkPreload;

  public Request() {
  }

  public Request(String url, String urlFragment, String method,
                 Map<String, Object> headers, String postData, Boolean hasPostData,
                 MixedContentType mixedContentType,
                 ResourcePriority initialPriority,
                 RequestReferrerPolicy referrerPolicy, Boolean isLinkPreload) {
    this.url = requireNonNull(url, "'url' is require");
    this.urlFragment = urlFragment;
    this.method = method;
    this.headers = headers;
    this.postData = postData;
    this.hasPostData = hasPostData;
    this.mixedContentType = mixedContentType;
    this.initialPriority = initialPriority;
    this.referrerPolicy = referrerPolicy;
    this.isLinkPreload = isLinkPreload;
  }

  /**
   * Request URL (without fragment).
   */
  public String getUrl() {
    return url;
  }

  /**
   * Request URL (without fragment).
   */
  public void setUrl(String url) {
    this.url = url;
  }

  /**
   * Fragment of the requested URL starting with hash, if present.
   */
  public String getUrlFragment() {
    return urlFragment;
  }

  /**
   * Fragment of the requested URL starting with hash, if present.
   */
  public void setUrlFragment(String urlFragment) {
    this.urlFragment = urlFragment;
  }

  /**
   * HTTP request method.
   */
  public String getMethod() {
    return method;
  }

  /**
   * HTTP request method.
   */
  public void setMethod(String method) {
    this.method = method;
  }

  /**
   * HTTP request headers.
   */
  public Map<String, Object> getHeaders() {
    return headers;
  }

  /**
   * HTTP request headers.
   */
  public void setHeaders(Map<String, Object> headers) {
    this.headers = headers;
  }

  /**
   * HTTP POST request data.
   */
  public String getPostData() {
    return postData;
  }

  /**
   * HTTP POST request data.
   */
  public void setPostData(String postData) {
    this.postData = postData;
  }

  /**
   * True when the request has POST data. Note that postData might still be omitted when this flag
   * is true when the data is too long.
   */
  public Boolean getHasPostData() {
    return hasPostData;
  }

  /**
   * True when the request has POST data. Note that postData might still be omitted when this flag
   * is true when the data is too long.
   */
  public void setHasPostData(Boolean hasPostData) {
    this.hasPostData = hasPostData;
  }

  /**
   * The mixed content type of the request.
   */
  public MixedContentType getMixedContentType() {
    return mixedContentType;
  }

  /**
   * The mixed content type of the request.
   */
  public void setMixedContentType(MixedContentType mixedContentType) {
    this.mixedContentType = mixedContentType;
  }

  /**
   * Priority of the resource request at the time request is sent.
   */
  public ResourcePriority getInitialPriority() {
    return initialPriority;
  }

  /**
   * Priority of the resource request at the time request is sent.
   */
  public void setInitialPriority(ResourcePriority initialPriority) {
    this.initialPriority = initialPriority;
  }

  /**
   * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/
   */
  public RequestReferrerPolicy getReferrerPolicy() {
    return referrerPolicy;
  }

  /**
   * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/
   */
  public void setReferrerPolicy(RequestReferrerPolicy referrerPolicy) {
    this.referrerPolicy = referrerPolicy;
  }

  /**
   * Whether is loaded via link preload.
   */
  public Boolean getIsLinkPreload() {
    return isLinkPreload;
  }

  /**
   * Whether is loaded via link preload.
   */
  public void setIsLinkPreload(Boolean isLinkPreload) {
    this.isLinkPreload = isLinkPreload;
  }

  private static Request fromJson(JsonInput input) {
    input.beginObject();
    String url = null;
    String method = null;
    String urlFragment = null;
    Map<String, Object> headers = null;
    String postData = null;
    Boolean hasPostData = null;
    MixedContentType mixedContentType = null;
    ResourcePriority initialPriority = null;
    RequestReferrerPolicy referrerPolicy = null;
    Boolean isLinkPreload = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "url":
          url = input.nextString();
          break;
        case "method":
          method = input.nextString();
          break;
        case "urlFragment":
          urlFragment = input.nextString();
          break;

        case "headers":
          headers = input.read(Json.MAP_TYPE);
          break;

        case "postData":
          postData = input.nextString();
          break;
        case "mixedContentType":
          mixedContentType = MixedContentType.fromString(input.nextString());
          break;
        case "initialPriority":
          initialPriority = ResourcePriority.valueOf(input.nextString());
          break;
        case "referrerPolicy":
          referrerPolicy = RequestReferrerPolicy.fromString(input.nextString());
          break;
        case "isLinkPreload":
          isLinkPreload = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new Request(url, urlFragment, method, headers, postData, hasPostData,
                       mixedContentType, initialPriority, referrerPolicy, isLinkPreload);
  }
}
