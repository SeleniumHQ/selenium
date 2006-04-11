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

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.PrintStream;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.taskdefs.Delete;

/**
 * Runs the specified command path to start the browser, and kills the process to quit.
 * @author Paul Hammant
 * @version $Revision: 189 $
 */
public class DestroyableRuntimeExecutingBrowserLauncher extends RuntimeExecutingBrowserLauncher {

    /** Specifies a command path to run */
    public DestroyableRuntimeExecutingBrowserLauncher(String commandPath) {
        super(commandPath);
    }

    /** Kills the process */
    public void close() {
        process.destroy();
    }

    protected File createCustomProfileDir(String sessionId) {
        File tmpDir = new File("/tmp");
        String customProfileDirParent = ((tmpDir.exists() && tmpDir.isDirectory()) ? tmpDir.getAbsolutePath() : ".");
        File customProfileDir = new File(customProfileDirParent + "/customProfileDir" + sessionId);
        if (customProfileDir.exists()) {
            recursivelyDeleteDir(customProfileDir);
        }
        customProfileDir.mkdir();
        return customProfileDir;
    }
    
    protected void recursivelyDeleteDir(File customProfileDir) {
        Delete delete = new Delete();
        delete.setProject(new Project());
        delete.setDir(customProfileDir);
        delete.setFailOnError(true);
        delete.execute();
    }
    
    protected void deleteTryTryAgain(File dir, int tries) {
        try {
            recursivelyDeleteDir(dir);
        } catch (BuildException e) {
            if (tries > 0) {
                AsyncExecute.sleepTight(2000);
                deleteTryTryAgain(dir, tries-1);
            } else {
                throw e;
            }
        }
    }
    
    protected File makeProxyPAC(File parentDir, int port) throws FileNotFoundException {
        File proxyPAC = new File(parentDir, "proxy.pac");
        PrintStream out = new PrintStream(new FileOutputStream(proxyPAC));
        out.println("function FindProxyForURL(url, host) {");
        out.println("   if(shExpMatch(url, '*/selenium-server/*')) {");
        out.println("       return 'PROXY localhost:" + Integer.toString(port) + "; DIRECT'");
        out.println("   }");
        out.println("}");
        out.close();
        return proxyPAC;
    }
}
