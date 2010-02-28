package org.openqa.selenium.chrome;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;

import junit.framework.TestCase;

import org.openqa.selenium.Proxy;
import org.openqa.selenium.Proxy.ProxyType;

import java.io.IOException;
import java.util.ArrayList;

public class ChromeProfileTest extends TestCase {
  public void testProxyDirect() throws IOException {
    ChromeBinary binary = newBinaryWithProxy(new Proxy().setProxyType(ProxyType.DIRECT));
    String commandline = new ArrayList<String>(binary.getCommandline("foo")).toString();
    assertThat(commandline, containsString("--no-proxy-server"));
  }
  
  public void testProxyAutoconfigUrl() throws IOException {
    ChromeBinary binary =
        newBinaryWithProxy(new Proxy().setProxyAutoconfigUrl("http://foo/bar.pac"));
    String commandline = new ArrayList<String>(binary.getCommandline("foo")).toString();
    assertThat(commandline, containsString("--proxy-pac-url=http://foo/bar.pac"));
  }
  
  public void testProxyAutodetect() throws IOException {
    ChromeBinary binary = newBinaryWithProxy(new Proxy().setAutodetect(true));
    String commandline = new ArrayList<String>(binary.getCommandline("foo")).toString();
    assertThat(commandline, containsString("--proxy-auto-detect"));
  }
  
  public void testManualProxy() throws IOException {
    ChromeBinary binary = newBinaryWithProxy(new Proxy().setHttpProxy("foo:123"));
    String commandline = new ArrayList<String>(binary.getCommandline("foo")).toString();
    assertThat(commandline, containsString("--proxy-server=foo:123"));
  }
  
  private ChromeBinary newBinaryWithProxy(Proxy proxy) {
    ChromeProfile profile = new ChromeProfile();
    profile.setProxy(proxy);
    return new ChromeBinary(profile, new ChromeExtension());
  }
}
