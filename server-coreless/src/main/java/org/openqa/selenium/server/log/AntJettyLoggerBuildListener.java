/**
 * 
 */
package org.openqa.selenium.server.log;

import org.apache.commons.logging.Log;
import org.apache.tools.ant.BuildEvent;
import org.apache.tools.ant.BuildListener;
import org.apache.tools.ant.Project;

public class AntJettyLoggerBuildListener implements BuildListener {
    final Log log;
    
    public AntJettyLoggerBuildListener(Log log) {
        this.log = log;
    }
    
    public void messageLogged(BuildEvent event) {
        int priority = event.getPriority();
        switch (priority) {
            case Project.MSG_INFO:
                log.info(event.getMessage(), event.getException());
                break;
            case Project.MSG_WARN:
                log.warn(event.getMessage(), event.getException());
                break;
            case Project.MSG_ERR:
                log.error(event.getMessage(), event.getException());
                break;
            case Project.MSG_DEBUG:
            case Project.MSG_VERBOSE:
            default:
                log.debug(event.getMessage(), event.getException());
        }
        
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
    
}