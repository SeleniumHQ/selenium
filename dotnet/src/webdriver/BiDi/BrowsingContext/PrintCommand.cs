// <copyright file="PrintCommand.cs" company="Selenium Committers">
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
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed class PrintCommand(PrintCommandParameters @params)
    : Command<PrintCommandParameters, PrintResult>(@params, "browsingContext.print");

internal sealed record PrintCommandParameters(BrowsingContext Context, bool? Background, PrintMargin? Margin, PrintOrientation? Orientation, PrintPage? Page, IEnumerable<PrintPageRange>? PageRanges, double? Scale, bool? ShrinkToFit) : CommandParameters;

public sealed class PrintOptions : CommandOptions
{
    public bool? Background { get; set; }

    public PrintMargin? Margin { get; set; }

    public PrintOrientation? Orientation { get; set; }

    public PrintPage? Page { get; set; }

    public IEnumerable<PrintPageRange>? PageRanges { get; set; }

    public double? Scale { get; set; }

    public bool? ShrinkToFit { get; set; }
}

public struct PrintMargin
{
    public double? Bottom { get; set; }

    public double? Left { get; set; }

    public double? Right { get; set; }

    public double? Top { get; set; }
}

public enum PrintOrientation
{
    Portrait,
    Landscape
}

public struct PrintPage
{
    public double? Height { get; set; }

    public double? Width { get; set; }
}

public readonly record struct PrintPageRange(int? Start, int? End)
{
    public static implicit operator PrintPageRange(int index) { return new PrintPageRange(index, index); }

#if NET8_0_OR_GREATER
    public static implicit operator PrintPageRange(Range range)
    {
        int? start;
        int? end;

        if (range.Start.IsFromEnd && range.Start.Value == 0)
        {
            start = null;
        }
        else
        {
            if (range.Start.IsFromEnd)
            {
                throw new NotSupportedException($"Page index from end ({range.Start}) is not supported in page range for printing.");
            }

            start = range.Start.Value;
        }

        if (range.End.IsFromEnd && range.End.Value == 0)
        {
            end = null;
        }
        else
        {
            if (range.End.IsFromEnd)
            {
                throw new NotSupportedException($"Page index from end ({range.End}) is not supported in page range for printing.");
            }

            end = range.End.Value;
        }

        return new PrintPageRange(start, end);
    }
#endif
}

public sealed record PrintResult(string Data) : EmptyResult
{
    public byte[] ToByteArray() => Convert.FromBase64String(Data);
}
