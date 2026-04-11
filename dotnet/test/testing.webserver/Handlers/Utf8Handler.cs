// <copyright file="Utf8Handler.cs" company="Selenium Committers">
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

using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace OpenQA.Selenium.Testing.WebServer.Handlers;

public static class Utf8Handler
{
    public static async Task<IResult> Handle(HttpContext context, string path, string webContentRoot)
    {
        string filePath = Path.Combine(webContentRoot, path);

        if (!File.Exists(filePath))
        {
            return Results.NotFound();
        }

        string content = await File.ReadAllTextAsync(filePath);

        return Results.Content(content, "text/html; charset=UTF-8");
    }
}
