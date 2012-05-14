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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.browserlaunchers.MacProxyManager.MacNetworkSetupException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.prefs.AbstractPreferences;
import java.util.prefs.BackingStoreException;

public class MacProxyManagerUnitTest {

  MockableMacProxyManager mmpm;

  @Before
  public void setUp() {
    mmpm = new MockableMacProxyManager("", 4444);
  }

  @Test
  public void testReadSettingsProxyEnabled() throws Exception {
    MacProxyManager.MacNetworkSettings networkSettings = mmpm._getCurrentNetworkSettings();
    networkSettings.toString();
    assertEquals("wrong serviceName", "foo bar", networkSettings.serviceName);
    assertEquals("wrong enabled", true, networkSettings.enabled);
    assertEquals("wrong proxyServer", "foo", networkSettings.proxyServer);
    assertEquals("wrong port", 123, networkSettings.port1);
    assertEquals("wrong authenticated", true, networkSettings.authenticated);
    assertEquals("wrong bypass length", 3, networkSettings.bypass.length);
    // DGF do we really want that final \t?
    assertEquals("wrong bypass", "3\thost-one\thost-two\thost-three\t",
        networkSettings.bypassAsString());
  }

  @Test
  public void testReadSettingsProxyDisabled() throws Exception {
    useProxyDisabledMMPM();
    MacProxyManager.MacNetworkSettings networkSettings = mmpm._getCurrentNetworkSettings();
    assertEquals("wrong serviceName", "foo bar", networkSettings.serviceName);
    assertEquals("wrong enabled", false, networkSettings.enabled);
    assertEquals("wrong proxyServer", "", networkSettings.proxyServer);
    assertEquals("wrong port", 80, networkSettings.port1);
    assertEquals("wrong authenticated", false, networkSettings.authenticated);
    assertEquals("wrong bypass length", 0, networkSettings.bypass.length);
    assertEquals("wrong bypass", "0\t", networkSettings.bypassAsString());
  }

  private void useProxyDisabledMMPM() {
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupGetWebProxy() {
        return "cp: /Library/blah/blah/blah\nEnabled: No\nServer: \nPort: 80\nAuthenticated Proxy Enabled: 0\n";
      }

      @Override
      protected String runNetworkSetupGetProxyBypassDomains() {
        return "cp: /Library/blah/blah/blah\nThere aren't any domains blah blah blah";
      }
    };
  }

  private void useBlankDomainMMPM() {
    // Suppose the bypass domains isn't formally "Empty", but just contains the blank string
    // This is legal on my machine, so we have to consider that case
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupGetProxyBypassDomains() {
        return "cp: /Library/blah/blah/blah\n";
      }
    };
  }

  @Test
  public void testReadSettingsBlankDomain() throws Exception {
    useBlankDomainMMPM();
    MacProxyManager.MacNetworkSettings networkSettings = mmpm._getCurrentNetworkSettings();
    assertEquals("wrong bypass length", 1, networkSettings.bypass.length);
    // DGF do we really want that final \t?
    assertEquals("wrong bypass", "1\t\t", networkSettings.bypassAsString());
  }

  @Test
  public void testReadSettingsNoCpWarningBlankDomain() throws Exception {
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupGetProxyBypassDomains() {
        return "\n";
      }
    };
    MacProxyManager.MacNetworkSettings networkSettings = mmpm._getCurrentNetworkSettings();
    assertEquals("wrong bypass length", 1, networkSettings.bypass.length);
    // DGF do we really want that final \t?
    assertEquals("wrong bypass", "1\t\t", networkSettings.bypassAsString());
  }

  @Test
  public void testBackupBlankDomain() {
    useBlankDomainMMPM();
    mmpm.backupNetworkSettings();
    assertEquals("wrong bypass", "1\t\t", mmpm.mockPrefs.internalPrefs.get("bypass"));
  }

  @Test
  public void testRestoreBlankDomain() {
    preparePrefsProxyDisabled();
    mmpm.mockPrefs.put("bypass", "1\t\t");
    mmpm.restoreNetworkSettings();
    List<String> setwebproxy = assertNetworkSetupCall("-setwebproxy");
    List<String> setproxybypassdomains = assertNetworkSetupCall("-setproxybypassdomains");
    List<String> setwebproxystate = assertNetworkSetupCall("-setwebproxystate");
    assertStringListEquals("setwebproxy was wrong",
        Arrays.asList("-setwebproxy", "foo bar", "", "80"), setwebproxy);
    assertStringListEquals("setproxybypassdomains was wrong",
        Arrays.asList("-setproxybypassdomains", "foo bar", ""), setproxybypassdomains);
    assertStringListEquals("setwebproxystate was wrong",
        Arrays.asList("-setwebproxystate", "foo bar", "off"), setwebproxystate);
    assertEquals("wrong backupready", "false", mmpm.mockPrefs.internalPrefs.get("backupready"));
  }

  @Test
  public void testReadSettingsNoCpWarningProxyDisabled() throws Exception {
    // networksetup usually generates an ignorable warning that the preferences.plist couldn't be
    // backed up
    // what if that warning doesn't appear?
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupGetWebProxy() {
        return "Enabled: No\nServer: \nPort: 80\nAuthenticated Proxy Enabled: 0\n";
      }

      @Override
      protected String runNetworkSetupGetProxyBypassDomains() {
        return "There aren't any domains blah blah blah";
      }

    };
    MacProxyManager.MacNetworkSettings networkSettings = mmpm._getCurrentNetworkSettings();
    assertEquals("wrong serviceName", "foo bar", networkSettings.serviceName);
    assertEquals("wrong enabled", false, networkSettings.enabled);
    assertEquals("wrong proxyServer", "", networkSettings.proxyServer);
    assertEquals("wrong port", 80, networkSettings.port1);
    assertEquals("wrong authenticated", false, networkSettings.authenticated);
    assertEquals("wrong bypass length", 0, networkSettings.bypass.length);
    assertEquals("wrong bypass", "0\t", networkSettings.bypassAsString());
  }

  @Test
  public void testReadSettingsNoCpWarningProxyEnabled() throws Exception {
    // networksetup usually generates an ignorable warning that the preferences.plist couldn't be
    // backed up
    // what if that warning doesn't appear?
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupGetWebProxy() {
        return "Enabled: Yes\nServer: foo\nPort: 123\nAuthenticated Proxy Enabled: 1\n";
      }

      @Override
      protected String runNetworkSetupGetProxyBypassDomains() {
        return "host-one\nhost-two\nhost-three\n";
      }
    };
    MacProxyManager.MacNetworkSettings networkSettings = mmpm._getCurrentNetworkSettings();
    assertEquals("wrong serviceName", "foo bar", networkSettings.serviceName);
    assertEquals("wrong enabled", true, networkSettings.enabled);
    assertEquals("wrong proxyServer", "foo", networkSettings.proxyServer);
    assertEquals("wrong port", 123, networkSettings.port1);
    assertEquals("wrong authenticated", true, networkSettings.authenticated);
    assertEquals("wrong bypass length", 3, networkSettings.bypass.length);
    // DGF do we really want that final \t?
    assertEquals("wrong bypass", "3\thost-one\thost-two\thost-three\t",
        networkSettings.bypassAsString());
  }

  @Test
  public void testBackupProxyEnabled() {
    mmpm.backupNetworkSettings();

    assertEquals("wrong backupready", "true", mmpm.mockPrefs.internalPrefs.get("backupready"));
    assertEquals("wrong serviceName", "foo bar", mmpm.mockPrefs.internalPrefs.get("serviceName"));
    assertEquals("wrong enabled", "true", mmpm.mockPrefs.internalPrefs.get("enabled"));
    assertEquals("wrong proxyServer", "foo", mmpm.mockPrefs.internalPrefs.get("proxyServer"));
    assertEquals("wrong port", "123", mmpm.mockPrefs.internalPrefs.get("port"));
    assertEquals("wrong authenticated", "true", mmpm.mockPrefs.internalPrefs.get("authenticated"));
    // DGF do we really want that final \t?
    assertEquals("wrong bypass", "3\thost-one\thost-two\thost-three\t",
        mmpm.mockPrefs.internalPrefs.get("bypass"));
  }

  @Test
  public void testBackupProxyDisabled() {
    useProxyDisabledMMPM();
    mmpm.backupNetworkSettings();

    assertEquals("wrong backupready", "true", mmpm.mockPrefs.internalPrefs.get("backupready"));
    assertEquals("wrong serviceName", "foo bar", mmpm.mockPrefs.internalPrefs.get("serviceName"));
    assertEquals("wrong enabled", "false", mmpm.mockPrefs.internalPrefs.get("enabled"));
    assertEquals("wrong proxyServer", "", mmpm.mockPrefs.internalPrefs.get("proxyServer"));
    assertEquals("wrong port", "80", mmpm.mockPrefs.internalPrefs.get("port"));
    assertEquals("wrong authenticated", "false", mmpm.mockPrefs.internalPrefs.get("authenticated"));
    assertEquals("wrong bypass", "0\t", mmpm.mockPrefs.internalPrefs.get("bypass"));
  }

  @Test
  public void testChange() throws Exception {
    mmpm.changeNetworkSettings();
    List<String> setwebproxy = assertNetworkSetupCall("-setwebproxy");
    List<String> setproxybypassdomains = assertNetworkSetupCall("-setproxybypassdomains");
    assertStringListEquals("setwebproxy was wrong",
        Arrays.asList("-setwebproxy", "foo bar", "localhost", "4444"), setwebproxy);
    assertStringListEquals("setproxybypassdomains was wrong",
        Arrays.asList("-setproxybypassdomains", "foo bar", "Empty"), setproxybypassdomains);
  }

  @Test
  public void testRestoreProxyEnabled() {
    mmpm.mockPrefs.put("backupready", "true");
    mmpm.mockPrefs.put("serviceName", "foo bar");
    mmpm.mockPrefs.put("enabled", "true");
    mmpm.mockPrefs.put("proxyServer", "foo");
    mmpm.mockPrefs.put("port", "123");
    mmpm.mockPrefs.put("authenticated", "true");
    mmpm.mockPrefs.put("bypass", "3\thost-one\thost-two\thost-three\t");
    mmpm.restoreNetworkSettings();
    List<String> setwebproxy = assertNetworkSetupCall("-setwebproxy");
    List<String> setproxybypassdomains = assertNetworkSetupCall("-setproxybypassdomains");
    List<String> setwebproxystate = assertNetworkSetupCall("-setwebproxystate");
    assertStringListEquals("setwebproxy was wrong",
        Arrays.asList("-setwebproxy", "foo bar", "foo", "123"), setwebproxy);
    assertStringListEquals("setproxybypassdomains was wrong",
        Arrays.asList("-setproxybypassdomains", "foo bar", "host-one", "host-two", "host-three"),
        setproxybypassdomains);
    assertStringListEquals("setwebproxystate was wrong",
        Arrays.asList("-setwebproxystate", "foo bar", "on"), setwebproxystate);
    assertEquals("wrong backupready", "false", mmpm.mockPrefs.internalPrefs.get("backupready"));
  }

  @Test
  public void testRestoreProxyDisabled() {
    preparePrefsProxyDisabled();
    mmpm.restoreNetworkSettings();
    List<String> setwebproxy = assertNetworkSetupCall("-setwebproxy");
    List<String> setproxybypassdomains = assertNetworkSetupCall("-setproxybypassdomains");
    List<String> setwebproxystate = assertNetworkSetupCall("-setwebproxystate");
    assertStringListEquals("setwebproxy was wrong",
        Arrays.asList("-setwebproxy", "foo bar", "", "80"), setwebproxy);
    assertStringListEquals("setproxybypassdomains was wrong",
        Arrays.asList("-setproxybypassdomains", "foo bar", "Empty"), setproxybypassdomains);
    assertStringListEquals("setwebproxystate was wrong",
        Arrays.asList("-setwebproxystate", "foo bar", "off"), setwebproxystate);
    assertEquals("wrong backupready", "false", mmpm.mockPrefs.internalPrefs.get("backupready"));
  }


  private void preparePrefsProxyDisabled() {
    mmpm.mockPrefs.put("backupready", "true");
    mmpm.mockPrefs.put("serviceName", "foo bar");
    mmpm.mockPrefs.put("enabled", "false");
    mmpm.mockPrefs.put("proxyServer", "");
    mmpm.mockPrefs.put("port", "80");
    mmpm.mockPrefs.put("authenticated", "false");
    mmpm.mockPrefs.put("bypass", "0\t");
  }

  @Test
  public void testRestoreBackupNotReady() {
    mmpm.restoreNetworkSettings();
    assertTrue("Not supposed to call networksetup when the backup isn't ready: " +
        mmpm.networkSetupCalls, mmpm.networkSetupCalls.size() == 0);
    assertEquals("wrong backupready", null, mmpm.mockPrefs.internalPrefs.get("backupready"));
  }

  @Test
  public void testRestoreAfterBackupProxyDisabled() throws Exception {
    testBackupProxyDisabled();
    testChange();
    mmpm.networkSetupCalls.clear();
    mmpm.restoreNetworkSettings();
    List<String> setwebproxy = assertNetworkSetupCall("-setwebproxy");
    List<String> setproxybypassdomains = assertNetworkSetupCall("-setproxybypassdomains");
    List<String> setwebproxystate = assertNetworkSetupCall("-setwebproxystate");
    assertStringListEquals("setwebproxy was wrong",
        Arrays.asList("-setwebproxy", "foo bar", "", "80"), setwebproxy);
    assertStringListEquals("setproxybypassdomains was wrong",
        Arrays.asList("-setproxybypassdomains", "foo bar", "Empty"), setproxybypassdomains);
    assertStringListEquals("setwebproxystate was wrong",
        Arrays.asList("-setwebproxystate", "foo bar", "off"), setwebproxystate);
    assertEquals("wrong backupready", "false", mmpm.mockPrefs.internalPrefs.get("backupready"));
  }

  @Test
  public void testRestoreAfterBackupProxyEnabled() throws Exception {
    testBackupProxyEnabled();
    testChange();
    mmpm.networkSetupCalls.clear();
    mmpm.restoreNetworkSettings();
    List<String> setwebproxy = assertNetworkSetupCall("-setwebproxy");
    List<String> setproxybypassdomains = assertNetworkSetupCall("-setproxybypassdomains");
    List<String> setwebproxystate = assertNetworkSetupCall("-setwebproxystate");
    assertStringListEquals("setwebproxy was wrong",
        Arrays.asList("-setwebproxy", "foo bar", "foo", "123"), setwebproxy);
    assertStringListEquals("setproxybypassdomains was wrong",
        Arrays.asList("-setproxybypassdomains", "foo bar", "host-one", "host-two", "host-three"),
        setproxybypassdomains);
    assertStringListEquals("setwebproxystate was wrong",
        Arrays.asList("-setwebproxystate", "foo bar", "on"), setwebproxystate);
    assertEquals("wrong backupready", "false", mmpm.mockPrefs.internalPrefs.get("backupready"));
  }

  @Test
  public void testEvilScutilState() throws Exception {
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runScutil(String arg) {
        if (arg.contains("State:/Network/Global/IPv4")) {
          return "<dictionary> {\n  Foo : 666\n}";
        }
        throw new RuntimeException("Not mocked!");
      }
    };
    try {
      mmpm._getCurrentNetworkSettings();
      fail("Didn't get expected exception");
    } catch (MacProxyManager.MacNetworkSetupException e) {
      assertExceptionContains("Unhelpful exception message", "PrimaryInterface", e);
    }
  }

  private void assertExceptionContains(String message, String substring, Exception e) {
    String stack = exceptionToString(e);
    if (!stack.contains(substring)) {
      fail(message + "; expected containing <" + substring + ">, was " + stack);
    }
  }

  private String exceptionToString(Exception e) {
    StringWriter sw = new StringWriter();
    PrintWriter pw = new PrintWriter(sw);
    e.printStackTrace(pw);
    return sw.toString();
  }

  @Test
  public void testEvilNetworkSetupMissingInterface() throws Exception {
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupListNetworkServiceOrder() {
        return "cp: /Library/blah/blah/blah\n(Hardware Port: Foo Bar, Device: foo)\n";
      }
    };
    try {
      mmpm._getCurrentNetworkSettings();
      fail("Didn't get expected exception");
    } catch (MacProxyManager.MacNetworkSetupException e) {
      assertExceptionContains("Unhelpful exception message", "en0", e);
    }
  }

  @Test
  public void testEvilPrefsMissingKey() {
    mmpm.mockPrefs.put("backupready", "true");
    try {
      mmpm.restoreNetworkSettings();
      fail("Didn't see expected exception");
    } catch (RuntimeException e) {
      assertExceptionContains("Unhelpful exception message", "serviceName", e);
    }
  }

  @Test
  public void testEvilPrefsBadEncodedDomains() {
    verifyEvilPrefsBadEncodedDomains("foo");
    verifyEvilPrefsBadEncodedDomains("4");
    verifyEvilPrefsBadEncodedDomains("4\tfoo");
  }

  public void verifyEvilPrefsBadEncodedDomains(String strBypass) {
    preparePrefsProxyDisabled();
    mmpm.mockPrefs.put("bypass", strBypass);
    try {
      mmpm.restoreNetworkSettings();
      fail("Didn't see expected exception");
    } catch (RuntimeException e) {
      assertExceptionContains("Unhelpful exception message", strBypass, e);
    }
  }

  @Test
  public void testEvilNetworkSetupBadPort() throws Exception {
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupGetWebProxy() {
        return "Enabled: No\nServer: \nPort: Foo\nAuthenticated Proxy Enabled: 0\n";
      }
    };
    try {
      mmpm._getCurrentNetworkSettings();
      fail("Didn't see expected exception");
    } catch (MacNetworkSetupException e) {
      assertExceptionContains("Unhelpful exception message", "Port didn't look right", e);
    }
  }

  @Test
  public void testEvilNetworkSetupMissingKey() throws Exception {
    mmpm = new MockableMacProxyManager("", 4444) {
      @Override
      protected String runNetworkSetupGetWebProxy() {
        return "Foo: No\nBar: \nBaz: 80\nAuthenticated Xyzzy Enabled: 0\n";
      }
    };
    try {
      mmpm._getCurrentNetworkSettings();
      fail("Didn't see expected exception");
    } catch (RuntimeException e) {
      assertExceptionContains("Unhelpful exception message", "Enabled", e);
      assertExceptionContains("Unhelpful exception message", "Xyzzy", e);
    }
  }

  @Test
  public void testChooseSuitableNetworkSetupNoCandidates() throws Exception {
    String result = mmpm._chooseSuitableNetworkSetup("", "", "foo", "bar");
    assertNull("Should not have picked a candidate", result);
  }

  @Test
  public void testChooseSuitableNetworkSetupOneCandidate() throws Exception {
    String result = mmpm._chooseSuitableNetworkSetup("", "", "foo", "networksetup-bar");
    assertEquals("Should have picked the only candidate", "networksetup-bar", result);
  }

  @Test
  public void testChooseSuitableNetworkSetupEvilOsVersion() throws Exception {
    String result =
        mmpm._chooseSuitableNetworkSetup("", "", "networksetup-foo", "networksetup-bar");
    assertNull("Should not have picked a candidate; OS version was blank", result);
    result = mmpm._chooseSuitableNetworkSetup("12.8", "", "networksetup-foo", "networksetup-bar");
    assertNull("Should not have picked a candidate; OS version was 12.8", result);
    result = mmpm._chooseSuitableNetworkSetup("10.8", "", "networksetup-foo", "networksetup-bar");
    assertNull("Should not have picked a candidate; OS version was 10.8 (unrecognized)", result);
  }

  @Test
  public void testChooseSuitableNetworkSetupPanther() throws Exception {
    String result =
        mmpm._chooseSuitableNetworkSetup("10.3", "", "networksetup-foo", "networksetup-panther");
    assertEquals("Wrong candidate", "networksetup-panther", result);
  }

  @Test
  public void testChooseSuitableNetworkSetupEvilPantherButNoneSuitable() throws Exception {
    String result =
        mmpm._chooseSuitableNetworkSetup("10.3", "", "networksetup-foo", "networksetup-bar");
    assertNull("Should not have picked a candidate", result);
  }

  private List<String> assertNetworkSetupCall(String command) {
    for (List<String> call : mmpm.networkSetupCalls) {
      assertTrue("called networksetup with no arguments", call.size() > 0);
      if (command.equals(call.get(0))) {
        return call;
      }
    }
    fail("No networksetup call used " + command + "; " + mmpm.networkSetupCalls);
    // we'll never get here
    return null;
  }

  private void assertStringListEquals(String message, List<String> expected, List<String> actual) {
    if (expected == null) {
      assertNull(message, actual);
      return;
    }
    if (actual == null) {
      assertNotNull(message, actual);
    }
    if (expected.size() != actual.size()) {
      assertEquals(message + "; size didn't match, expected <" +
          expected.toString() + "> but was <" +
          actual.toString() + ">", expected.size(), actual.size());
    }
    for (int i = 0; i < expected.size(); i++) {
      assertEquals(message + "; item " + i + " didn't match", expected.get(i), actual.get(i));
    }
  }

  private static class MockableMacProxyManager extends MacProxyManager {
    List<List<String>> networkSetupCalls = new ArrayList<List<String>>();
    MockPreferences mockPrefs;

    public MockableMacProxyManager(String sessionId, int port) {
      super(sessionId, port);
      try {
        replacePrefs();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }

    private void replacePrefs() throws Exception {
      Field prefs = MacProxyManager.class.getDeclaredField("prefs");
      prefs.setAccessible(true);
      mockPrefs = new MockPreferences();
      prefs.set(this, mockPrefs);
    }

    @Override
    protected String runNetworkSetup(String... args) {
      networkSetupCalls.add(Arrays.asList(args));

      if (args[0].startsWith("-set")) return null;
      if ("-listnetworkserviceorder".equals(args[0])) {
        return runNetworkSetupListNetworkServiceOrder();
      }
      if ("-getwebproxy".equals(args[0])) {
        return runNetworkSetupGetWebProxy();
      } else if ("-getproxybypassdomains".equals(args[0])) {
        return runNetworkSetupGetProxyBypassDomains();
      }
      throw new RuntimeException("not mocked! " + Arrays.toString(args));
    }

    protected String runNetworkSetupListNetworkServiceOrder() {
      return "cp: /Library/blah/blah/blah\n(Hardware Port: foo bar, Device: en0)\n";
    }

    protected String runNetworkSetupGetWebProxy() {
      return "cp: /Library/blah/blah/blah\nEnabled: Yes\nServer: foo\nPort: 123\nAuthenticated Proxy Enabled: 1\n";
    }

    protected String runNetworkSetupGetProxyBypassDomains() {
      return "cp: /Library/blah/blah/blah\nhost-one\nhost-two\nhost-three";
    }

    @Override
    protected String runScutil(String arg) {
      if (arg.contains("State:/Network/Global/IPv4")) {
        return "<dictionary> {\n  PrimaryInterface : en0\n}";
      }
      throw new RuntimeException("Not mocked!");
    }

    protected String _chooseSuitableNetworkSetup(String osVersion,
        String osArch, String... files) throws Exception {
      Method cSNS =
          MacProxyManager.class.getDeclaredMethod("chooseSuitableNetworkSetup", String.class,
              String.class, files.getClass());
      cSNS.setAccessible(true);
      try {
        return (String) cSNS.invoke(this, osVersion, osArch, files);
      } catch (InvocationTargetException ite) {
        if (ite.getCause() instanceof Exception) {
          throw (Exception) ite.getCause();
        }
        throw ite;
      }

    }

    protected MacProxyManager.MacNetworkSettings _getCurrentNetworkSettings() throws Exception {
      Method gCNS = MacProxyManager.class.getDeclaredMethod("getCurrentNetworkSettings");
      gCNS.setAccessible(true);
      try {
        return (MacProxyManager.MacNetworkSettings) gCNS.invoke(this);
      } catch (InvocationTargetException ite) {
        if (ite.getCause() instanceof Exception) {
          throw (Exception) ite.getCause();
        }
        throw ite;
      }
    }
  }

  private static class MockPreferences extends AbstractPreferences {

    Map<String, String> internalPrefs = new HashMap<String, String>();

    protected MockPreferences() {
      super(null, "");
    }

    @Override
    protected String getSpi(String key) {
      return internalPrefs.get(key);
    }

    @Override
    protected void putSpi(String key, String value) {
      internalPrefs.put(key, value);
    }

    @Override
    protected AbstractPreferences childSpi(String name) {
      return null;
    }

    @Override
    protected String[] childrenNamesSpi() throws BackingStoreException {
      return null;
    }

    @Override
    protected String[] keysSpi() throws BackingStoreException {
      return null;
    }

    @Override
    protected void flushSpi() throws BackingStoreException {
    }

    @Override
    protected void removeNodeSpi() throws BackingStoreException {
    }

    @Override
    protected void removeSpi(String key) {
    }

    @Override
    protected void syncSpi() throws BackingStoreException {
    }

  }
}
