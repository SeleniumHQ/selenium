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


package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.ID;

import java.util.HashMap;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.listeners.RegistrationListener;

public class RemoteProxySlowSetup {

  private static RemoteProxy p1;
  private static RemoteProxy p2;

  private static Registry registry;

  @BeforeClass
  public static void setup() {
    registry = Registry.newInstance();
    // create 2 proxy that are equal and have a slow onRegistration
    // p1.equals(p2) = true
    RegistrationRequest req1 = new RegistrationRequest();
    Map<String, Object> config1 = new HashMap<String, Object>();
    config1.put(ID, "abc");
    req1.setConfiguration(config1);
    p1 = new SlowRemoteSetup(req1,registry);
    
    RegistrationRequest req2 = new RegistrationRequest();
    Map<String, Object> config2 = new HashMap<String, Object>();
    config2.put(ID, "abc2");
    req2.setConfiguration(config2);
    p2 = new SlowRemoteSetup(req2,registry);
  }

  // the first onRegistration should be executed, but the 2nd shouldn't.
  @Test
  public void addDup() throws InterruptedException {
    new Thread(new Runnable() { // Thread safety reviewed
      public void run() {
        registry.add(p1);
      }
    }).start();
    new Thread(new Runnable() { // Thread safety reviewed
      public void run() {
        registry.add(p2);
      }
    }).start();
    Thread.sleep(1500);

    // check that the beforeRegistration has only been called once.
    Assert.assertFalse(SlowRemoteSetup.error);
    // and there is only 1 proxy registered at the end.
    Assert.assertEquals(1, registry.getAllProxies().size());

  }

  @AfterClass
  public static void teardown() {
    registry.stop();
  }
}


class SlowRemoteSetup extends BaseRemoteProxy implements RegistrationListener {

  boolean flag = false;
  static boolean error = false;

  // update flag to true. It should happen only once, so if flag is already
  // true, set error to true.
  private synchronized void updateFlag() {
    if (flag) {
      error = true;
    }
    flag = true;
  }

  public SlowRemoteSetup(RegistrationRequest req,Registry registry) {
    super(req, registry);
  }

  public void beforeRegistration() {
    try {
      updateFlag();
      Thread.sleep(1000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  @Override
  public boolean equals(Object obj) {
    return true;
  }

  @Override
  public int hashCode() {
    return 42;
  }

}
