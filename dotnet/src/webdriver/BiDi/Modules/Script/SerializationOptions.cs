namespace OpenQA.Selenium.BiDi.Modules.Script;

public class SerializationOptions
{
    public long? MaxDomDepth { get; set; }

    public long? MaxObjectDepth { get; set; }

    public ShadowTree? IncludeShadowTree { get; set; }
}

public enum ShadowTree
{
    None,
    Open,
    All
}
