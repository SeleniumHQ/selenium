/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android.intents;

import java.util.ArrayList;
import java.util.List;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;

public class IntentReceiverRegistrar {
  private final Context context;
  private List<BroadcastReceiver> receivers = new ArrayList<BroadcastReceiver>();

  public IntentReceiverRegistrar(Context context) {
    this.context = context;
  }

  public void registerReceiver(BroadcastReceiver receiver, String action) {
    context.registerReceiver(receiver, new IntentFilter(action));
    receivers.add(receiver);
  }

  public List<BroadcastReceiver> getReceivers() {
    return receivers;
  }

  public void clearReceivers() {
    receivers.clear();
  }
}
