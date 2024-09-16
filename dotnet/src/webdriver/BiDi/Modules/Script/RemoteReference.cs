namespace OpenQA.Selenium.BiDi.Modules.Script;

public abstract record RemoteReference : LocalValue;

public record SharedReference(string SharedId) : RemoteReference
{
    public Handle? Handle { get; set; }
}

public record RemoteObjectReference(Handle Handle) : RemoteReference
{
    public string? SharedId { get; set; }
}
