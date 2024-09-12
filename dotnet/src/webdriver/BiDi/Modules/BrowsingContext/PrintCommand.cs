using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class PrintCommand(PrintCommandParameters @params) : Command<PrintCommandParameters>(@params);

internal record PrintCommandParameters(BrowsingContext Context) : CommandParameters
{
    public bool? Background { get; set; }

    public Margin? Margin { get; set; }

    public Orientation? Orientation { get; set; }

    public Page? Page { get; set; }

    // TODO: It also supports strings
    public IEnumerable<long>? PageRanges { get; set; }

    public double? Scale { get; set; }

    public bool? ShrinkToFit { get; set; }
}

public record PrintOptions : CommandOptions
{
    public bool? Background { get; set; }

    public Margin? Margin { get; set; }

    public Orientation? Orientation { get; set; }

    public Page? Page { get; set; }

    // TODO: It also supports strings
    public IEnumerable<long>? PageRanges { get; set; }

    public double? Scale { get; set; }

    public bool? ShrinkToFit { get; set; }
}

public struct Margin
{
    public double? Bottom { get; set; }

    public double? Left { get; set; }

    public double? Right { get; set; }

    public double? Top { get; set; }
}

public enum Orientation
{
    Portrait,
    Landscape
}

public struct Page
{
    public double? Height { get; set; }

    public double? Width { get; set; }
}

public record PrintResult(string Data);
