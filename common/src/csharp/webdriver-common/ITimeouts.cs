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
    /// Defines the interface through which the user can define timeouts.
    /// </summary>
    public interface ITimeouts
    {
        /// <summary>
        /// Specifies the amount of time the driver should wait when searching for an
        /// element if it is not immediately present.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.</param>
        /// <returns>A self reference</returns>
        /// <remarks>
        /// When searching for a single element, the driver should poll the page
        /// until the element has been found, or this timeout expires before throwing
        /// a <see cref="NoSuchElementException"/>. When searching for multiple elements,
        /// the driver should poll the page until at least one element has been found
        /// or this timeout has expired.
        /// <para>
        /// Increasing the implicit wait timeout should be used judiciously as it
        /// will have an adverse effect on test run time, especially when used with
        /// slower location strategies like XPath.
        /// </para>
        /// </remarks>
        ITimeouts ImplicitlyWait(TimeSpan timeToWait);
    }
}
