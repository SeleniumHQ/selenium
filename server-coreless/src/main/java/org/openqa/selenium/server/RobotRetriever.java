package org.openqa.selenium.server;

import java.awt.Robot;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;

public class RobotRetriever {
    static Log log = LogFactory.getLog(RobotRetriever.class);
    private static Robot robot;
    public static synchronized Robot getRobot() throws InterruptedException, ExecutionException, TimeoutException {
        if (robot != null) return robot;
        FutureTask<Robot> robotRetriever = new FutureTask<Robot>(new Retriever());
        log.info("Creating Robot");
        Thread retrieverThread = new Thread(robotRetriever, "robotRetriever");
        retrieverThread.start();
        robot = robotRetriever.get(10, TimeUnit.SECONDS);
        return robot;
    }
    
    private static class Retriever implements Callable<Robot> {

        public Robot call() throws Exception {
            return new Robot();
        }
        
    }
}
