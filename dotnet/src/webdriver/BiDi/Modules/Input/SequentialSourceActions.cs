using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.BiDi.Modules.Input;

public interface ISequentialSourceActions : IEnumerable<SourceActions>
{
    public ISequentialSourceActions Pause(int duration);

    public ISequentialSourceActions Type(string text);

    public ISequentialSourceActions KeyDown(char key);
}

public record SequentialSourceActions : ISequentialSourceActions
{
    private readonly KeyActions _keyActions = [];
    private readonly PointerActions _pointerActions = [];
    private readonly WheelActions _wheelActions = [];
    private readonly WheelActions _noneActions = [];

    public ISequentialSourceActions Pause(int duration)
    {
        _noneActions.Add(new Pause { Duration = duration });

        return Normalized();
    }

    public ISequentialSourceActions Type(string text)
    {
        _keyActions.Type(text);

        return Normalized();
    }

    public ISequentialSourceActions KeyDown(char key)
    {
        _keyActions.Add(new Key.Down(key));

        return Normalized();
    }

    private SequentialSourceActions Normalized()
    {
        var max = new[] { _keyActions.Count(), _pointerActions.Count(), _wheelActions.Count(), _noneActions.Count() }.Max();

        for (int i = _keyActions.Count(); i < max; i++)
        {
            _keyActions.Add(new Pause());
        }

        for (int i = _pointerActions.Count(); i < max; i++)
        {
            _pointerActions.Add(new Pause());
        }

        for (int i = _wheelActions.Count(); i < max; i++)
        {
            _wheelActions.Add(new Pause());
        }

        for (int i = _noneActions.Count(); i < max; i++)
        {
            _noneActions.Add(new Pause());
        }

        return this;
    }

    public IEnumerator<SourceActions> GetEnumerator()
    {
        var sourceActions = new List<SourceActions>
        {
            _keyActions,
            _pointerActions,
            _wheelActions,
            _noneActions
        };
        return sourceActions.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
