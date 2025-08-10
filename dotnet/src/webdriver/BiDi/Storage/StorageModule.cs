// <copyright file="StorageModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Storage;

public sealed class StorageModule(Broker broker) : Module(broker)
{
    public async Task<GetCookiesResult> GetCookiesAsync(GetCookiesOptions? options = null)
    {
        var @params = new GetCookiesCommandParameters(options?.Filter, options?.Partition);

        return await Broker.ExecuteCommandAsync<GetCookiesCommand, GetCookiesResult>(new GetCookiesCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<DeleteCookiesResult> DeleteCookiesAsync(DeleteCookiesOptions? options = null)
    {
        var @params = new DeleteCookiesCommandParameters(options?.Filter, options?.Partition);

        return await Broker.ExecuteCommandAsync<DeleteCookiesCommand, DeleteCookiesResult>(new DeleteCookiesCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<SetCookieResult> SetCookieAsync(PartialCookie cookie, SetCookieOptions? options = null)
    {
        var @params = new SetCookieCommandParameters(cookie, options?.Partition);

        return await Broker.ExecuteCommandAsync<SetCookieCommand, SetCookieResult>(new SetCookieCommand(@params), options).ConfigureAwait(false);
    }
}
