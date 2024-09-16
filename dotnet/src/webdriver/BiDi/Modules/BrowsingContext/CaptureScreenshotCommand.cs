using OpenQA.Selenium.BiDi.Communication;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class CaptureScreenshotCommand(CaptureScreenshotCommandParameters @params) : Command<CaptureScreenshotCommandParameters>(@params);

internal record CaptureScreenshotCommandParameters(BrowsingContext Context) : CommandParameters
{
    public Origin? Origin { get; set; }

    public ImageFormat? Format { get; set; }

    public ClipRectangle? Clip { get; set; }
}

public record CaptureScreenshotOptions : CommandOptions
{
    public Origin? Origin { get; set; }

    public ImageFormat? Format { get; set; }

    public ClipRectangle? Clip { get; set; }
}

public enum Origin
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

public record BoxClipRectangle(double X, double Y, double Width, double Height) : ClipRectangle;

public record ElementClipRectangle(Script.SharedReference Element) : ClipRectangle;

public record CaptureScreenshotResult(string Data)
{
    public byte[] ToByteArray() => System.Convert.FromBase64String(Data);
}
