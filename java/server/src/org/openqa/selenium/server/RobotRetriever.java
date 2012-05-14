/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server;

import java.awt.Robot;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Logger;

public class RobotRetriever {

  private static final Logger log = Logger.getLogger(RobotRetriever.class.getName());
  private static Robot robot;

  private static class Retriever implements Callable<Robot> {

    public Robot call() throws Exception {
      return new Robot();
    }

  }

  public static synchronized Robot getRobot() throws InterruptedException, ExecutionException,
      TimeoutException {
    final FutureTask<Robot> robotRetriever;
    final Thread retrieverThread;

    if (robot != null) {
      return robot;
    }
    robotRetriever = new FutureTask<Robot>(new Retriever());
    log.info("Creating Robot");
    retrieverThread = new Thread(robotRetriever, "robotRetriever");  // Thread safety reviewed
    retrieverThread.start();
    robot = robotRetriever.get(10, TimeUnit.SECONDS);

    return robot;
  }

}
