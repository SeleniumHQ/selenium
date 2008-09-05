package org.openqa.selenium;

import static org.apache.tools.ant.Project.MSG_DEBUG;
import static org.apache.tools.ant.Project.MSG_ERR;
import static org.apache.tools.ant.Project.MSG_INFO;
import static org.apache.tools.ant.Project.MSG_VERBOSE;

import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;

import org.apache.tools.ant.Project;
import org.apache.tools.ant.Task;

public class AntLogHandler extends Handler {

    Project project;
    Task task;
    
    public AntLogHandler(Project project, Task task) {
        this.project = project;
        this.task = task;
    }

    @Override
    public void close() throws SecurityException {}

    @Override
    public void flush() {}

    @Override
    public void publish(LogRecord record) {
        int level = record.getLevel().intValue();
        String message = record.getMessage();
        if (level > Level.INFO.intValue()) {
            project.log(task, message, MSG_ERR);
        } else if (level > Level.CONFIG.intValue()) {
            project.log(task, message, MSG_INFO);
        } else if (level > Level.FINER.intValue()) {
            project.log(task, message, MSG_VERBOSE);
        } else {
            project.log(task, message, MSG_DEBUG);
        }
    }

}
