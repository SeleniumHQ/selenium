package org.openqa.selenium.safari.applescripts;

import com.google.common.base.Throwables;

import org.openqa.selenium.safari.helpers.CLICommandExecutor;
import org.openqa.selenium.safari.helpers.InstallationHtml;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.logging.Logger;

public class AppleScripts {

  private static final Logger logger = Logger.getLogger(AppleScripts.class.getName());

  public static final
  String
      TELL_APPLICATION_SAFARI_TO_QUIT =
      "tell application \"Safari\" to quit";



  public static CLICommandExecutor askKeychainIfSafariIsInstalled(File outputFile) {
    String command = "do shell script \"security find-generic-password -l 'Safari Extensions List'"
                     + " -g ~/Library/Keychains/login.keychain > "
                     + outputFile.getAbsolutePath()
                     + " 2>&1\"";

    return writeAndExecuteAppleScript(command);
  }


  public static void activateExtensionViaGui(File extension) {
    logger.info("Activating plugin " + extension.getAbsolutePath() + " through GUI");

    String command = "do shell script \"open " + extension.getAbsolutePath() + "\"\n"
                     + "\n"
                     + "repeat\n"
                     + "\tif application \"Safari\" is running then exit repeat\n"
                     + "\tdelay 1\n"
                     + "end repeat\n"
                     + "\n"
                     + "delay 1\n"
                     + "\n"
                     + "tell application \"System Events\"\n"
                     + "\ttell process \"Safari\"\n"
                     + "\t\tclick button \"Install\" of window 1\n"
                     + "\tend tell\n"
                     + "end tell";

    writeAndExecuteAppleScript(command);
  }

  public static void tellSafariToQuit() {
    writeAndExecuteAppleScript(TELL_APPLICATION_SAFARI_TO_QUIT);
  }


  public static void notifySafariDriverInstallation() {
    File tempHtml = new File("/tmp/installing_safari_driver.html");

    try {
      writeStringToFile(tempHtml, InstallationHtml.getHtml());
      tellSafariToOpenFile(tempHtml);
    } catch (FileNotFoundException e) {
      logger.warning(
          String.format(
              "Error %s while notifying user that SafariDriver is being installed\n%s",
              e.getMessage(),
              Throwables.getStackTraceAsString(e)));
    }


  }

  public static void tellSafariToOpenFile(File fileToOpen) {
    String command = "tell application \"Safari\"\n"
                     + "\topen location \"file://" + fileToOpen.getAbsolutePath() + "\"\n"
                     + "\tactivate\n"
                     + "end tell";

    writeAndExecuteAppleScript(command);
  }

  protected static CLICommandExecutor writeAndExecuteAppleScript(String command) {
    File tempAppleScript = new File("/tmp/test.scpt");
    logger.info("Executing AppleScript Command " + tempAppleScript.getAbsolutePath());
    CLICommandExecutor cliCommand = null;
    try {
      writeStringToFile(tempAppleScript, command);
      cliCommand = new CLICommandExecutor("osascript " + tempAppleScript.getAbsolutePath());

      logger.info(String.format("Execution of command %s results:\nexit code: %s"
                                + "\nstandard out: %s\nstandard error: %s",
                                tempAppleScript.getAbsolutePath(),
                                cliCommand.getExitCode(),
                                cliCommand.getStandardOut(),
                                cliCommand.getStandardError()));

    } catch (InterruptedException e) {
      logger.warning(String.format("Exception while executing %s: %s\n%s",
                                   tempAppleScript.getAbsolutePath(),
                                   e.getMessage(),
                                   Throwables.getStackTraceAsString(e)));

    } catch (IOException e) {
      logger.warning(String.format("Exception while executing %s: %s\n%s",
                                   tempAppleScript.getAbsolutePath(),
                                   e.getMessage(),
                                   Throwables.getStackTraceAsString(e)));

    }

    return cliCommand;

  }


  protected static void writeStringToFile(File outputFile, String string)
      throws FileNotFoundException {
    PrintStream out = null;

    out = new PrintStream(new FileOutputStream(outputFile));
    out.print(string);
  }
}
