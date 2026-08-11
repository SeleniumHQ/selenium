// <copyright file="NetworkEvent.cs" company="Selenium Committers">
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

using static OpenQA.Selenium.BiDi.Network.NetworkJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Network;

public static class NetworkEvent
{
    public static EventDescriptor<BeforeRequestSentEventArgs> BeforeRequestSent { get; } = EventDescriptor<BeforeRequestSentEventArgs>.Create(
        "network.beforeRequestSent",
        Default.BeforeRequestSentEventArgs);

    public static EventDescriptor<ResponseStartedEventArgs> ResponseStarted { get; } = EventDescriptor<ResponseStartedEventArgs>.Create(
        "network.responseStarted",
        Default.ResponseStartedEventArgs);

    public static EventDescriptor<ResponseCompletedEventArgs> ResponseCompleted { get; } = EventDescriptor<ResponseCompletedEventArgs>.Create(
        "network.responseCompleted",
        Default.ResponseCompletedEventArgs);

    public static EventDescriptor<FetchErrorEventArgs> FetchError { get; } = EventDescriptor<FetchErrorEventArgs>.Create(
        "network.fetchError",
        Default.FetchErrorEventArgs);

    public static EventDescriptor<AuthRequiredEventArgs> AuthRequired { get; } = EventDescriptor<AuthRequiredEventArgs>.Create(
        "network.authRequired",
        Default.AuthRequiredEventArgs);
}
