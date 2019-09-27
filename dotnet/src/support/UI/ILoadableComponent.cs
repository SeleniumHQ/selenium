// <copyright file="ILoadableComponent.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Interface allows for the component to be used in Nested Component scenarios such that the
    /// child component class does not have to declare the generic type of the parent explicitly.
    /// </summary>
    /// <example>
    /// public class HypotheticalLoadableComponent : LoadableComponent&lt;T&gt; {
    ///   ILoadableComponent parent;
    ///   public HypotheticalLoadableComponent(ILoadableComponent parent) {
    ///     this.parent = parent;
    ///   }
    ///   protected void EvaluateLoadedStatus() { //code to determine loaded state }
    ///   protected void ExecuteLoad() {
    ///     parent.Load();  //loads the parent
    ///     //code to load this component
    ///   }
    /// }
    /// </example>
    public interface ILoadableComponent
    {
        /// <summary>
        /// Loads the component.
        /// </summary>
        /// <returns>A reference to this <see cref="ILoadableComponent"/>.</returns>
        ILoadableComponent Load();
    }
}
