using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.BiDi.Modules.Input;

public interface ISequentialSourceActions : IEnumerable<SourceActions>
{
    public SequentialSourceActions Type(string text);

    public SequentialSourceActions KeyDown(char key);
}

public record SequentialSourceActions : ISequentialSourceActions
{
    private readonly KeyActions _keyActions = [];
    private readonly PointerActions _pointerActions = [];
    private readonly WheelActions _wheelActions = [];

    public SequentialSourceActions Type(string text)
    {
        _keyActions.Type(text);

        return Normalized();
    }

    public SequentialSourceActions KeyDown(char key)
    {
        _keyActions.Add(new Key.Down(key));

        return Normalized();
    }

    private SequentialSourceActions Normalized()
    {
        var max = new[] { _keyActions.Count(), _pointerActions.Count(), _wheelActions.Count() }.Max();

        for (int i = _keyActions.Count(); i < max; i++)
        {
            _keyActions.Add(new Key.Pause());
        }

        for (int i = _pointerActions.Count(); i < max; i++)
        {
            _pointerActions.Add(new Pointer.Pause());
        }

        for (int i = _wheelActions.Count(); i < max; i++)
        {
            _wheelActions.Add(new Pointer.Pause());
        }

        return this;
    }

    public IEnumerator<SourceActions> GetEnumerator()
    {
        var sourceActions = new List<SourceActions>
        {
            _keyActions,
            _pointerActions,
            _wheelActions
        };
        return sourceActions.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
