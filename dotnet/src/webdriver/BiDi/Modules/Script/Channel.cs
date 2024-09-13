namespace OpenQA.Selenium.BiDi.Modules.Script;

public class Channel
{
    readonly BiDi _bidi;

    internal Channel(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    internal string Id { get; }
}
