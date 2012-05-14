/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.HashMap;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.web.servlet.handler.RequestHandler;

/**
 * registering an already existing node assumes the node has been restarted, and all the resources
 * are free again
 * 
 * @author freynaud
 */
public class AddingProxyAgainFreesResources {

  private static Registry registry;

  private static Map<String, Object> ff = new HashMap<String, Object>();
  private static RemoteProxy p1;
  private static RequestHandler handler;
  private static RequestHandler handler2;
  private static TestSession session = null;

  /**
   * create a hub with 1 node accepting 1 FF
   * 
   * @throws InterruptedException
   */
  @BeforeClass
  public static void setup() throws InterruptedException {
    registry = Registry.newInstance();
    ff.put(APP, "FF");
    p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
    registry.add(p1);

   
    
    handler = GridHelper.createNewSessionHandler(registry, ff);

    // use all the spots ( so 1 ) of the grid so that a queue builds up
    handler.process();
    session = handler.getSession();
    
    // the test has been assigned.
    Assert.assertNotNull(session);

    // add the request to the queue

    handler2 = GridHelper.createNewSessionHandler(registry, ff);
    new Thread(new Runnable() { // Thread safety reviewed
      public void run() {
        handler2.process();
      }
    }).start();
    // the 1 slot of the node is used.
    Assert.assertEquals(1, p1.getTotalUsed());
   
    // registering the node again should discard the existing test. The node
    // will be fresh as far as the grid is concerned so the 2nd test that
    // was waiting in the queue should be processed.
    registry.add(p1);

  }

  @Test(timeout = 1000)
  public void validateRequest2isNowRunningOnTheNode() throws InterruptedException {
    Thread.sleep(250);
    Assert.assertNotNull(handler2.getSession());
  }

  @AfterClass
  public static void teardown() {
    registry.stop();
  }
}
