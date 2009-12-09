package org.openqa.selenium.server;

import java.awt.Robot;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;

public class RobotRetriever {

    private static final Log LOGGER = LogFactory.getLog(RobotRetriever.class);
    private static Robot robot;

    private static class Retriever implements Callable<Robot> {

        public Robot call() throws Exception {
            return new Robot();
        }

    }
    
    public static synchronized Robot getRobot() throws InterruptedException, ExecutionException, TimeoutException {
        final FutureTask<Robot> robotRetriever;
        final Thread retrieverThread;

        if (robot != null) {
            return robot;
        }
        robotRetriever = new FutureTask<Robot>(new Retriever());
        LOGGER.info("Creating Robot");
        retrieverThread = new Thread(robotRetriever, "robotRetriever");
        retrieverThread.start();
        robot = robotRetriever.get(10, TimeUnit.SECONDS);

        return robot;
    }
    
}
