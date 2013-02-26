package org.openqa.selenium.remote;

import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;

public enum HttpVerb {
  GET() {
    @Override
    HttpUriRequest createMethod(String url) {
      return new HttpGet(url);
    }
  },
  POST() {
    @Override
    HttpUriRequest createMethod(String url) {
      return new HttpPost(url);
    }
  },
  DELETE() {
    @Override
    HttpUriRequest createMethod(String url) {
      return new HttpDelete(url);
    }
  };

  abstract HttpUriRequest createMethod(String url);
}
