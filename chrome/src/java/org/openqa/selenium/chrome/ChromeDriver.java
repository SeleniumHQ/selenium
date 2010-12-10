package org.openqa.selenium.chrome;

import static org.openqa.selenium.remote.DriverCommand.SCREENSHOT;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

import com.google.common.collect.ImmutableMap;

import java.util.List;
import java.util.Map;

public class ChromeDriver extends RemoteWebDriver implements  TakesScreenshot, FindsByCssSelector {
  
  //Accept untrusted SSL certificates.
  //TODO: This should probably be a capability, or at least drawn out to be shared with FirefoxDriver
  public static final boolean ACCEPT_UNTRUSTED_CERTIFICATES = true;

  public ChromeDriver(ChromeBinary binary) {
    super(new ChromeCommandExecutor(binary), DesiredCapabilities.chrome());
    
    setElementConverter(new JsonToWebElementConverter(this) {
      @Override
      protected RemoteWebElement newRemoteWebElement() {
        return new ChromeWebElement(ChromeDriver.this);
      }
    });
  }
  
  /**
   * Starts up a new instance of Chrome using the specified profile and
   * extension.
   *
   * @param profile The profile to use.
   * @param extension The extension to use.
   */
  public ChromeDriver(ChromeProfile profile, ChromeExtension extension) {
    this(new ChromeBinary(profile, extension));
  }

  /**
   * Starts up a new instance of Chrome, with the required extension loaded,
   * and has it connect to a new ChromeCommandExecutor on its port
   *
   * @see #ChromeDriver(ChromeProfile, ChromeExtension)
   */
  public ChromeDriver() {
    this(new ChromeProfile(), new ChromeExtension());
  }

  /**
   * By default will try to load Chrome from system property
   * webdriver.chrome.bin and the extension from
   * webdriver.chrome.extensiondir.  If the former fails, will try to guess the
   * path to Chrome.  If the latter fails, will try to unzip from the JAR we 
   * hope we're in.  If these fail, throws exceptions.
   */
  @Override
  protected void startClient() {
    ((ChromeCommandExecutor)getCommandExecutor()).start();
  }
  
  /**
   * Kills the started Chrome process and ChromeCommandExecutor if they exist
   */
  @Override
  protected void stopClient() {
    ((ChromeCommandExecutor)getCommandExecutor()).stop();
  }
  
  /**
   * Executes a passed command using the current ChromeCommandExecutor
   * @param driverCommand command to execute
   * @param parameters parameters of command being executed
   * @return response to the command (a Response wrapping a null value if none) 
   */
  @Override
  protected Response execute(String driverCommand, Map<String, ?> parameters) {
    try {
      return super.execute(driverCommand, parameters);
    } catch (Exception e) {
      if (e instanceof IllegalArgumentException ||
          e instanceof FatalChromeException) {
        //These exceptions may leave the extension hung, or in an
        //inconsistent state, so we restart Chrome
        stopClient();
        startClient();
      }
      if (e instanceof RuntimeException) {
        throw (RuntimeException)e;
      } else {
        throw new WebDriverException(e);
      }
    }
  }

  @Override
  public boolean isJavascriptEnabled() {
    return true;
  }

  public WebElement findElementByCssSelector(String using) {
    return findElement("css", using);
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    return findElements("css", using);
  }

  @Override
  protected RemoteWebElement newRemoteWebElement() {
    RemoteWebElement element = new ChromeWebElement(this);
    return element;
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    return target.convertFromBase64Png(execute(SCREENSHOT, ImmutableMap.<String, Object>of())
        .getValue().toString());
  }
}
