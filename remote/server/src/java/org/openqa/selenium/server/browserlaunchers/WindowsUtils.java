/*
 * Copyright 2006 ThoughtWorks, Inc.
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
package org.openqa.selenium.server.browserlaunchers;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.logging.Log;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.taskdefs.ExecTask;
import org.apache.tools.ant.taskdefs.Execute;
import org.apache.tools.ant.types.Environment;
import org.openqa.jetty.log.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

public class WindowsUtils {

    static Log log = LogFactory.getLog(WindowsUtils.class);
    private static final boolean THIS_IS_WINDOWS = File.pathSeparator.equals(";");
    private static String wmic = null;
    private static File wbem = null;
    private static String taskkill = null;
    private static String reg = null; 
    	//"C:\\NTRESKIT\\reg.exe";
    private static Boolean regVersion1 = null;
    private static Properties env = null;
    
    /**
     * @param args
     * @throws IOException 
     */
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.out.println("Kills Windows processes by matching their command lines");
            System.out.println("usage: " + WindowsUtils.class.getName() + " command arg1 arg2 ...");
        }
        kill(args);

    }
    
    /** Kill processes by name */
    public static void killByName(String name) {
        Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setExecutable("taskkill");
        Environment.Variable path = new Environment.Variable();
        path.setKey(getExactPathEnvKey());
        path.setFile(findWBEM());
        exec.addEnv(path);
        exec.setTaskType("taskkill");
        exec.setFailonerror(false);
        exec.createArg().setValue("/f");
        exec.createArg().setValue("/im");
        exec.createArg().setValue(name);
        exec.setResultProperty("result");
        exec.setOutputproperty("output");
        exec.execute();
        String result = p.getProperty("result");
        String output = p.getProperty("output");
        log.info(output);
        if (!"0".equals(result)) {
            throw new WindowsRegistryException("exec return code " + result + ": " + output);
        }
        
    }
    
    /** Kill processes by name, log and ignore errors */
    public static void tryToKillByName(String name) {
        if (!thisIsWindows()) return;
        try {
            killByName(name);
        } catch (WindowsRegistryException e) {
            log.warn(e);
        }
    }

    /** Searches the process list for a process with the specified command line and kills it
     * 
     * @param cmdarray the array of command line arguments
     * @throws Exception if something goes wrong while reading the process list or searching for your command line
     */
    public static void kill(String[] cmdarray) throws Exception {
        StringBuffer pattern = new StringBuffer();
        File executable = new File(cmdarray[0]);
        /* For the first argument, the executable, Windows may modify
         * the start path in any number of ways.  Ignore a starting quote
         * if any (\"?), non-greedily look for anything up until the last
         * backslash (.*?\\\\), then look for the executable's filename,
         * then finally ignore a final quote (\"?)
         */
        // TODO We should be careful, in case Windows has ~1-ified the executable name as well
        pattern.append("\"?.*?\\\\");
        pattern.append(executable.getName());
        pattern.append("\"?");
        for (int i = 1; i < cmdarray.length; i++) {
            /* There may be a space, but maybe not (\\s?), may be a quote or maybe not (\"?),
             * but then turn on block quotation (as if *everything* had a regex backslash in front of it)
             * with \Q.  Then look for the next argument (which may have ?s, \s, "s, who knows),
             * turning off block quotation.  Now ignore a final quote if any (\"?)
             */
            pattern.append("\\s?\"?\\Q");
            String arg = cmdarray[i];
            pattern.append(arg);
            pattern.append("\\E\"?");
        }
        pattern.append("\\s*");
        Pattern cmd = Pattern.compile(pattern.toString(), Pattern.CASE_INSENSITIVE);
        Map procMap = procMap();
        boolean killedOne = false;
        for (Iterator i = procMap.keySet().iterator(); i.hasNext();) {
            String commandLine = (String) i.next();
            if (commandLine == null) continue;
            Matcher m = cmd.matcher(commandLine);
            if (m.matches()) {
                String processID = (String) procMap.get(commandLine);
                StringBuffer logMessage = new StringBuffer("Killing PID ");
                logMessage.append(processID);
                logMessage.append(": ");
                logMessage.append(commandLine);
                log.info(logMessage);
                killPID(processID);
                log.info("Killed");
                killedOne = true;
            }
        }
        if (!killedOne) {
            StringBuffer errorMessage = new StringBuffer("Didn't find any matches for");
            for (int i = 0; i < cmdarray.length; i++) {
                errorMessage.append(" '");
                errorMessage.append(cmdarray[i]);
                errorMessage.append('\'');
            }
            log.warn(errorMessage);
        }
    }

    /** Kills the specified process ID */
    private static void killPID(String processID) {
        Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setExecutable("taskkill");
        Environment.Variable path = new Environment.Variable();
        path.setKey(getExactPathEnvKey());
        path.setFile(findWBEM());
        exec.addEnv(path);
        exec.setTaskType("taskkill");
        exec.setFailonerror(false);
        exec.createArg().setValue("/pid");
        exec.createArg().setValue(processID);
        exec.setResultProperty("result");
        exec.setOutputproperty("output");
        exec.execute();
        String result = p.getProperty("result");
        String output = p.getProperty("output");
        log.info(output);
        if (!"0".equals(result)) {
            throw new WindowsRegistryException("exec return code " + result + ": " + output);
        }
    }
    
    /** Returns a map of process IDs to command lines
     * 
     * @return a map of process IDs to command lines
     * @throws Exception - if something goes wrong while reading the process list
     */
    public static Map procMap() throws Exception {
        Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setTaskType("wmic");
        exec.setExecutable(findWMIC());
        exec.setFailonerror(true);
        exec.createArg().setValue("process");
        exec.createArg().setValue("list");
        exec.createArg().setValue("full");
        exec.createArg().setValue("/format:rawxml.xsl");
        exec.setOutputproperty("proclist");
        log.info("Reading Windows Process List...");
        exec.execute();
        log.info("Done, searching for processes to kill...");
        // WMIC drops an ugly zero-length batch file; clean that up
        File TempWmicBatchFile = new File("TempWmicBatchFile.bat");
        if (TempWmicBatchFile.exists()) TempWmicBatchFile.delete();
        String output = p.getProperty("proclist");
        // TODO This would be faster if it used SAX instead of DOM
        Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new ByteArrayInputStream(output.getBytes()));
        NodeList procList = doc.getElementsByTagName("INSTANCE");
        Map<String, String> processes = new HashMap<String, String>();
        for (int i = 0; i < procList.getLength(); i++) {
            Element process = (Element) procList.item(i);
            NodeList propList = process.getElementsByTagName("PROPERTY");
            Map<String, Object> procProps = new HashMap<String, Object>();
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
            String processID = (String) procProps.get("ProcessId");
            String commandLine = (String) procProps.get("CommandLine");
            processes.put(commandLine, processID);
        }
        return processes;
    }
    
    /** Returns the current process environment variables
     * 
     * @return the current process environment variables
     */
    public static synchronized Properties loadEnvironment() {
        if (env != null) return env;
        // DGF lifted directly from Ant's Property task
        env = new Properties();
        Vector osEnv = Execute.getProcEnvironment();
        for (Enumeration e = osEnv.elements(); e.hasMoreElements();) {
            String entry = (String) e.nextElement();
            int pos = entry.indexOf('=');
            if (pos == -1) {
                log.warn("Ignoring: " + entry);
            } else {
                env.put(entry.substring(0, pos),
                entry.substring(pos + 1));
            }
        }
        return env;
    }
    
    /** Retrieve the exact case-sensitive name of the "Path" environment variable,
     * which may be any one of "PATH", "Path" or "path".
     * @return the exact case-sensitive name of the "Path" environment variable
     */
    public static String getExactPathEnvKey() {
        loadEnvironment();
        for (Iterator i = env.keySet().iterator(); i.hasNext();) {
            String key = (String) i.next();
            if (key.equalsIgnoreCase("PATH")) return key;
        }
        // They don't have a path???
        return "PATH";
    }
    
    public static String getPath() {
        loadEnvironment();
        return getEnvVarIgnoreCase("PATH");
    }
    
    /** Returns the path to the Windows Program Files.  On non-English versions,
     * this is not necessarily "C:\Program Files".
     * @return the path to the Windows Program Files
     */
    public static String getProgramFilesPath() {
        loadEnvironment();
        String pf = getEnvVarIgnoreCase("ProgramFiles");
        if (pf != null) {
            File ProgramFiles = new File(pf);
            if (ProgramFiles.exists()) return ProgramFiles.getAbsolutePath();
        } 
        return new File("C:\\Program Files").getAbsolutePath();
    }
    
    /** Returns the path to Local AppData.  For different users, this will be
     * different.
     * 
     * @return the path to Local AppData
     */
    public static String getLocalAppDataPath() {
        loadEnvironment();
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
        loadEnvironment();
        for (Iterator i = env.keySet().iterator(); i.hasNext();) {
            String key = (String) i.next();
            if (key.equalsIgnoreCase(var)) return env.getProperty(key);
        }
        return null;
    }
    
    /** Finds the system root directory, e.g. "c:\windows" or "c:\winnt" */
    public static File findSystemRoot() {
        Properties p = loadEnvironment();
        String systemRootPath = (String) p.get("SystemRoot");
        if (systemRootPath == null) systemRootPath = (String) p.get("SYSTEMROOT");
        if (systemRootPath == null) systemRootPath = (String) p.get("systemroot");
        if (systemRootPath == null) throw new RuntimeException("SystemRoot apparently not set!");
        File systemRoot = new File(systemRootPath);
        if (!systemRoot.exists()) throw new RuntimeException("SystemRoot doesn't exist: " + systemRootPath);
        return systemRoot;
    }    
    
    /** Finds WMIC.exe
     * 
     * @return the exact path to wmic.exe, or just the string "wmic" if it couldn't be found (in which case you can pass that to exec to try to run it from the path)
     */
    public static String findWMIC() {
        if (wmic != null) return wmic;
        findWBEM();
        if (null != wbem) {
            File wmicExe = new File(findWBEM(), "wmic.exe");
            if (wmicExe.exists()) {
                wmic = wmicExe.getAbsolutePath();
                return wmic;
            }
        }
        log.warn("Couldn't find wmic! Hope it's on the path...");
        wmic = "wmic";
        return wmic;
    }
    
    /** Finds the WBEM directory in the systemRoot directory
     * 
     * @return the WBEM directory, or <code>null</code> if it couldn't be found
     */
    public static File findWBEM() {
        if (wbem != null) return wbem;
        File systemRoot = findSystemRoot();
        wbem = new File(systemRoot, "system32/wbem");
        if (!wbem.exists()) {
            log.error("Couldn't find wbem!");
            return null;
        }
        return wbem;
    }
    
    /** Finds taskkill.exe
     * 
     * @return the exact path to taskkill.exe, or just the string "taskkill" if it couldn't be found (in which case you can pass that to exec to try to run it from the path)
     */
    public static String findTaskKill() {
        if (taskkill != null) return taskkill;
        File systemRoot = findSystemRoot();
        File taskkillExe = new File(systemRoot, "system32/taskkill.exe");
        if (taskkillExe.exists()) {
            taskkill = taskkillExe.getAbsolutePath();
            return taskkill;
        }
        log.warn("Couldn't find taskkill! Hope it's on the path...");
        taskkill = "taskkill";
        return taskkill;
    }
    
    /** Finds reg.exe
     * 
     * @return the exact path to reg.exe, or just the string "reg" if it couldn't be found (in which case you can pass that to exec to try to run it from the path)
     */
    public static String findReg() {
        if (reg != null) return reg;
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
        regExe = AsyncExecute.whichExec("reg.exe");
        if (regExe != null && regExe.exists()) {
        	reg = regExe.getAbsolutePath();
        	return reg;
        }
    	log.error("OS Version: " + System.getProperty("os.version"));
        throw new WindowsRegistryException("Couldn't find reg.exe!\n" +
			"Please download it from Microsoft and install it in a standard location.\n" +
			"See here for details: http://wiki.openqa.org/display/SRC/Windows+Registry+Support");
    }
    
    public static boolean isRegExeVersion1() {
    	if (regVersion1 != null) return regVersion1.booleanValue();
    	Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setTaskType("reg");
        exec.setExecutable(findReg());
        exec.setFailonerror(false);
        exec.createArg().setValue("/?");
        exec.setOutputproperty("regout");
        exec.setResultProperty("result");
        exec.execute();
        String output = p.getProperty("regout");
        boolean version1 = output.indexOf("version 1.0") != -1;
        regVersion1 = new Boolean(version1);
        return version1;
    }
    
    public static Class discoverRegistryKeyType(String key) {
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
            throw new WindowsRegistryException(r.value + " was not a REG_SZ or a REG_EXPAND_SZ (String): " + type);
        }
        String value = m.group(2);
        return value;
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
        if (0 == value) return false;
        if (1 == value) return true;
        throw new WindowsRegistryException(r.value + " was not either 0 or 1: " + value);
    }
    
    public static boolean doesRegistryValueExist(String key) {
        
    	Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setTaskType("reg");
        exec.setExecutable(findReg());
        exec.setFailonerror(false);
        exec.createArg().setValue("query");
        if (isRegExeVersion1()) {
        	exec.createArg().setValue(key);
        } else {
        	RegKeyValue r = new RegKeyValue(key);
            exec.createArg().setValue(r.key);
            exec.createArg().setValue("/v");
            exec.createArg().setValue(r.value);
        }
        exec.setOutputproperty("regout");
        exec.setResultProperty("result");
        exec.execute();
        int result = Integer.parseInt(p.getProperty("result"));
        if (0 == result) return true;
        return false;
    }
    
    public static void writeStringRegistryValue(String key, String data) throws WindowsRegistryException {
        
    	Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setTaskType("reg");
        exec.setExecutable(findReg());
        exec.setFailonerror(false);
        exec.setResultProperty("result");
        exec.setOutputproperty("output");
        if (isRegExeVersion1()) {
            if (doesRegistryValueExist(key)) {
                exec.createArg().setValue("update");
            } else {
                exec.createArg().setValue("add");
            }
        	exec.createArg().setValue(key + "=" + data);
        } else {
            exec.createArg().setValue("add");
        	RegKeyValue r = new RegKeyValue(key);
        	exec.createArg().setValue(r.key);
            exec.createArg().setValue("/v");
            exec.createArg().setValue(r.value);
            exec.createArg().setValue("/d");
            exec.createArg().setValue(data);
            exec.createArg().setValue("/f");
        }
        exec.execute();
        String result = p.getProperty("result");
        String output = p.getProperty("output");
        if (!"0".equals(result)) {
            throw new WindowsRegistryException("exec return code " + result + ": " + output);
        }
    }
    
    public static void writeIntRegistryValue(String key, int data) {
        Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setTaskType("reg");
        exec.setExecutable(findReg());
        exec.setFailonerror(false);
        exec.setResultProperty("result");
        exec.setOutputproperty("output");
        if (isRegExeVersion1()) {
            if (doesRegistryValueExist(key)) {
                exec.createArg().setValue("update");
                exec.createArg().setValue(key + "=" + Integer.toString(data));
            } else {
                exec.createArg().setValue("add");
                exec.createArg().setValue(key + "=" + Integer.toString(data));
                exec.createArg().setValue("REG_DWORD");
            }
        } else {
            exec.createArg().setValue("add");
        	RegKeyValue r = new RegKeyValue(key);
        	exec.createArg().setValue(r.key);
            exec.createArg().setValue("/v");
            exec.createArg().setValue(r.value);
            exec.createArg().setValue("/t");
            exec.createArg().setValue("REG_DWORD");
            exec.createArg().setValue("/d");
            exec.createArg().setValue(Integer.toString(data));
            exec.createArg().setValue("/f");
        }
        exec.execute();
        String result = p.getProperty("result");
        String output = p.getProperty("output");
        if (!"0".equals(result)) {
            throw new WindowsRegistryException("exec return code " + result + ": " + output);
        }
    }
    
    public static void writeBooleanRegistryValue(String key, boolean data) {
        writeIntRegistryValue(key, data?1:0);
    }
    
    public static void deleteRegistryValue(String key) {
        Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setTaskType("reg");
        exec.setExecutable(findReg());
        exec.setFailonerror(false);
        exec.setResultProperty("result");
        exec.setOutputproperty("output");
        if (isRegExeVersion1()) {
        	exec.createArg().setValue("delete");
            exec.createArg().setValue(key);
            exec.createArg().setValue("/FORCE");
        } else {
        	RegKeyValue r = new RegKeyValue(key);
        	exec.createArg().setValue("delete");
            exec.createArg().setValue(r.key);
            exec.createArg().setValue("/v");
            exec.createArg().setValue(r.value);
            exec.createArg().setValue("/f");
        }
        exec.execute();
        String result = p.getProperty("result");
        String output = p.getProperty("output");
        if (!"0".equals(result)) {
            throw new WindowsRegistryException("exec return code " + result + ": " + output);
        }
    }

    /** Executes reg.exe to query the registry */
    private static String runRegQuery(String key) {
        Project p = new Project();
        ExecTask exec = new ExecTask();
        exec.setProject(p);
        exec.setTaskType("reg");
        exec.setExecutable(findReg());
        exec.setFailonerror(false);
        exec.setResultProperty("result");
        exec.setOutputproperty("output");
        exec.createArg().setValue("query");
        if (isRegExeVersion1()) {
        	exec.createArg().setValue(key);
        } else {
        	RegKeyValue r = new RegKeyValue(key);
            exec.createArg().setValue(r.key);
            exec.createArg().setValue("/v");
            exec.createArg().setValue(r.value);
        }
        exec.setOutputproperty("regout");
        exec.execute();
        String output = p.getProperty("regout");
        return output;
    }
    
    private static class RegKeyValue {
    	private String key;
    	private String value;
    	public RegKeyValue(String path) {
    		int i = path.lastIndexOf('\\');
    		key = path.substring(0,i);
    		value = path.substring(i+1);
    	}
    }
    
    /** Returns true if the current OS is MS Windows; false otherwise
     * 
     * @return true if the current OS is MS Windows; false otherwise
     */
    public static boolean thisIsWindows() {
        return THIS_IS_WINDOWS;
    }
    
    @SuppressWarnings("serial")
	static class WindowsRegistryException extends RuntimeException {
        WindowsRegistryException(Exception e) {
            super(generateMessage(), e);
        }
        
        private static String generateMessage() {
            return "Problem while managing the registry, OS Version '" + 
            System.getProperty("os.version") + "', regVersion1 = " + regVersion1;
        }
        
        WindowsRegistryException(String message) {
            this(new RuntimeException(message));
        }
    }
}
