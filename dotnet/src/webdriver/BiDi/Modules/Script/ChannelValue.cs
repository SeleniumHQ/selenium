namespace OpenQA.Selenium.BiDi.Modules.Script;

public record ChannelValue : LocalValue
{
    public string Type => "channel";
}

public record ChannelProperties(Channel Channel)
{
    public SerializationOptions? SerializationOptions { get; set; }

    public ResultOwnership? Ownership { get; set; }
}
