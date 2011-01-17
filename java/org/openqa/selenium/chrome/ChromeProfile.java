/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.chrome;

import org.openqa.selenium.Proxy;
import org.openqa.selenium.io.TemporaryFilesystem;

import java.io.File;

/**
 * Manages the extension used by the {@link ChromeDriver}.
 *
 * @author jmleyba@google.com (Jason Leyba)
 */
public class ChromeProfile {

  /// Note: Using the default profile if it currently has windows open will fail, as the extension will not be installed
  // TODO(danielwh): This should really create a new profile identical to the default profile
  public static final ChromeProfile DEFAULT_PROFILE = new ChromeProfile(new File("WEBDRIVER_DEFAULT_PROFILE"));
  
  private static final String REAP_PROFILE_PROPERTY = "webdriver.reap_profile";

  private final File directory;
  private Proxy proxy;
  private boolean acceptUntrustedCerts;

  /**
   * Create a new profile using the given directory. Assumes that the directory
   * exists and has the required files.
   *
   * @param directory The directory to use.
   */
  public ChromeProfile(File directory) {
    this.directory = directory;
    acceptUntrustedCerts = ChromeDriver.ACCEPT_UNTRUSTED_CERTIFICATES;
  }

  /**
   * Creates a new profile using a temporary directory.
   */
  public ChromeProfile() {
    this(createProfileDir());
  }
  
  /**
   * Sets whether Chrome should accept SSL certificates which have expired,
   * signed by an unknown authority or are generally untrusted.
   * This is set to true by default.
   * 
   * @param acceptUntrustedSsl Whether untrusted SSL certificates should be
   * accepted.
   */
  
  public void setAcceptUntrustedCertificates(boolean acceptUntrustedSsl) {
    this.acceptUntrustedCerts = acceptUntrustedSsl;
  }
  
  public String getUntrustedCertificatesFlag() {
    return acceptUntrustedCerts ? "--ignore-certificate-errors" : "";
  }

  public File getDirectory() {
    return directory;
  }

  /**
   * Creates a temporary directory to use as the Chrome profile directory.
   *
   * @return File object for the created directory.
   */
  private static File createProfileDir() {
    File tempProfileDir = TemporaryFilesystem.createTempDir("profile", "");

    System.setProperty(REAP_PROFILE_PROPERTY, "false");
    return tempProfileDir;
  }

  public Proxy getProxy() {
    return proxy;
  }

  public void setProxy(Proxy proxy) {
    this.proxy = proxy;
  }
  
  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof ChromeProfile)) {
      return false;
    }
    ChromeProfile other = (ChromeProfile)obj;
    if ((this.directory == null && other.directory != null) || 
        (this.directory != null && !(this.directory.equals(other.directory)))) {
      return false;
    }
    if ((this.proxy == null && other.proxy != null) || 
        (this.proxy != null && !(this.proxy.equals(other.proxy)))) {
      return false;
    }
    return true;
  }
}