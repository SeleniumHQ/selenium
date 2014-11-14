package org.openqa.selenium.safari.helpers;

import com.google.common.base.Throwables;

import java.io.IOException;
import java.util.logging.Logger;

public class GlobalExtensionStatus {

  private static final Logger logger = Logger.getLogger(GlobalExtensionStatus.class.getName());

  public static boolean safariExtensionsEnabled(){
    String standardOut = "";
    int exitCode = -1;

    CLICommandExecutor executor = null;
    try {
      executor = new CLICommandExecutor(getSafariExtensionStatusCommand());
      exitCode = executor.getExitCode();
      standardOut = executor.getStandardOut();
    } catch (InterruptedException e) {
      logger.warning(
          String.format("Error occurred while checking Safari Extension status %s\n%s",
                        e.getMessage(),
                        Throwables.getStackTraceAsString(e)));
    } catch (IOException e) {
      logger.warning(
          String.format("Error occurred while checking Safari Extension status %s\n%s",
                        e.getMessage(),
                        Throwables.getStackTraceAsString(e)));
    }

    logger.info(
        String.format(
            "Checking if Safari Extensions are enabled. Exit code: %s, Standard Out (0-disabled/1-enabled): '%s'",
            exitCode,
            standardOut));

    if (standardOut.equals("1")) {
      return true;
    }
    return false;
  }

  public static void attemptToEnableExtensions(){
    logger.info("Attempting to enable Safari Extensions");
    try {
      CLICommandExecutor executor = new CLICommandExecutor(getSafariExtensionsEnableCommand());
    } catch (InterruptedException e) {
      logger.warning(
          String.format("Error occurred while enabling Safari Extension status %s\n%s",
                        e.getMessage(),
                        Throwables.getStackTraceAsString(e)));
    } catch (IOException e) {
      logger.warning(
          String.format("Error occurred while enabling Safari Extension status %s\n%s",
                        e.getMessage(),
                        Throwables.getStackTraceAsString(e)));
    }
  }

  protected static String getSafariExtensionStatusCommand(){
     return "defaults read com.apple.Safari ExtensionsEnabled";
  }

  protected static String getSafariExtensionsEnableCommand(){
    return "defaults write com.apple.Safari ExtensionsEnabled 1";
  }

}
