#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Storage;

public class PartitionKey
{
    public Browser.UserContext? UserContext { get; set; }

    public string? SourceOrigin { get; set; }
}
