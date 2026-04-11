// <copyright file="CreatePageHandler.cs" company="Selenium Committers">
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

using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace OpenQA.Selenium.Testing.WebServer.Handlers;

public static class CreatePageHandler
{
    public static async Task<IResult> Handle(HttpContext context, ConcurrentDictionary<string, string> pages, int port)
    {
        string body;
        using (var reader = new StreamReader(context.Request.Body))
        {
            body = await reader.ReadToEndAsync();
        }

        var json = JsonSerializer.Deserialize<Dictionary<string, string>>(body);
        string content = json!["content"];

        string fileName = $"page{Guid.NewGuid():N}.html";
        pages[fileName] = content;

        string hostname = context.Request.Host.Host;
        string url = $"http://{hostname}:{port}/common/temp/{fileName}";

        return Results.Text(url, "text/plain");
    }

    public static IResult ServePage(string fileName, ConcurrentDictionary<string, string> pages)
    {
        if (pages.TryGetValue(fileName, out string? content))
        {
            return Results.Content(content, "text/html; charset=utf-8");
        }

        return Results.NotFound();
    }
}
