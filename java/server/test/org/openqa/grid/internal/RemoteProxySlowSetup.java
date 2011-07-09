package org.openqa.grid.internal;

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
    registry = new Registry();
    // create 2 proxy that are equal and have a slow onRegistration
    // p1.equals(p2) = true
    p1 = new SlowRemoteSetup(registry);
    p2 = new SlowRemoteSetup(registry);
  }

  // the first onRegistration should be executed, but the 2nd shouldn't.
  @Test
  public void addDup() throws InterruptedException {
    new Thread(new Runnable() {
      public void run() {
        registry.add(p1);
      }
    }).start();
    new Thread(new Runnable() {
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

class SlowRemoteSetup extends RemoteProxy implements RegistrationListener {

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

  public SlowRemoteSetup(Registry registry) {
    super(new RegistrationRequest(), registry);
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