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

package org.openqa.grid.internal.listeners;

/**
 * To be implemented by a class extending RemoteProxy
 */
public interface RegistrationListener {

  /**
   * Will be run before the proxy you register is added to the Registry, letting you run the
   * configuration / validation necessary before the proxy becomes accessible to the clients.
   * <p/>
   * <p/>
   * If an exception is thrown, the proxy won't be registered.
   */
  public void beforeRegistration();

}
