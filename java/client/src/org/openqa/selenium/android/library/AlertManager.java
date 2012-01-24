/*
Copyright 2011 Software Freedom Conservatory.

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

package org.openqa.selenium.android.library;

import org.openqa.selenium.Alert;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;

/**
 * This tracks manages all alerts and pop-up windows opened by the current views.
 */
public class AlertManager {
  private static BiMap<ViewAdapter, Alert> unhandledAlerts = HashBiMap.create();

  /* package */ static void addAlertForView(ViewAdapter view, AndroidAlert alert) {
    unhandledAlerts.put(view, alert);
  }

  /* package */ static Alert getAlertForView(ViewAdapter view) {
    return unhandledAlerts.get(view);
  }

  /* package */ static void removeAllAlerts() {
    unhandledAlerts.clear();
  }

  /* package */ static void removeAlertForView(ViewAdapter view) {
    unhandledAlerts.remove(view);
  }

  /* package */ static void removeAlert(Alert alert) {
    unhandledAlerts.inverse().remove(alert);
  }
}
