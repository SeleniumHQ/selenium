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

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Interface describing a class designed to wait for a condition.
    /// </summary>
    /// <typeparam name="TSource">The type of object used to detect the condition.</typeparam>
    public interface IWait<TSource>
    {
        /// <summary>
        /// Waits until a condition is true or times out.
        /// </summary>
        /// <typeparam name="TResult">The type of result to expect from the condition.</typeparam>
        /// <param name="condition">A delegate taking a TSource as its parameter, and returning a TResult.</param>
        /// <returns>If TResult is a boolean, the method returns <see langword="true"/> when the condition is true, and <see langword="false"/> otherwise.
        /// If TResult is an object, the method returns the object when the condition evaluates to a value other than <see langword="null"/>.</returns>
        /// <exception cref="ArgumentException">Thrown when TResult is not boolean or an object type.</exception>
        TResult Until<TResult>(Func<TSource, TResult> condition);
    }
}