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

package org.openqa.grid.web.servlet.api.v1.utils;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class ProxyIdUtilTest {

  public static final String urlSafeEncodedString = "aHR0cDovL2dvb2dsZS5jb206OTk5OQ%3D%3D";
  public static final String encodedStringNotUrlSafe = "aHR0cDovL2dvb2dsZS5jb206OTk5OQ==";
  public static final String urlToEncode = "http://google.com:9999";

  @Test
  public void testEncodeId() throws Exception {
     assertEquals(encodedStringNotUrlSafe, ProxyIdUtil.encodeId(urlToEncode));
  }

  @Test
  public void testDecodeId() throws Exception {
    assertEquals(urlToEncode, ProxyIdUtil.decodeId(encodedStringNotUrlSafe));
  }
}
