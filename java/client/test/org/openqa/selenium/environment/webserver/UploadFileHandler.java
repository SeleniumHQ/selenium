/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.environment.webserver;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Map;
import java.util.Set;

import org.apache.commons.fileupload.MultipartStream;
import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

public class UploadFileHandler implements HttpHandler {

  private static final Set<String> UPLOAD_NAMES = ImmutableSet.of("upload", "\"upload\"");
  
  public void handleHttpRequest(HttpRequest request, HttpResponse response, HttpControl control)
      throws Exception {
    response.header("Content-Type", "text/html; charset=" + Charsets.UTF_8.name());
    
    String contentTypeHeader = request.header("Content-Type");
    Map<String, String> contentTypeHeaderFields = extractFields(contentTypeHeader);
    
    ByteArrayInputStream input = new ByteArrayInputStream(request.bodyAsBytes());
    MultipartStream multipartStream =
        new MultipartStream(input, contentTypeHeaderFields.get("boundary").getBytes());
    
    boolean hasNext = multipartStream.skipPreamble();
    while (hasNext) {
      Map<String, String> allHeaders = splitHeaders(multipartStream.readHeaders());
      String inputFieldName = extractFields(allHeaders.get("Content-Disposition")).get("name");
      if (UPLOAD_NAMES.contains(inputFieldName)) {
        ByteArrayOutputStream data = new ByteArrayOutputStream();
        multipartStream.readBodyData(data);
        response.content(data.toByteArray());
      } else {
        multipartStream.discardBodyData();
      }

      hasNext = multipartStream.readBoundary();
    }
    
    response
        .content("<script>window.top.window.onUploadDone();</script>")
        .end();
  }

  private Map<String, String> splitHeaders(String readHeaders) {
    ImmutableMap.Builder<String, String> headersBuilder = new ImmutableMap.Builder<String, String>();
    String[] headers = readHeaders.split("\r\n");
    for (String headerLine : headers) {
      int index = headerLine.indexOf(':');
      if (index < 0) {
        continue;
      }
      String key = headerLine.substring(0, index);
      String value = headerLine.substring(index + 1).trim();
      headersBuilder.put(key, value);
    }
    return headersBuilder.build();
  }

  private Map<String, String> extractFields(String contentTypeHeader) {
    ImmutableMap.Builder<String, String> fieldsBuilder = new ImmutableMap.Builder<String, String>();
    String[] contentTypeHeaderParts = contentTypeHeader.split("[;,]");
    for (String contentTypeHeaderPart : contentTypeHeaderParts) {
      String[] kv = contentTypeHeaderPart.split("=");
      if (kv.length == 2) {
        fieldsBuilder.put(kv[0].trim(), kv[1].trim());
      }
    }
    return fieldsBuilder.build();
  }
}
