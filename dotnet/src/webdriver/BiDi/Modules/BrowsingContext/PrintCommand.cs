using OpenQA.Selenium.BiDi.Communication;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class PrintCommand(PrintCommandParameters @params) : Command<PrintCommandParameters>(@params);

internal record PrintCommandParameters(BrowsingContext Context) : CommandParameters
{
    public bool? Background { get; set; }

    public PrintMargin? Margin { get; set; }

    public PrintOrientation? Orientation { get; set; }

    public PrintPage? Page { get; set; }

    public IEnumerable<PrintPageRange>? PageRanges { get; set; }

    public double? Scale { get; set; }

    public bool? ShrinkToFit { get; set; }
}

public record PrintOptions : CommandOptions
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

public record PrintResult(string Data)
{
    public byte[] ToByteArray() => Convert.FromBase64String(Data);
}
