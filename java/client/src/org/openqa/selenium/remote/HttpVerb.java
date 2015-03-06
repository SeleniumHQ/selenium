package org.openqa.selenium.remote;

import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.openqa.selenium.remote.http.HttpMethod;

/**
 * @deprecated Use {@link org.openqa.selenium.remote.http.HttpMethod}.
 */
@Deprecated
public enum HttpVerb {
  GET() {
    @Override
    HttpUriRequest createMethod(String url) {
      return new HttpGet(url);
    }

    @Override
    HttpMethod toHttpMethod() {
      return HttpMethod.GET;
    }
  },
  POST() {
    @Override
    HttpUriRequest createMethod(String url) {
      return new HttpPost(url);
    }

    @Override
    HttpMethod toHttpMethod() {
      return HttpMethod.POST;
    }
  },
  DELETE() {
    @Override
    HttpUriRequest createMethod(String url) {
      return new HttpDelete(url);
    }

    @Override
    HttpMethod toHttpMethod() {
      return HttpMethod.DELETE;
    }
  };

  abstract HttpUriRequest createMethod(String url);
  abstract HttpMethod toHttpMethod();
}
