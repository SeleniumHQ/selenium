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

import com.google.common.collect.Sets;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;

import java.util.Set;

public class IntentReceiverRegistrar {
  private final Context context;
  private Set<BroadcastReceiver> receivers;

  public IntentReceiverRegistrar(Context context) {
    this.context = context;
    receivers = Sets.newHashSet();
  }

  public void registerReceiver(BroadcastReceiver receiver, String action) {
    context.registerReceiver(receiver, new IntentFilter(action));
    receivers.add(receiver);
  }

  public void unregisterReceiver(BroadcastReceiver receiver) {
    context.unregisterReceiver(receiver);
  }
  
  public void unregisterAllReceivers() {
    for (BroadcastReceiver r : receivers) {
      try {
        context.unregisterReceiver(r);
      } catch (IllegalArgumentException e) {
        // Ignore, broadcast receiver has already been removed.
      }
    }
  }
}
