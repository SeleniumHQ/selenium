package org.openqa.selenium.browserlaunchers.locators;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

/**
 * {@link org.openqa.selenium.server.browserlaunchers.AbstractBrowserLauncher} unit test class.
 */
public class SingleBrowserLocatorUnitTest {

  @Test
  public void testHumanFriendlyLauncherFileNamesReturnsEmptyStringWhenThereIsNoStandardFileNames() {
    final SingleBrowserLocator locator;

    locator = new SingleBrowserLocator() {
      @Override
      protected String[] standardlauncherFilenames() {
        return new String[0];
      }

      @Override
      protected String browserName() {
        return null;
      }

      @Override
      protected String seleniumBrowserName() {
        return null;
      }

      @Override
      protected String browserPathOverridePropertyName() {
        return null;
      }

      @Override
      protected String[] usualLauncherLocations() {
        return new String[0];
      }

    };
    assertEquals("", locator.humanFriendlyLauncherFileNames());
  }

  @Test
  public void testHumanFriendlyLauncherFileNamesReturnsQuotedFileNameWhenThereIsASingleFileName() {
    final SingleBrowserLocator locator;

    locator = new SingleBrowserLocator() {

      @Override
      protected String[] standardlauncherFilenames() {
        return new String[] {"a-single-browser"};
      }

      @Override
      protected String browserName() {
        return null;
      }

      @Override
      protected String seleniumBrowserName() {
        return null;
      }

      @Override
      protected String browserPathOverridePropertyName() {
        return null;
      }

      @Override
      protected String[] usualLauncherLocations() {
        return new String[0];
      }

    };
    assertEquals("'a-single-browser'", locator.humanFriendlyLauncherFileNames());
  }

  @Test
  public void testHumanFriendlyLauncherFileNamesReturnsAllFileNamesOrSeperatedWhenThereIsMoreThanOneFileName() {
    final SingleBrowserLocator locator;

    locator = new SingleBrowserLocator() {

      @Override
      protected String[] standardlauncherFilenames() {
        return new String[] {"a-browser", "another-one"};
      }

      @Override
      protected String browserName() {
        return null;
      }

      @Override
      protected String seleniumBrowserName() {
        return null;
      }

      @Override
      protected String browserPathOverridePropertyName() {
        return null;
      }

      @Override
      protected String[] usualLauncherLocations() {
        return new String[0];
      }

    };
    assertEquals("'a-browser' or 'another-one'", locator.humanFriendlyLauncherFileNames());
  }

}
