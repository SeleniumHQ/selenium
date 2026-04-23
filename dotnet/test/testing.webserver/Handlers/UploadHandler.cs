// <copyright file="UploadHandler.cs" company="Selenium Committers">
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

public static class UploadHandler
{
    public static async Task<IResult> Handle(HttpContext context)
    {
        var form = await context.Request.ReadFormAsync();
        string content = string.Empty;

        var uploadFile = form.Files["upload"];
        if (uploadFile is not null)
        {
            using var reader = new StreamReader(uploadFile.OpenReadStream());
            content = await reader.ReadToEndAsync();
        }

        // Slow down the upload so we can verify WebDriver waits.
        await Task.Delay(2500);

        string html = content + "<script>window.top.window.onUploadDone();</script>";

        return Results.Content(html, "text/html; charset=utf-8");
    }
}
