/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface through which the user can locate a given frame or window.
    /// </summary>
    public interface ITargetLocator
    {
        /// <summary>
        /// Select a frame by its (zero-based) index.
        /// </summary>
        /// <param name="frameIndex">The zero-based index of the frame to select.</param>
        /// <returns>An <see cref="IWebDriver"/> instance focused on the specified frame.</returns>
        /// <exception cref="NoSuchFrameException">If the frame cannot be found.</exception>
        /// <remarks>The <see cref="Frame(System.Int32)"/> method finds frames by numeric index,
        /// and the index is zero-based.That is, if a page has three frames, the first frame 
        /// would be at index "0", the second at index "1" and the third at index "2". Once 
        /// the frame has been selected, all subsequent calls on the IWebDriver interface are
        /// made to that frame.
        /// </remarks>
        IWebDriver Frame(int frameIndex);

        /// <summary>
        /// Select a frame by its name or ID.
        /// </summary>
        /// <param name="frameName">The name of the frame to select.</param>
        /// <returns>An <see cref="IWebDriver"/> instance focused on the specified frame.</returns>
        /// <exception cref="NoSuchFrameException">If the frame cannot be found.</exception>
        /// <remarks>The <see cref="Frame(System.String)"/> method selects a frame by its 
        /// name or ID. To select sub-frames, simply separate the frame names/IDs by dots.
        /// As an example "main.child" will select the frame with the name "main" and then
        /// it's child "child". If a frame name is a number, then it will be treated as 
        /// selecting a frame as if using <see cref="Frame(System.Int32)"/>.
        /// </remarks>
        IWebDriver Frame(string frameName);

        /// <summary>
        /// Switches the focus of future commands for this driver to the window with the given name.
        /// </summary>
        /// <param name="windowName">The name of the window to select.</param>
        /// <returns>An <see cref="IWebDriver"/> instance focused on the given window.</returns>
        /// <exception cref="NoSuchWindowException">If the window cannot be found.</exception>
        IWebDriver Window(string windowName);

        /// <summary>
        /// Selects either the first frame on the page or the main document when a page contains iframes.
        /// </summary>
        /// <returns>An <see cref="IWebDriver"/> instance focused on the default frame.</returns>
        IWebDriver DefaultContent();

        /// <summary>
        /// Switches to the element that currently has the focus, or the body element 
        /// if no element with focus can be detected.
        /// </summary>
        /// <returns>An <see cref="IWebElement"/> instance representing the element 
        /// with the focus, or the body element if no element with focus can be detected.</returns>
        IWebElement ActiveElement();
    }
}
