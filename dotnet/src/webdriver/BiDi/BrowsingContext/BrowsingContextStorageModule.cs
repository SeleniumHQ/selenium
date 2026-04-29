// <copyright file="BrowsingContextStorageModule.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Storage;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed class BrowsingContextStorageModule(BrowsingContext context, IStorageModule storageModule) : IBrowsingContextStorageModule
{
    public Task<GetCookiesResult> GetCookiesAsync(ContextGetCookiesOptions? options = null, CancellationToken cancellationToken = default)
    {
        return storageModule.GetCookiesAsync(ContextGetCookiesOptions.WithContext(options, context), cancellationToken);
    }

    public Task<DeleteCookiesResult> DeleteCookiesAsync(ContextDeleteCookiesOptions? options = null, CancellationToken cancellationToken = default)
    {
        return storageModule.DeleteCookiesAsync(ContextDeleteCookiesOptions.WithContext(options, context), cancellationToken);
    }

    public Task<SetCookieResult> SetCookieAsync(PartialCookie cookie, ContextSetCookieOptions? options = null, CancellationToken cancellationToken = default)
    {
        return storageModule.SetCookieAsync(cookie, ContextSetCookieOptions.WithContext(options, context), cancellationToken);
    }
}
