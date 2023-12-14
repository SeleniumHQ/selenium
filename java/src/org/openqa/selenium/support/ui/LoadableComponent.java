// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support.ui;

/**
 * Represents any abstraction of something that can be loaded. This may be an entire web page, or
 * simply a component within that page (such as a login box or menu) or even a service. The expected
 * usage is:
 *
 * <pre class="code">
 * new HypotheticalComponent().get();
 * </pre>
 *
 * <p>After the {@link LoadableComponent#get()} method is called, the component will be loaded and
 * ready for use. This is verified using Assert.assertTrue so expect to catch an Error rather than
 * an Exception when errors occur. *
 *
 * @param <T> The type to be returned (normally the subclass' type)
 */
public abstract class LoadableComponent<T extends LoadableComponent<T>> {
  /**
   * Ensure that the component is currently loaded.
   *
   * @return The component.
   * @throws Error when the component cannot be loaded.
   */
  @SuppressWarnings("unchecked")
  public T get() {
    try {
      isLoaded();
      return (T) this;
    } catch (Error e) {
      load();
    }

    isLoaded();

    return (T) this;
  }

  /**
   * When this method returns, the component modeled by the subclass should be fully loaded. This
   * subclass is expected to navigate to an appropriate page should this be necessary.
   */
  protected abstract void load();

  /**
   * Determine whether or not the component is loaded. When the component is loaded, this method
   * will return, but when it is not loaded, an Error should be thrown. This also allows for complex
   * checking and error reporting when loading a page, which in turn supports better error reporting
   * when a page fails to load.
   *
   * <p>This behaviour makes it readily visible when a page has not been loaded successfully, and
   * because an error and not an exception is thrown tests should fail as expected. By using Error,
   * we also allow the use of junit's "Assert.assert*" methods
   *
   * @throws Error when the page is not loaded.
   */
  protected abstract void isLoaded() throws Error;
}
