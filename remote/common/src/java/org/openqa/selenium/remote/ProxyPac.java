package org.openqa.selenium.remote;

import java.io.IOException;
import java.io.Serializable;
import java.io.Writer;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import com.thoughtworks.selenium.SeleniumException;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;

/**
 * A representation of a proxy configuration file.
 */
public class ProxyPac implements Serializable {
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
  private String defaultProxy = "";  // Does nothing. Emulates old behaviour of Selenium

  /**
   * Output the PAC file to the given writer.
   *
   * @param writer Will have config written to it.
   * @throws IOException Should the underlying writer fail.
   */
  public void outputTo(Writer writer) throws IOException {
    writer.append("function FindProxyForURL(url, host) {\n");

    appendDirectHosts(writer);
    appendProxiedHosts(writer);
    appendDirectUrls(writer);
    appendProxiedUrls(writer);
    appendProxiedRegExUrls(writer);

    if (!"".equals(defaultProxy)) {
      writer.append("  return ").append(defaultProxy).append(";\n");
    }

    writer.append("}\n");
  }

  private void appendDirectHosts(Writer writer) throws IOException {
    for (String host : this.directHosts) {
      writer.append("  if (shExpMatch(host, '")
          .append(host)
          .append("')) { return 'DIRECT'; }\n ");
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
          .append("')) { return 'DIRECT'; }\n ");
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
    if (directUrls.size() > 0) {
      toReturn.put("directUrls", unmodifiableSet(directUrls));
    }

    if (proxiedUrls.size() > 0) {
      toReturn.put("proxiedUrls", unmodifiableMap(proxiedUrls));
    }

    if (proxiedRegexUrls.size() > 0) {
      toReturn.put("proxiedRegexUrls", unmodifiableMap(proxiedRegexUrls));
    }

    if (directHosts.size() > 0) {
      toReturn.put("directHosts", unmodifiableSet(directHosts));
    }

    if (proxiedHosts.size() > 0) {
      toReturn.put("proxiedHosts", unmodifiableMap(proxiedHosts));
    }

    if (defaultProxy.length() > 0) {
      toReturn.put("defaultProxy", defaultProxy);
    }

    return toReturn;
  }

  public class ProxyUrlVia {
    private String outgoingUrl;

    private ProxyUrlVia(String outgoingUrl) {
      this.outgoingUrl = outgoingUrl;
    }

    public ProxyPac toProxy(String proxyVia) {
      if (isIeIncompatibleRegEx(outgoingUrl)) {
        proxiedRegexUrls.put(outgoingUrl, proxyVia);
      } else {
        proxiedUrls.put(outgoingUrl, proxyVia);
      }
      return ProxyPac.this;
    }

    // See: http://support.microsoft.com/kb/274204

    private boolean isIeIncompatibleRegEx(String outgoingUrl) {
      return !acceptableShExpPattern.matcher(outgoingUrl).matches();
    }

    public ProxyPac toNoProxy() {
      ProxyPac.this.directUrls.add(outgoingUrl);
      return ProxyPac.this;
    }
  }

  public class ProxyHostVia {
    private String host;

    private ProxyHostVia(String host) {
      this.host = host;
    }

    public ProxyPac toProxy(String proxyVia) {
      proxiedHosts.put(host, proxyVia);
      return ProxyPac.this;
    }

    public ProxyPac toNoProxy() {
      directHosts.add(host);
      return ProxyPac.this;
    }
  }

  public class DefaultProxy {
    public ProxyPac toNoProxy() {
      defaultProxy = "'DIRECT'";
      return ProxyPac.this;
    }

    public ProxyPac toProxy(String proxyVia) {
      defaultProxy = "'PROXY " + proxyVia + "'";
      return ProxyPac.this;
    }
  }
}
