// <copyright file="SleepHandler.cs" company="Selenium Committers">
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

using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace OpenQA.Selenium.Testing.WebServer.Handlers;

public static class SleepHandler
{
    public static async Task<IResult> Handle(HttpContext context)
    {
        string? duration = context.Request.Query["time"];
        int seconds = int.Parse(duration!);

        await Task.Delay(seconds * 1000);

        string html = $"<html><head><title>Done</title></head><body>Slept for {duration}s</body></html>";

        context.Response.Headers.CacheControl = "no-cache";
        context.Response.Headers.Pragma = "no-cache";
        context.Response.Headers.Expires = "0";

        return Results.Content(html, "text/html; charset=utf-8");
    }
}
