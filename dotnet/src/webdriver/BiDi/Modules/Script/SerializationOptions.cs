namespace OpenQA.Selenium.BiDi.Modules.Script;

public class SerializationOptions
{
    public ulong? MaxDomDepth { get; set; }

    public ulong? MaxObjectDepth { get; set; }

    public ShadowTree? IncludeShadowTree { get; set; }
}

public enum ShadowTree
{
    None,
    Open,
    All
}