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

package org.openqa.selenium.testworker;

import java.util.concurrent.TimeoutException;

public class TrackableThread extends Thread { // Thread safety reviewed

  private final TrackableRunnable trackedTarget;

  public TrackableThread(TrackableRunnable target, String name) {
    super(target, name);
    trackedTarget = target;
  }

  public TrackableThread(ThreadGroup group, TrackableRunnable target, String name) {
    super(group, target, name);
    trackedTarget = target;
  }

  public TrackableThread(ThreadGroup group, TrackableRunnable target, String name,
      long stackSize) {
    super(group, target, name, stackSize);
    trackedTarget = target;
  }

  @Override
  public synchronized void start() {
    ThreadStartedAt tsa = new ThreadStartedAt();
    trackedTarget.setThreadStartedAt(tsa);
    super.start();
  }

  public void joinOrInterrupt(long millisJoinTimeout, long millisInterruptTimeout) throws Throwable {
    join(millisJoinTimeout);
    if (isAlive()) {
      interrupt();
      join(millisInterruptTimeout);
      if (isAlive()) {
        throw new TimeoutException("Thread refused to die");
      }
    }
    if (trackedTarget.getThrowable() != null) {
      throw new Throwable("Underlying thread had exception", trackedTarget.getThrowable());
    }
  }

  public Object getResult(long millisJoinTimeout, long millisInterruptTimeout) throws Throwable {
    joinOrInterrupt(millisJoinTimeout, millisInterruptTimeout);
    return trackedTarget.getResult();
  }

  public Object getResult() throws Throwable {
    return getResult(10000, 1000);
  }

}
