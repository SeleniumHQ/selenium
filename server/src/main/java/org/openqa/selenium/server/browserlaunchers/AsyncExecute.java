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

import java.io.*;
import java.util.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.apache.tools.ant.taskdefs.condition.*;
import org.apache.tools.ant.types.*;

/** A handy wrapper around Ant's Execute class that can spawn a process
 * and return the process handle so you can close it yourself later
 *  @author dfabulich
 *
 */
public class AsyncExecute extends Execute {
    File workingDirectory ;
    Project project;
    boolean useVMLauncher = true; 
    
    public AsyncExecute() {
        project = new Project();
    }
    
    /** Sleeps without explicitly throwing an InterruptedException
     * 
     * @param timeout the amout of time to sleep
     * @throws RuntimeException wrapping an InterruptedException if one gets thrown
     */
    public static void sleepTight(long timeout) {
        try {
            Thread.sleep(timeout);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
    
    /**
     * Copied from spawn, but actually returns the Process, instead of void
     * @return the spawned process handle
     */
    public Process asyncSpawn() throws IOException {
        if (workingDirectory != null && !workingDirectory.exists()) {
            throw new BuildException(workingDirectory + " doesn't exist.");
        }
        final Process process = launch(project, getCommandline(),
                                       getEnvironment(), workingDirectory,
                                       useVMLauncher);
        if (Os.isFamily("windows")) {
            AsyncExecute.sleepTight(1000);
        }

        OutputStream dummyOut = new OutputStream() {
            public void write(int b) throws IOException {
            }
        };

        ExecuteStreamHandler streamHandler = new PumpStreamHandler(dummyOut);
        streamHandler.setProcessErrorStream(process.getErrorStream());
        streamHandler.setProcessOutputStream(process.getInputStream());
        streamHandler.start();
        process.getOutputStream().close();

        project.log("spawned process " + process.toString(), Project.MSG_VERBOSE);
        return process;
    }
    
    public static boolean isAlive(Process p) {
        try {
            p.exitValue();
        } catch (IllegalThreadStateException e) {
            return true;
        }
        return false;
    }

    public static int waitForProcessDeath(Process p, long timeout) {
        ProcessWaiter pw = new ProcessWaiter(p);
        Thread waiter = new Thread(pw);
        waiter.start();
        try {
            waiter.join(timeout);
        } catch (InterruptedException e) {
            throw new RuntimeException("Bug? Main interrupted while waiting for process", e);
        }
        if (waiter.isAlive()) {
            waiter.interrupt();
        }
        InterruptedException ie = pw.getException();
        if (ie != null) {
            throw new RuntimeException("Timeout waiting for process to die", ie);
        }
        return p.exitValue();
        
    }
    
    private static class ProcessWaiter implements Runnable {

        private InterruptedException t;
        private Process p;
        
        public InterruptedException getException() {
            return t;
        }
        
        public ProcessWaiter(Process p) {
            this.p = p;
        }
        
        public void run() {
            try {
                p.waitFor();
            } catch (InterruptedException t) {
                this.t = t;
            }
        }
    }
    
    /** Searches the path for the specified executable
     * 
     * @param exec the executable name to search for
     * @return the executable, or null if the executable could not be found
     */
    public static File whichExec(String exec) {
        Path p = null;
        String pathStr = WindowsUtils.getPath();
        if (pathStr != null) p = new Path(new Project(), pathStr);
        if (p != null) {
            String[] dirs = p.list();
            for (int i = 0; i < dirs.length; i++) {
                File executableFile = new File(dirs[i], exec);
                if (executableFile.exists()) {
                    return executableFile;
                }
            }
        }
        return null;
    }
}