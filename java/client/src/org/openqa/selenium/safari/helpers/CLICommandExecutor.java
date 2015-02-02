package org.openqa.selenium.safari.helpers;

import com.google.common.base.Throwables;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.logging.Logger;

public class CLICommandExecutor {

  private final String commandToExecute;
  private final int exitCode;
  private final Process process;
  private String  standardError;
  private String  standardOut;

  private static final Logger logger = Logger.getLogger(CLICommandExecutor.class.getName());

  public CLICommandExecutor(String command) throws InterruptedException, IOException {
    this.commandToExecute = command;
    this.process = Runtime.getRuntime().exec(command);
    this.exitCode = process.waitFor();

  }

  public int getExitCode() {
    return exitCode;
  }

  public String getStandardOut() {
    try {
      if (standardOut == null){
        standardOut = readInputStream(process, true);
      }
    } catch (IOException e) {
      logger.warning(
          String.format(
              "Error retrieving Standard Out for command %s\n%s",
              getCommand(),
              Throwables.getStackTraceAsString(e)));
    }

    return standardOut;
  }

  public String getStandardError() {
    try {
      if (standardError == null){
        standardError = readInputStream(process, false);
      }
    } catch (IOException e) {
      logger.warning(
          String.format(
              "Error retrieving Standard Error for command %s\n%s",
              getCommand(),
              Throwables.getStackTraceAsString(e)));
    }

    return standardError;
  }

  public String getCommand() {
    return commandToExecute;
  }


  protected static String readInputStream(Process process, boolean standardOut) throws IOException {
    StringBuffer sb = new StringBuffer();
    InputStreamReader rdr;
    if (standardOut) {
      rdr = new InputStreamReader(process.getInputStream(), "UTF-8");
    } else {
      rdr = new InputStreamReader(process.getErrorStream(), "UTF-8");
    }
    int c;
    try {
      while ((c = rdr.read()) != -1) {
        sb.append((char) c);
      }
      return sb.toString().replaceAll("\n", "");

    } finally {
      rdr.close();
    }
  }

}
