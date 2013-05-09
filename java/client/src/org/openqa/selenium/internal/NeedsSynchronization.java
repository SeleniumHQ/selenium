/*
Portions copyright 2013 Software Freedom Conservancy

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

package org.openqa.selenium.internal;

/**
 * This interface indicates that the implementing class that also implement Lock needs to
 * run 'lock' and 'unlock' methods in a block synchronized on an object returned by getSyncObject.
 */
public interface NeedsSynchronization {

  /**
   * @return An object that should be used to synchronize calls to 'lock' and 'unlock' methods.
   */
  Object getSyncObject();
}
