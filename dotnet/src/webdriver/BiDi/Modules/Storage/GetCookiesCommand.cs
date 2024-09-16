using OpenQA.Selenium.BiDi.Communication;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Storage;

internal class GetCookiesCommand(GetCookiesCommandParameters @params) : Command<GetCookiesCommandParameters>(@params);

internal record GetCookiesCommandParameters : CommandParameters
{
    public CookieFilter? Filter { get; set; }

    public PartitionDescriptor? Partition { get; set; }
}

public record GetCookiesOptions : CommandOptions
{
    public CookieFilter? Filter { get; set; }

    public PartitionDescriptor? Partition { get; set; }
}

public record GetCookiesResult(IReadOnlyList<Network.Cookie> Cookies, PartitionKey PartitionKey);

public class CookieFilter
{
    public string? Name { get; set; }

    public Network.BytesValue? Value { get; set; }

    public string? Domain { get; set; }

    public string? Path { get; set; }

    public long? Size { get; set; }

    public bool? HttpOnly { get; set; }

    public bool? Secure { get; set; }

    public Network.SameSite? SameSite { get; set; }

    public DateTimeOffset? Expiry { get; set; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(BrowsingContextPartitionDescriptor), "context")]
[JsonDerivedType(typeof(StorageKeyPartitionDescriptor), "storageKey")]
public abstract record PartitionDescriptor;

public record BrowsingContextPartitionDescriptor(BrowsingContext.BrowsingContext Context) : PartitionDescriptor;

public record StorageKeyPartitionDescriptor : PartitionDescriptor
{
    public string? UserContext { get; set; }

    public string? SourceOrigin { get; set; }
}
