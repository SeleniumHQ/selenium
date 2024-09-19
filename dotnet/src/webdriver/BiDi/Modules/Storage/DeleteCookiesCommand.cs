using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Storage;

internal class DeleteCookiesCommand(DeleteCookiesCommandParameters @params) : Command<DeleteCookiesCommandParameters>(@params);

internal record DeleteCookiesCommandParameters : CommandParameters
{
    public CookieFilter? Filter { get; set; }

    public PartitionDescriptor? Partition { get; set; }
}

public record DeleteCookiesOptions : GetCookiesOptions;

public record DeleteCookiesResult(PartitionKey PartitionKey);
