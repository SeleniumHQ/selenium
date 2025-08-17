// <copyright file="WebExtensionModule.cs" company="Selenium Committers">
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
// </copyright>

using OpenQA.Selenium.BiDi.Communication;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.WebExtension;

public sealed class WebExtensionModule(Broker broker) : Module(broker)
{
    public async Task<InstallResult> InstallAsync(ExtensionData extensionData, InstallOptions? options = null)
    {
        var @params = new InstallParameters(extensionData);

        return await Broker.ExecuteCommandAsync<InstallCommand, InstallResult>(new InstallCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> UninstallAsync(Extension extension, UninstallOptions? options = null)
    {
        var @params = new UninstallParameters(extension);

        return await Broker.ExecuteCommandAsync<UninstallCommand, EmptyResult>(new UninstallCommand(@params), options).ConfigureAwait(false);
    }
}
