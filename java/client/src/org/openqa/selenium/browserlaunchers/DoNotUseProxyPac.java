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


package org.openqa.selenium.browserlaunchers;

import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Serializable;
import java.io.Writer;
import java.net.URI;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * A representation of a proxy configuration file.
 */
public class DoNotUseProxyPac implements Serializable {
  // Note that we put the dash character at the end of the pattern
  private static final Pattern acceptableShExpPattern =
      Pattern.compile("[\\w\\*\\?:/\\.-]*");

  // Make an effort to preserve the ordering the user asked for.
  private final Set<String> directUrls = new LinkedHashSet<String>();
  private final Map<String, String> proxiedUrls = new HashMap<String, String>();
  private final Map<String, String> proxiedRegexUrls = new HashMap<String, String>();
  private final Set<String> directHosts = new LinkedHashSet<String>();
  private final Map<String, String> proxiedHosts = new HashMap<String, String>();
  // TODO(simon): Is this right? Really?
  private String defaultProxy = ""; // Does nothing. Emulates old behaviour of Selenium
  private URI deriveFrom;

  /**
   * Output the PAC file to the given writer.
   * 
   * @param writer Will have config written to it.
   * @throws IOException Should the underlying writer fail.
   */
  public void outputTo(Writer writer) throws IOException {
    appendSuperPac(writer);

    writer.append("function FindProxyForURL(url, host) {\n");

    appendDirectHosts(writer);
    appendProxiedHosts(writer);
    appendDirectUrls(writer);
    appendProxiedUrls(writer);
    appendProxiedRegExUrls(writer);

    appendFallbackToSuperPac(writer);

    if (!"".equals(defaultProxy)) {
      writer.append("  return ").append(defaultProxy).append(";\n");
    }

    writer.append("}\n");
  }

  private void appendSuperPac(Writer writer) throws IOException {
    if (deriveFrom == null) {
      return;
    }

    // TODO(simon): This is going to be a cause of bugs. Should detect encoding of incoming data.
    Reader reader = new InputStreamReader((InputStream) deriveFrom.toURL().getContent());
    StringBuilder content = new StringBuilder();
    for (int i = reader.read(); i != -1; i = reader.read()) {
      content.append((char) i);
    }

    writer.append(content.toString().replace("FindProxyForURL", "originalFindProxyForURL"));
    writer.append("\n");
  }

  private void appendFallbackToSuperPac(Writer writer) throws IOException {
    if (deriveFrom == null) {
      return;
    }

    writer.append("\n")
        .append("  var value = originalFindProxyForURL(host, url);\n")
        .append("  if (value) { return value; }\n\n");
  }

  private void appendDirectHosts(Writer writer) throws IOException {
    for (String host : this.directHosts) {
      writer.append("  if (shExpMatch(host, '")
          .append(host)
          .append("')) { return 'DIRECT'; }\n");
    }
  }

  private void appendProxiedHosts(Writer writer) throws IOException {
    for (Map.Entry<String, String> entry : proxiedHosts.entrySet()) {
      writer.append("  if (shExpMatch(host, '")
          .append(entry.getKey())
          .append("')) { return 'PROXY ")
          .append(entry.getValue())
          .append("'; }\n");
    }
  }

  private void appendDirectUrls(Writer writer) throws IOException {
    for (String url : this.directUrls) {
      writer.append("  if (shExpMatch(url, '")
          .append(url)
          .append("')) { return 'DIRECT'; }\n");
    }
  }

  private void appendProxiedUrls(Writer writer) throws IOException {
    for (Map.Entry<String, String> entry : proxiedUrls.entrySet()) {
      writer.append("  if (shExpMatch(url, '")
          .append(entry.getKey())
          .append("')) { return 'PROXY ")
          .append(entry.getValue())
          .append("'; }\n");
    }
  }

  private void appendProxiedRegExUrls(Writer writer) throws IOException {
    for (Map.Entry<String, String> entry : proxiedRegexUrls.entrySet()) {
      writer.append("  if (")
          .append(entry.getKey())
          .append(".test(url)) { return 'PROXY ")
          .append(entry.getValue())
          .append("'; }\n");
    }
  }

  public ProxyUrlVia map(String outgoingUrl) {
    return new ProxyUrlVia(outgoingUrl);
  }

  public ProxyHostVia mapHost(String hostname) {
    return new ProxyHostVia(hostname);
  }

  public DefaultProxy defaults() {
    return new DefaultProxy();
  }

  public Map asMap() {
    Map<String, Object> toReturn = new HashMap<String, Object>();
    if (!directUrls.isEmpty()) {
      toReturn.put("directUrls", unmodifiableSet(directUrls));
    }

    if (!proxiedUrls.isEmpty()) {
      toReturn.put("proxiedUrls", unmodifiableMap(proxiedUrls));
    }

    if (!proxiedRegexUrls.isEmpty()) {
      toReturn.put("proxiedRegexUrls", unmodifiableMap(proxiedRegexUrls));
    }

    if (!directHosts.isEmpty()) {
      toReturn.put("directHosts", unmodifiableSet(directHosts));
    }

    if (!proxiedHosts.isEmpty()) {
      toReturn.put("proxiedHosts", unmodifiableMap(proxiedHosts));
    }

    if (defaultProxy != null && !"".equals(defaultProxy)) {
      toReturn.put("defaultProxy", defaultProxy);
    }

    if (deriveFrom != null) {
      toReturn.put("deriveFrom", deriveFrom.toString());
    }

    return toReturn;
  }

  public DoNotUseProxyPac deriveFrom(URI uri) {
    // Store the uri for now
    this.deriveFrom = uri;
    return this;
  }

  public class ProxyUrlVia {
    private String outgoingUrl;

    private ProxyUrlVia(String outgoingUrl) {
      this.outgoingUrl = outgoingUrl;
    }

    public DoNotUseProxyPac toProxy(String proxyVia) {
      if (isIeIncompatibleRegEx(outgoingUrl)) {
        proxiedRegexUrls.put(outgoingUrl, proxyVia);
      } else {
        proxiedUrls.put(outgoingUrl, proxyVia);
      }
      return DoNotUseProxyPac.this;
    }

    // See: http://support.microsoft.com/kb/274204

    private boolean isIeIncompatibleRegEx(String outgoingUrl) {
      return !acceptableShExpPattern.matcher(outgoingUrl).matches();
    }

    public DoNotUseProxyPac toNoProxy() {
      DoNotUseProxyPac.this.directUrls.add(outgoingUrl);
      return DoNotUseProxyPac.this;
    }
  }

  public class ProxyHostVia {
    private String host;

    private ProxyHostVia(String host) {
      this.host = host;
    }

    public DoNotUseProxyPac toProxy(String proxyVia) {
      proxiedHosts.put(host, proxyVia);
      return DoNotUseProxyPac.this;
    }

    public DoNotUseProxyPac toNoProxy() {
      directHosts.add(host);
      return DoNotUseProxyPac.this;
    }
  }

  public class DefaultProxy {
    public DoNotUseProxyPac toNoProxy() {
      defaultProxy = "'DIRECT'";
      return DoNotUseProxyPac.this;
    }

    public DoNotUseProxyPac toProxy(String proxyVia) {
      defaultProxy = "'PROXY " + proxyVia + "'";
      return DoNotUseProxyPac.this;
    }
  }
}
