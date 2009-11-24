package org.openqa.selenium.server.log;

import org.apache.commons.logging.Log;
import org.apache.tools.ant.BuildEvent;
import org.apache.tools.ant.BuildListener;
import org.apache.tools.ant.Project;

/**
 * Listener that can be registered to be notified when things happened during a Ant task/build.
 * Used in SeleniumDriverResourceHander and browser launchers.
 */
public class AntJettyLoggerBuildListener implements BuildListener {
    
    private final Log logger;
    
    public AntJettyLoggerBuildListener(Log logger) {
        this.logger = logger;
    }

    public void buildFinished(BuildEvent event) {
        messageLogged(event);
    }

    public void buildStarted(BuildEvent event) {
        messageLogged(event);
    }

    public void targetFinished(BuildEvent event) {
        messageLogged(event);
    }

    public void targetStarted(BuildEvent event) {
        messageLogged(event);
    }

    public void taskFinished(BuildEvent event) {
        messageLogged(event);
    }

    public void taskStarted(BuildEvent event) {
        messageLogged(event);
    }

    /**
     * Signals a message logging event.
     */
    public void messageLogged(BuildEvent event) {
        final int priority;

        priority = event.getPriority();
        switch (priority) {
            case Project.MSG_INFO:
                logger.info(event.getMessage(), event.getException());
                break;
            case Project.MSG_WARN:
                logger.warn(event.getMessage(), event.getException());
                break;
            case Project.MSG_ERR:
                logger.error(event.getMessage(), event.getException());
                break;
            case Project.MSG_DEBUG:
            case Project.MSG_VERBOSE:
            default:
                logger.debug(event.getMessage(), event.getException());
        }
        
    }
    

}