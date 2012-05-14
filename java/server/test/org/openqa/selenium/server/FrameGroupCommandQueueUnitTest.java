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
