// <copyright file="CaptureScreenshotCommand.cs" company="Selenium Committers">
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
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed class CaptureScreenshotCommand(CaptureScreenshotParameters @params)
    : Command<CaptureScreenshotParameters, CaptureScreenshotResult>(@params, "browsingContext.captureScreenshot");

internal sealed record CaptureScreenshotParameters(BrowsingContext Context, ScreenshotOrigin? Origin, ImageFormat? Format, ClipRectangle? Clip) : Parameters;

public sealed class CaptureScreenshotOptions : CommandOptions
{
    public ScreenshotOrigin? Origin { get; set; }

    public ImageFormat? Format { get; set; }

    public ClipRectangle? Clip { get; set; }
}

public enum ScreenshotOrigin
{
    Viewport,
    Document
}

public record struct ImageFormat(string Type)
{
    public double? Quality { get; set; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(BoxClipRectangle), "box")]
[JsonDerivedType(typeof(ElementClipRectangle), "element")]
public abstract record ClipRectangle;

public sealed record BoxClipRectangle(double X, double Y, double Width, double Height) : ClipRectangle;

public sealed record ElementClipRectangle(Script.ISharedReference Element) : ClipRectangle;

public sealed record CaptureScreenshotResult(string Data) : EmptyResult
{
    public static implicit operator byte[](CaptureScreenshotResult captureScreenshotResult) => captureScreenshotResult.ToByteArray();

    public byte[] ToByteArray() => System.Convert.FromBase64String(Data);
}
