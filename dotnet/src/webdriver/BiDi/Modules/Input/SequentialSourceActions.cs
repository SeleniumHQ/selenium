using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.BiDi.Modules.Input;

public interface ISequentialSourceActions : IEnumerable<SourceActions>
{
    ISequentialSourceActions Pause(int duration);

    ISequentialSourceActions Type(string text);
    ISequentialSourceActions KeyDown(char key);
    ISequentialSourceActions KeyUp(char key);

    ISequentialSourceActions PointerDown(int button, PointerDownOptions? options = null);
    ISequentialSourceActions PointerUp(int button);
    ISequentialSourceActions PointerMove(int x, int y, PointerMoveOptions? options = null);
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

    public ISequentialSourceActions KeyUp(char key)
    {
        _keyActions.Add(new Key.Up(key));

        return Normalized();
    }

    public ISequentialSourceActions PointerDown(int button, PointerDownOptions? options = null)
    {
        _pointerActions.Add(new Pointer.Down(button)
        {
            Width = options?.Width,
            Height = options?.Height,
            Pressure = options?.Pressure,
            TangentialPressure = options?.TangentialPressure,
            Twist = options?.Twist,
            AltitudeAngle = options?.AltitudeAngle,
            AzimuthAngle = options?.AzimuthAngle
        });

        return Normalized();
    }

    public ISequentialSourceActions PointerUp(int button)
    {
        _pointerActions.Add(new Pointer.Up(button));

        return Normalized();
    }

    public ISequentialSourceActions PointerMove(int x, int y, PointerMoveOptions? options = null)
    {
        _pointerActions.Add(new Pointer.Move(x, y)
        {
            Duration = options?.Duration,
            Origin = options?.Origin,
            Width = options?.Width,
            Height = options?.Height,
            Pressure = options?.Pressure,
            TangentialPressure = options?.TangentialPressure,
            Twist = options?.Twist,
            AltitudeAngle = options?.AltitudeAngle,
            AzimuthAngle = options?.AzimuthAngle
        });

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

public record PointerDownOptions : IPointerCommonProperties
{
    public int? Width { get; set; }
    public int? Height { get; set; }
    public double? Pressure { get; set; }
    public double? TangentialPressure { get; set; }
    public int? Twist { get; set; }
    public double? AltitudeAngle { get; set; }
    public double? AzimuthAngle { get; set; }
}

public record PointerMoveOptions : IPointerCommonProperties
{
    public int? Duration { get; set; }
    public Origin? Origin { get; set; }

    public int? Width { get; set; }
    public int? Height { get; set; }
    public double? Pressure { get; set; }
    public double? TangentialPressure { get; set; }
    public int? Twist { get; set; }
    public double? AltitudeAngle { get; set; }
    public double? AzimuthAngle { get; set; }
}
