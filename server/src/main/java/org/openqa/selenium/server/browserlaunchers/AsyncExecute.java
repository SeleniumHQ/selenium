/*
 * Created on Mar 17, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.io.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.apache.tools.ant.taskdefs.condition.*;

/** A handy wrapper around Ant's Execute class that can spawn a process
 * and return the process handle so you can close it yourself later
 *  @author dfabulich
 *
 */
class AsyncExecute extends Execute {
    File workingDirectory ;
    Project project;
    boolean useVMLauncher = true; 
    
    public AsyncExecute() {
        project = new Project();
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
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                project.log("interruption in the sleep after having spawned a process",
                    Project.MSG_VERBOSE);
            }
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
}