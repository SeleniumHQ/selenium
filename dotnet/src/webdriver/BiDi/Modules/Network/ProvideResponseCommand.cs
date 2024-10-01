using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class ProvideResponseCommand(ProvideResponseCommandParameters @params) : Command<ProvideResponseCommandParameters>(@params);

internal record ProvideResponseCommandParameters(Request Request) : CommandParameters
{
    public BytesValue? Body { get; set; }

    public IEnumerable<SetCookieHeader>? Cookies { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? ReasonPhrase { get; set; }

    public long? StatusCode { get; set; }
}

public record ProvideResponseOptions : CommandOptions
{
    public BytesValue? Body { get; set; }

    public IEnumerable<SetCookieHeader>? Cookies { get; set; }

    public IEnumerable<Header>? Headers { get; set; }

    public string? ReasonPhrase { get; set; }

    public long? StatusCode { get; set; }
}
