/*
 * Created on Oct 13, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.lang.reflect.Field;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.browserlaunchers.WindowsUtils;
import org.openqa.selenium.internal.CommandLine;

/** Handy utilities for managing Unix/Linux processes */
public class UnixUtils {
    
    static Log log = LogFactory.getLog(UnixUtils.class);
    
    /** retrieves the pid */
    public static int getProcessId(Process p) {
        if (WindowsUtils.thisIsWindows()) {
            throw new IllegalStateException("UnixUtils may not be used on Windows");
        }
        try {
            Field f = p.getClass().getDeclaredField("pid");
            f.setAccessible(true);
            Integer pid = (Integer) f.get(p);
            return pid;
        } catch (Exception e) {
            throw new RuntimeException("Couldn't detect pid", e);
        }
    }
    
    /** runs "kill -9" on the specified pid */
    public static void kill9(Integer pid) {
        log.debug("kill -9 " + pid);

        CommandLine command = new CommandLine("kill", "-9", pid.toString());
        command.execute();
        String result = command.getStdOut();
        int output = command.getExitCode();
        log.debug(output);
        if (!command.isSuccessful()) {
            throw new RuntimeException("exec return code " + result + ": " + output);
        }
    }
    
    /** runs "kill -9" on the specified process */
    public static void kill9(Process p) {
        kill9(getProcessId(p));
    }
}
