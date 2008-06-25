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

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.browserlaunchers.locators.InternetExplorerLocator;

import java.io.File;
import java.io.IOException;

public class InternetExplorerCustomProxyLauncher extends AbstractBrowserLauncher {

    private static final Log LOGGER = LogFactory.getLog(InternetExplorerCustomProxyLauncher.class);

    private File customProxyPACDir;
    private String[] cmdarray;
    private String commandPath;
    private Process process;
    protected boolean customPACappropriate = true;
    protected WindowsProxyManager wpm;

    private static boolean alwaysChangeMaxConnections = false;
    protected boolean changeMaxConnections = alwaysChangeMaxConnections;

    public InternetExplorerCustomProxyLauncher(RemoteControlConfiguration configuration,
                                               String sessionId) {
        this(configuration, sessionId, new InternetExplorerLocator().findBrowserLocationOrFail());
    }

    public InternetExplorerCustomProxyLauncher(RemoteControlConfiguration configuration,
                                               String sessionId, String browserLaunchLocation) {
        super(sessionId, configuration);
        this.commandPath = browserLaunchLocation;
        this.sessionId = sessionId;
        this.wpm = new WindowsProxyManager(true, sessionId, getPort(), getPort());
    }

    protected void changeRegistrySettings() throws IOException {
        wpm.changeRegistrySettings();
    }
    
    @Override
    public void launch(String url) {
        final AsyncExecute exe;

        try {
            setupSystem(url);
            LOGGER.info("Launching Internet Explorer...");
            exe = new AsyncExecute();
            exe.setCommandline(cmdarray);
            process = exe.asyncSpawn();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void setupSystem(String url) throws IOException {
        if (WindowsUtils.thisIsWindows()) {
            final File killableProcessWrapper;

            if (getConfiguration().shouldOverrideSystemProxy()) {
              setupSystemProxy();
            }
            customProxyPACDir = wpm.getCustomProxyPACDir();
            killableProcessWrapper = new File(customProxyPACDir, "killableprocess.exe");
            ResourceExtractor.extractResourcePath(InternetExplorerCustomProxyLauncher.class, "/killableprocess/killableprocess.exe", killableProcessWrapper);
            cmdarray = new String[]{killableProcessWrapper.getAbsolutePath(), commandPath, "-new", url};
        } else {
            // DGF IEs4Linux, perhaps?  It could happen!
            cmdarray = new String[]{commandPath, url};
        }
    }

    public void close() {
        Exception taskKillException = null;
        if (WindowsUtils.thisIsWindows()) {
            if (getConfiguration().shouldOverrideSystemProxy()) {
                restoreSystemProxy();
            }
        }
        if (process == null) return;
        if (false) {
            try {
                // try to kill with windows taskkill
                WindowsUtils.kill(cmdarray);
            } catch (Exception e) {
                taskKillException = e;
            }
        }
        try { // DGF killableprocess.exe should commit suicide if we send it a newline
            process.getOutputStream().write('\n');
            process.getOutputStream().flush();
            Thread.sleep(200);
        } catch (Exception ignored) {}
        AsyncExecute.killProcess(process);
        if (customPACappropriate) {
            try {
                LauncherUtils.recursivelyDeleteDir(customProxyPACDir);
            } catch (RuntimeException e) {
                if (taskKillException != null) {
                    LOGGER.error("Couldn't delete custom IE proxy directory", e);
                    LOGGER.error("Perhaps IE proxy delete error was caused by this exception", taskKillException);
                    throw new RuntimeException("Couldn't delete custom IE " +
                            "proxy directory, presumably because task kill failed; " +
                            "see error log!", e);
                }
                throw e;
            }
        }
    }

    private void restoreSystemProxy() {
        wpm.restoreRegistrySettings();
    }

    public Process getProcess() {
        return process;
    }

    public static void main(String[] args) {
        InternetExplorerCustomProxyLauncher l = new InternetExplorerCustomProxyLauncher(new RemoteControlConfiguration(), "CUSTIE");
        l.launch("http://www.google.com/");
        int seconds = 5;
        System.out.println("Killing browser in " + Integer.toString(seconds) + " seconds");
        AsyncExecute.sleepTight(seconds * 1000);
        l.close();
        System.out.println("He's dead now, right?");
    }


    public static void setChangeMaxConnections(boolean changeMaxConnections) {
        InternetExplorerCustomProxyLauncher.alwaysChangeMaxConnections = changeMaxConnections;
    }

    private void setupSystemProxy() throws IOException {
        wpm.backupRegistrySettings();
        changeRegistrySettings();
    }


}
