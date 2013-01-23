/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.os;

import static org.openqa.selenium.Platform.WINDOWS;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

import org.openqa.selenium.Platform;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilderFactory;

public class WindowsUtils {

  public static Boolean regVersion1 = null;

  private static Logger LOG = Logger.getLogger(WindowsUtils.class.getName());
  private static final boolean THIS_IS_WINDOWS = Platform.getCurrent().is(WINDOWS);
  private static String wmic = null;
  private static File wbem = null;
  private static String taskkill = null;
  private static String reg = null;
  private static Properties env = null;

  /**
   * @param args
   * @throws Exception
   */
  public static void main(String[] args) throws Exception {
    if (args.length == 0) {
      System.out.println("Kills Windows processes by matching their command lines");
      System.out.println("usage: " + WindowsUtils.class.getName() + " command arg1 arg2 ...");
    }
    kill(args);

  }

  public static void traceWith(Logger log) {
    WindowsUtils.LOG = log;
  }

  /**
   * Kill processes by name
   */
  public static void killByName(String name) {
    executeCommand("taskkill", "/f", "/t", "/im", name);
  }

  /**
   * Kill processes by name, log and ignore errors
   */
  public static void tryToKillByName(String name) {
    if (!thisIsWindows()) {
      return;
    }
    try {
      killByName(name);
    } catch (WindowsRegistryException e) {
      LOG.log(Level.WARNING, "Exception thrown", e);
    }
  }

  /**
   * Searches the process list for a process with the specified command line and kills it
   * 
   * @param cmdarray the array of command line arguments
   * @throws Exception if something goes wrong while reading the process list or searching for your
   *         command line
   */
  public static void kill(String[] cmdarray) throws Exception {
    StringBuilder pattern = new StringBuilder();
    File executable = new File(cmdarray[0]);
    /*
     * For the first argument, the executable, Windows may modify the start path in any number of
     * ways. Ignore a starting quote if any (\"?), non-greedily look for anything up until the last
     * backslash (.*?\\\\), then look for the executable's filename, then finally ignore a final
     * quote (\"?)
     */
    // TODO We should be careful, in case Windows has ~1-ified the executable name as well
    pattern.append("\"?.*?\\\\");
    String execName = executable.getName();
    pattern.append(execName);
    if (!execName.endsWith(".exe")) {
      pattern.append("(\\.exe)?");
    }
    pattern.append("\"?");
    for (int i = 1; i < cmdarray.length; i++) {
      /*
       * There may be a space, but maybe not (\\s?), may be a quote or maybe not (\"?), but then
       * turn on block quotation (as if *everything* had a regex backslash in front of it) with \Q.
       * Then look for the next argument (which may have ?s, \s, "s, who knows), turning off block
       * quotation. Now ignore a final quote if any (\"?)
       */
      pattern.append("\\s?\"?\\Q");
      pattern.append(cmdarray[i]);
      pattern.append("\\E\"?");
    }
    pattern.append("\\s*");
    Pattern cmd = Pattern.compile(pattern.toString(), Pattern.CASE_INSENSITIVE);
    Map<String, String> procMap = procMap();
    boolean killedOne = false;
    for (String commandLine : procMap.keySet()) {
      if (commandLine == null) {
        continue;
      }
      Matcher m = cmd.matcher(commandLine);
      if (m.matches()) {
        String processID = procMap.get(commandLine);
        StringBuilder logMessage = new StringBuilder("Killing PID ");
        logMessage.append(processID);
        logMessage.append(": ");
        logMessage.append(commandLine);
        LOG.info(logMessage.toString());
        killPID(processID);
        LOG.info("Killed");
        killedOne = true;
      }
    }
    if (!killedOne) {
      StringBuilder errorMessage = new StringBuilder("Didn't find any matches for");
      for (String arg : cmdarray) {
        errorMessage.append(" '");
        errorMessage.append(arg);
        errorMessage.append('\'');
      }
      LOG.warning(errorMessage.toString());
    }
  }

  /**
   * Kills the specified process ID
   */
  private static void killPID(String processID) {
    executeCommand("taskkill", "/f", "/pid", processID);
  }

  /**
   * Returns a map of process IDs to command lines
   * 
   * @return a map of process IDs to command lines
   * @throws Exception - if something goes wrong while reading the process list
   */
  public static Map<String, String> procMap() throws Exception {
    LOG.info("Reading Windows Process List...");
    String output = executeCommand(findWMIC(), "process", "list", "full", "/format:rawxml.xsl");
    // exec.setFailonerror(true);
    LOG.info("Done, searching for processes to kill...");
    // WMIC drops an ugly zero-length batch file; clean that up
    File tempWmicBatchFile = new File("TempWmicBatchFile.bat");
    if (tempWmicBatchFile.exists()) {
      tempWmicBatchFile.delete();
    }

    // TODO This would be faster if it used SAX instead of DOM
    Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder()
        .parse(new ByteArrayInputStream(output.getBytes()));
    NodeList procList = doc.getElementsByTagName("INSTANCE");
    Map<String, String> processes = new HashMap<String, String>();
    for (int i = 0; i < procList.getLength(); i++) {
      Element process = (Element) procList.item(i);
      NodeList propList = process.getElementsByTagName("PROPERTY");
      Map<String, String> procProps = new HashMap<String, String>();
      for (int j = 0; j < propList.getLength(); j++) {
        Element property = (Element) propList.item(j);
        String propName = property.getAttribute("NAME");
        NodeList valList = property.getElementsByTagName("VALUE");
        String value = null;
        if (valList.getLength() != 0) {
          Element valueElement = (Element) valList.item(0);
          Text valueNode = (Text) valueElement.getFirstChild();
          value = valueNode.getData();
        }
        procProps.put(propName, value);
      }
      String processID = procProps.get("ProcessId");
      String commandLine = procProps.get("CommandLine");
      processes.put(commandLine, processID);
    }
    return processes;
  }

  /**
   * Returns the current process environment variables
   * 
   * @return the current process environment variables
   */
  public static synchronized Properties loadEnvironment() {
    if (env != null) {
      return env;
    }
    env = new Properties();
    for (Map.Entry<String, String> entry : System.getenv().entrySet()) {
      env.put(entry.getKey(), entry.getValue());
    }
    return env;
  }

  /**
   * Returns the path to the Windows Program Files. On non-English versions, this is not necessarily
   * "C:\Program Files".
   * 
   * @return the path to the Windows Program Files
   */
  public static String getProgramFilesPath() {
    return getEnvVarPath("ProgramFiles", "C:\\Program Files");
  }

  public static String getProgramFiles86Path() {
    return getEnvVarPath("ProgramFiles(x86)", "C:\\Program Files (x86)");
  }

  private static String getEnvVarPath(final String envVar, final String defaultValue) {
    String pf = getEnvVarIgnoreCase(envVar);
    if (pf != null) {
      File programFiles = new File(pf);
      if (programFiles.exists()) {
        return programFiles.getAbsolutePath();
      }
    }
    return new File(defaultValue).getAbsolutePath();
  }

  public static ImmutableList<String> getPathsInProgramFiles(final String childPath) {
    return new ImmutableList.Builder<String>()
        .add(getFullPath(WindowsUtils.getProgramFilesPath(), childPath))
        .add(getFullPath(WindowsUtils.getProgramFiles86Path(), childPath))
        .build();
  }

  private static String getFullPath(String parent, String child) {
    return new File(parent, child).getAbsolutePath();
  }

  /**
   * Returns the path to Local AppData. For different users, this will be different.
   * 
   * @return the path to Local AppData
   */
  public static String getLocalAppDataPath() {
    final String keyLocalAppData =
        "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders\\Local AppData";
    String localAppDataPath = readStringRegistryValue(keyLocalAppData);
    String userProfile = getEnvVarIgnoreCase("USERPROFILE");
    if (userProfile != null) {
      return localAppDataPath.replace("%USERPROFILE%", userProfile);
    }
    return localAppDataPath;
  }

  public static String getEnvVarIgnoreCase(String var) {
    Properties p = loadEnvironment();
    for (String key : p.stringPropertyNames()) {
      if (key.equalsIgnoreCase(var)) {
        return env.getProperty(key);
      }
    }
    return null;
  }

  /**
   * Finds the system root directory, e.g. "c:\windows" or "c:\winnt"
   */
  public static File findSystemRoot() {
    Properties p = loadEnvironment();
    String systemRootPath = p.getProperty("SystemRoot");
    if (systemRootPath == null) {
      systemRootPath = p.getProperty("SYSTEMROOT");
    }
    if (systemRootPath == null) {
      systemRootPath = p.getProperty("systemroot");
    }
    if (systemRootPath == null) {
      throw new RuntimeException("SystemRoot apparently not set!");
    }
    File systemRoot = new File(systemRootPath);
    if (!systemRoot.exists()) {
      throw new RuntimeException("SystemRoot doesn't exist: " + systemRootPath);
    }
    return systemRoot;
  }

  /**
   * Finds WMIC.exe
   * 
   * @return the exact path to wmic.exe, or just the string "wmic" if it couldn't be found (in which
   *         case you can pass that to exec to try to run it from the path)
   */
  public static String findWMIC() {
    if (wmic != null) {
      return wmic;
    }
    findWBEM();
    if (null != wbem) {
      File wmicExe = new File(findWBEM(), "wmic.exe");
      if (wmicExe.exists()) {
        wmic = wmicExe.getAbsolutePath();
        return wmic;
      }
    }
    LOG.warning("Couldn't find wmic! Hope it's on the path...");
    wmic = "wmic";
    return wmic;
  }

  /**
   * Finds the WBEM directory in the systemRoot directory
   * 
   * @return the WBEM directory, or <code>null</code> if it couldn't be found
   */
  public static File findWBEM() {
    if (wbem != null) {
      return wbem;
    }
    File systemRoot = findSystemRoot();
    wbem = new File(systemRoot, "system32/wbem");
    if (!wbem.exists()) {
      LOG.severe("Couldn't find wbem!");
      return null;
    }
    return wbem;
  }

  /**
   * Finds taskkill.exe
   * 
   * @return the exact path to taskkill.exe, or just the string "taskkill" if it couldn't be found
   *         (in which case you can pass that to exec to try to run it from the path)
   */
  public static String findTaskKill() {
    if (taskkill != null) {
      return taskkill;
    }
    File systemRoot = findSystemRoot();
    File taskkillExe = new File(systemRoot, "system32/taskkill.exe");
    if (taskkillExe.exists()) {
      taskkill = taskkillExe.getAbsolutePath();
      return taskkill;
    }
    LOG.warning("Couldn't find taskkill! Hope it's on the path...");
    taskkill = "taskkill";
    return taskkill;
  }

  /**
   * Finds reg.exe
   * 
   * @return the exact path to reg.exe, or just the string "reg" if it couldn't be found (in which
   *         case you can pass that to exec to try to run it from the path)
   */
  public static String findReg() {
    if (reg != null) {
      return reg;
    }
    File systemRoot = findSystemRoot();
    File regExe = new File(systemRoot, "system32/reg.exe");
    if (regExe.exists()) {
      reg = regExe.getAbsolutePath();
      return reg;
    }
    regExe = new File("c:\\ntreskit\\reg.exe");
    if (regExe.exists()) {
      reg = regExe.getAbsolutePath();
      return reg;
    }
    reg = new ExecutableFinder().find("reg.exe");
    if (reg != null) {
      return reg;
    }
    LOG.severe("OS Version: " + System.getProperty("os.version"));
    throw new WindowsRegistryException("Couldn't find reg.exe!\n" +
        "Please download it from Microsoft and install it in a standard location.\n"
        +
        "See here for details: http://wiki.openqa.org/display/SRC/Windows+Registry+Support");
  }

  public static boolean isRegExeVersion1() {
    if (regVersion1 != null) {
      return regVersion1.booleanValue();
    }

    String output = executeCommand(findReg(), "/?");
    boolean version1 = output.indexOf("version 1.0") != -1;
    regVersion1 = Boolean.valueOf(version1);
    return version1;
  }

  public static Class<?> discoverRegistryKeyType(String key) {
    if (!doesRegistryValueExist(key)) {
      return null;
    }
    RegKeyValue r = new RegKeyValue(key);
    String output = runRegQuery(key);
    Pattern pat;
    if (isRegExeVersion1()) {
      pat = Pattern.compile("\\s*(REG_\\S+)");
    } else {
      pat = Pattern.compile("\\Q" + r.value + "\\E\\s+(REG_\\S+)\\s+(.*)");
    }
    Matcher m = pat.matcher(output);
    if (!m.find()) {
      throw new WindowsRegistryException("Output didn't look right: " + output);
    }
    String type = m.group(1);
    if ("REG_SZ".equals(type) || "REG_EXPAND_SZ".equals(type)) {
      return String.class;
    } else if ("REG_DWORD".equals(type)) {
      return int.class;
    } else {
      throw new WindowsRegistryException("Unknown type: " + type);
    }
  }

  public static String readStringRegistryValue(String key) {
    RegKeyValue r = new RegKeyValue(key);
    String output = runRegQuery(key);
    Pattern pat;
    if (isRegExeVersion1()) {
      pat = Pattern.compile("\\s*(REG_\\S+)\\s+\\Q" + r.value + "\\E\\s+(.*)");
    } else {
      pat = Pattern.compile("\\Q" + r.value + "\\E\\s+(REG_\\S+)\\s+(.*)");
    }
    Matcher m = pat.matcher(output);
    if (!m.find()) {
      throw new WindowsRegistryException("Output didn't look right: " + output);
    }
    String type = m.group(1);
    if (!"REG_SZ".equals(type) && !"REG_EXPAND_SZ".equals(type)) {
      throw new WindowsRegistryException(
          r.value + " was not a REG_SZ or a REG_EXPAND_SZ (String): " + type);
    }
    
    return m.group(2);
  }

  public static int readIntRegistryValue(String key) {
    RegKeyValue r = new RegKeyValue(key);
    String output = runRegQuery(key);
    Pattern pat;
    if (isRegExeVersion1()) {
      pat = Pattern.compile("\\s*(REG_\\S+)\\s+\\Q" + r.value + "\\E\\s+(.*)");
    } else {
      pat = Pattern.compile("\\Q" + r.value + "\\E\\s+(REG_\\S+)\\s+0x(.*)");
    }

    Matcher m = pat.matcher(output);
    if (!m.find()) {
      throw new WindowsRegistryException("Output didn't look right: " + output);
    }
    String type = m.group(1);
    if (!"REG_DWORD".equals(type)) {
      throw new WindowsRegistryException(r.value + " was not a REG_DWORD (int): " + type);
    }
    String strValue = m.group(2);
    int value;
    if (isRegExeVersion1()) {
      value = Integer.parseInt(strValue);
    } else {
      value = Integer.parseInt(strValue, 16);
    }
    return value;
  }

  public static boolean readBooleanRegistryValue(String key) {
    RegKeyValue r = new RegKeyValue(key);
    int value = readIntRegistryValue(key);
    if (0 == value) {
      return false;
    }
    if (1 == value) {
      return true;
    }
    throw new WindowsRegistryException(r.value + " was not either 0 or 1: " + value);
  }

  public static boolean doesRegistryValueExist(String key) {
    List<String> args = Lists.newArrayList();
    args.add("query");

    if (isRegExeVersion1()) {
      args.add(key);
    } else {
      RegKeyValue r = new RegKeyValue(key);
      args.add(r.key);
      args.add("/v");
      args.add(r.value);
    }

    try {
      executeCommand(findReg(), args.toArray(new String[args.size()]));
      return true;
    } catch (WindowsRegistryException e) {
      return false;
    }
  }

  public static void writeStringRegistryValue(String key, String data)
      throws WindowsRegistryException {
    List<String> args = new ArrayList<String>();
    if (isRegExeVersion1()) {
      if (doesRegistryValueExist(key)) {
        args.add("update");
      } else {
        args.add("add");
      }
      args.add(key + "=" + data);
    } else {
      args.add("add");
      RegKeyValue r = new RegKeyValue(key);
      args.add(r.key);
      args.add("/v");
      args.add(r.value);
      args.add("/d");
      args.add(data);
      args.add("/f");
    }

    executeCommand(findReg(), args.toArray(new String[args.size()]));
  }

  private static String executeCommand(String commandName, String... args) {
    CommandLine cmd = new CommandLine(commandName, args);
    cmd.execute();

    String output = cmd.getStdOut();
    if (!cmd.isSuccessful()) {
      throw new WindowsRegistryException("exec return code " + cmd.getExitCode() + ": " + output);
    }
    return output;
  }

  public static void writeIntRegistryValue(String key, int data) {
    List<String> args = new ArrayList<String>();
    if (isRegExeVersion1()) {
      if (doesRegistryValueExist(key)) {
        args.add("update");
        args.add(key + "=" + Integer.toString(data));
      } else {
        args.add("add");
        args.add(key + "=" + Integer.toString(data));
        args.add("REG_DWORD");
      }
    } else {
      args.add("add");
      RegKeyValue r = new RegKeyValue(key);
      args.add(r.key);
      args.add("/v");
      args.add(r.value);
      args.add("/t");
      args.add("REG_DWORD");
      args.add("/d");
      args.add(Integer.toString(data));
      args.add("/f");
    }

    executeCommand(findReg(), args.toArray(new String[args.size()]));
  }

  public static void writeBooleanRegistryValue(String key, boolean data) {
    writeIntRegistryValue(key, data ? 1 : 0);
  }

  public static void deleteRegistryValue(String key) {
    List<String> args = new ArrayList<String>();
    if (isRegExeVersion1()) {
      args.add("delete");
      args.add(key);
      args.add("/FORCE");
    } else {
      RegKeyValue r = new RegKeyValue(key);
      args.add("delete");
      args.add(r.key);
      args.add("/v");
      args.add(r.value);
      args.add("/f");
    }

    executeCommand(findReg(), args.toArray(new String[args.size()]));
  }

  /**
   * Executes reg.exe to query the registry
   */
  private static String runRegQuery(String key) {
    List<String> args = new ArrayList<String>();
    args.add("query");
    if (isRegExeVersion1()) {
      args.add(key);
    } else {
      RegKeyValue r = new RegKeyValue(key);
      args.add(r.key);
      args.add("/v");
      args.add(r.value);
    }

    return executeCommand(findReg(), args.toArray(new String[args.size()]));
  }

  private static class RegKeyValue {
    private String key;
    private String value;

    public RegKeyValue(String path) {
      int i = path.lastIndexOf('\\');
      key = path.substring(0, i);
      value = path.substring(i + 1);
    }
  }

  /**
   * Returns true if the current OS is MS Windows; false otherwise
   * 
   * @return true if the current OS is MS Windows; false otherwise
   */
  public static boolean thisIsWindows() {
    return THIS_IS_WINDOWS;
  }

}
