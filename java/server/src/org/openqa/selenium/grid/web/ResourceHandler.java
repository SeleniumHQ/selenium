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

package org.openqa.selenium.grid.web;

import com.google.common.net.MediaType;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.UrlPath;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.google.common.net.MediaType.CACHE_MANIFEST_UTF_8;
import static com.google.common.net.MediaType.CSS_UTF_8;
import static com.google.common.net.MediaType.GIF;
import static com.google.common.net.MediaType.HTML_UTF_8;
import static com.google.common.net.MediaType.JAVASCRIPT_UTF_8;
import static com.google.common.net.MediaType.JPEG;
import static com.google.common.net.MediaType.OCTET_STREAM;
import static com.google.common.net.MediaType.PLAIN_TEXT_UTF_8;
import static com.google.common.net.MediaType.PNG;
import static com.google.common.net.MediaType.SVG_UTF_8;
import static com.google.common.net.MediaType.WOFF;
import static com.google.common.net.MediaType.XHTML_UTF_8;
import static com.google.common.net.MediaType.XML_UTF_8;
import static java.net.HttpURLConnection.HTTP_MOVED_TEMP;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class ResourceHandler implements Routable {

  private final Resource resource;

  public ResourceHandler(Resource resource) {
    this.resource = Objects.requireNonNull(resource);
  }

  @Override
  public boolean matches(HttpRequest req) {
    return GET == req.getMethod() && resource.get(req.getUri()).isPresent();
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    Optional<Resource> result = resource.get(req.getUri());

    if (!result.isPresent()) {
      return new HttpResponse()
        .setStatus(HTTP_NOT_FOUND)
        .setContent(Contents.string("Unable to find " + req.getUri(), UTF_8));
    }

    Resource resource = result.get();

    if (resource.isDirectory()) {
      return readDirectory(req, resource);
    }
    return readFile(req, resource);
  }

  private HttpResponse readDirectory(HttpRequest req, Resource resource) {
    if (!req.getUri().endsWith("/")) {
      String dest = UrlPath.relativeToContext(req, req.getUri() + "/");
      return new HttpResponse()
        .setStatus(HTTP_MOVED_TEMP)
        .addHeader("Location", dest);
    }

    String links = resource.list().stream()
      .map(res -> String.format("<li><a href=\"%s\">%s</a>", res.name(), res.name()))
      .sorted()
      .collect(Collectors.joining("\n", "<ul>\n", "</ul>\n"));

    String html = String.format(
      "<html><title>Listing of %s</title><body><h1>%s</h1>%s",
      resource.name(),
      resource.name(),
      links);

    return new HttpResponse()
      .addHeader("Content-Type", HTML_UTF_8.toString())
      .setContent(Contents.string(html, UTF_8));
  }

  private HttpResponse readFile(HttpRequest req, Resource resource) {
    Optional<byte[]> bytes = resource.read();
    if (bytes.isPresent()) {
      return new HttpResponse()
        .addHeader("Content-Type", mediaType(req.getUri()))
        .setContent(Contents.bytes(bytes.get()));
    }
    return get404(req);
  }

  private HttpResponse get404(HttpRequest req) {
    return new HttpResponse()
      .setStatus(HTTP_NOT_FOUND)
      .setContent(Contents.string("Unable to read " + req.getUri(), UTF_8));
  }

  private String mediaType(String uri) {
    int index = uri.lastIndexOf(".");
    String extension = (index == -1 || uri.length() == index) ? "" : uri.substring(index + 1);

    MediaType type;
    switch (extension.toLowerCase()) {
      case "appcache":
        type = CACHE_MANIFEST_UTF_8;
        break;

      case "dll":
      case "ttf":
        type = OCTET_STREAM;
        break;

      case "css":
        type = CSS_UTF_8;
        break;

      case "gif":
        type = GIF;
        break;

      case "jpeg":
      case "jpg":
        type = JPEG;
        break;

      case "js":
        type = JAVASCRIPT_UTF_8;
        break;

      case "md":
      case "txt":
        type = PLAIN_TEXT_UTF_8;
        break;

      case "png":
        type = PNG;
        break;

      case "svg":
        type = SVG_UTF_8;
        break;

      case "woff":
        type = WOFF;
        break;

      case "xhtml":
        type = XHTML_UTF_8;
        break;

      case "xml":
        type = XML_UTF_8;
        break;

      case "xsl":
        type = MediaType.create("application", "xslt+xml").withCharset(UTF_8);
        break;

      default:
        type = HTML_UTF_8;
        break;
    }

    return type.toString();
  }
}
