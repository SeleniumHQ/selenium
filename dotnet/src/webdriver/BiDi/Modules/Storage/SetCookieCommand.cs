using OpenQA.Selenium.BiDi.Communication;
using System;

namespace OpenQA.Selenium.BiDi.Modules.Storage;

internal class SetCookieCommand(SetCookieCommandParameters @params) : Command<SetCookieCommandParameters>(@params);

internal record SetCookieCommandParameters(PartialCookie Cookie) : CommandParameters
{
    public PartitionDescriptor? Partition { get; set; }
}

public record PartialCookie(string Name, Network.BytesValue Value, string Domain)
{
    public string? Path { get; set; }

    public bool? HttpOnly { get; set; }

    public bool? Secure { get; set; }

    public Network.SameSite? SameSite { get; set; }

    public DateTimeOffset? Expiry { get; set; }
}

public record SetCookieOptions : CommandOptions
{
    public PartitionDescriptor? Partition { get; set; }
}

public record SetCookieResult(PartitionKey PartitionKey);
