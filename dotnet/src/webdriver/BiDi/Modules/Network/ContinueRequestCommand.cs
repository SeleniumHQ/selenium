using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class ContinueRequestCommand(ContinueRequestCommandParameters @params) : Command<ContinueRequestCommandParameters>(@params);

internal record ContinueRequestCommandParameters(Request Request) : CommandParameters
{
    public BytesValue? Body { get; set; }

    public IEnumerable<CookieHeader>? Cookies { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? Method { get; set; }

    public string? Url { get; set; }
}

public record ContinueRequestOptions : CommandOptions
{
    public BytesValue? Body { get; set; }

    public IEnumerable<CookieHeader>? Cookies { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? Method { get; set; }

    public string? Url { get; set; }
}
