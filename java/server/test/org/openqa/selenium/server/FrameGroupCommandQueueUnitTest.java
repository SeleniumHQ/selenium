package org.openqa.selenium.server;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class FrameGroupCommandQueueUnitTest {

  private static String firstSessionId = "session 1";
  private static String firstQueueId = "queue 1";
  private static String secondSessionId = "session 2";
  private static int defaultSpeed = CommandQueue.getSpeed();
  private static int newSpeed = defaultSpeed + 42;

  @Test
  public void testGetGlobalQueueSpeed() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    FrameGroupCommandQueueSet session1 =
        FrameGroupCommandQueueSet.makeQueueSet(firstSessionId,
            RemoteControlConfiguration.DEFAULT_PORT, new RemoteControlConfiguration());
    int sessionSpeedOnInit = session1.getSpeed();
    assertEquals(defaultSpeed, sessionSpeedOnInit);
    FrameGroupCommandQueueSet.clearQueueSet(firstSessionId);
  }

  @Test
  public void testSetGlobalQueueSpeed() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    CommandQueue.setSpeed(newSpeed);
    FrameGroupCommandQueueSet session1 =
        FrameGroupCommandQueueSet.makeQueueSet(firstSessionId,
            RemoteControlConfiguration.DEFAULT_PORT, new RemoteControlConfiguration());
    int sessionSpeedOnInit = session1.getSpeed();
    assertEquals(newSpeed, sessionSpeedOnInit);
    CommandQueue.setSpeed(defaultSpeed);
    FrameGroupCommandQueueSet.clearQueueSet(firstSessionId);
  }

  @Test
  public void testSetSessionSpeedNotGlobalSpeed() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    FrameGroupCommandQueueSet session1 =
        FrameGroupCommandQueueSet.makeQueueSet(firstSessionId,
            RemoteControlConfiguration.DEFAULT_PORT, new RemoteControlConfiguration());
    session1.setSpeed(newSpeed);
    int sessionSpeedOnInit = session1.getSpeed();
    assertEquals(newSpeed, sessionSpeedOnInit);

    FrameGroupCommandQueueSet session2 =
        FrameGroupCommandQueueSet.makeQueueSet(secondSessionId,
            RemoteControlConfiguration.DEFAULT_PORT, new RemoteControlConfiguration());
    int session2SpeedOnInit = session2.getSpeed();
    assertEquals(defaultSpeed, session2SpeedOnInit);

    FrameGroupCommandQueueSet.clearQueueSet(firstSessionId);
    FrameGroupCommandQueueSet.clearQueueSet(secondSessionId);
  }

  @Test
  public void testCommandQueueInitSpeedMatchesSessionSpeed() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    FrameGroupCommandQueueSet session1 =
        FrameGroupCommandQueueSet.makeQueueSet(firstSessionId,
            RemoteControlConfiguration.DEFAULT_PORT, new RemoteControlConfiguration());
    session1.setSpeed(newSpeed);

    CommandQueue queue1 = session1.getCommandQueue(firstQueueId);
    assertEquals(newSpeed, queue1.getQueueDelay());
    assertEquals(defaultSpeed, CommandQueue.getSpeed());

    FrameGroupCommandQueueSet.clearQueueSet(firstSessionId);
  }

}
