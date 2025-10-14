// <copyright file="SequentialSourceActions.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

//namespace OpenQA.Selenium.BiDi.Input;

//public interface ISequentialSourceActions : IEnumerable<SourceActions>
//{
//    ISequentialSourceActions Pause(int duration);

//    ISequentialSourceActions Type(string text);
//    ISequentialSourceActions KeyDown(char key);
//    ISequentialSourceActions KeyUp(char key);

//    ISequentialSourceActions PointerDown(int button, PointerDownOptions? options = null);
//    ISequentialSourceActions PointerUp(int button);
//    ISequentialSourceActions PointerMove(int x, int y, PointerMoveOptions? options = null);
//}

//public record SequentialSourceActions : ISequentialSourceActions
//{
//    private readonly KeyActions _keyActions = [];
//    private readonly PointerActions _pointerActions = [];
//    private readonly WheelActions _wheelActions = [];
//    private readonly WheelActions _noneActions = [];

//    public ISequentialSourceActions Pause(int duration)
//    {
//        _noneActions.Add(new Pause { Duration = duration });

//        return Normalized();
//    }

//    public ISequentialSourceActions Type(string text)
//    {
//        _keyActions.Type(text);

//        return Normalized();
//    }

//    public ISequentialSourceActions KeyDown(char key)
//    {
//        _keyActions.Add(new Key.Down(key));

//        return Normalized();
//    }

//    public ISequentialSourceActions KeyUp(char key)
//    {
//        _keyActions.Add(new Key.Up(key));

//        return Normalized();
//    }

//    public ISequentialSourceActions PointerDown(int button, PointerDownOptions? options = null)
//    {
//        _pointerActions.Add(new Pointer.Down(button)
//        {
//            Width = options?.Width,
//            Height = options?.Height,
//            Pressure = options?.Pressure,
//            TangentialPressure = options?.TangentialPressure,
//            Twist = options?.Twist,
//            AltitudeAngle = options?.AltitudeAngle,
//            AzimuthAngle = options?.AzimuthAngle
//        });

//        return Normalized();
//    }

//    public ISequentialSourceActions PointerUp(int button)
//    {
//        _pointerActions.Add(new Pointer.Up(button));

//        return Normalized();
//    }

//    public ISequentialSourceActions PointerMove(int x, int y, PointerMoveOptions? options = null)
//    {
//        _pointerActions.Add(new Pointer.Move(x, y)
//        {
//            Duration = options?.Duration,
//            Origin = options?.Origin,
//            Width = options?.Width,
//            Height = options?.Height,
//            Pressure = options?.Pressure,
//            TangentialPressure = options?.TangentialPressure,
//            Twist = options?.Twist,
//            AltitudeAngle = options?.AltitudeAngle,
//            AzimuthAngle = options?.AzimuthAngle
//        });

//        return Normalized();
//    }

//    private SequentialSourceActions Normalized()
//    {
//        var max = new[] { _keyActions.Count(), _pointerActions.Count(), _wheelActions.Count(), _noneActions.Count() }.Max();

//        for (int i = _keyActions.Count(); i < max; i++)
//        {
//            _keyActions.Add(new Pause());
//        }

//        for (int i = _pointerActions.Count(); i < max; i++)
//        {
//            _pointerActions.Add(new Pause());
//        }

//        for (int i = _wheelActions.Count(); i < max; i++)
//        {
//            _wheelActions.Add(new Pause());
//        }

//        for (int i = _noneActions.Count(); i < max; i++)
//        {
//            _noneActions.Add(new Pause());
//        }

//        return this;
//    }

//    public IEnumerator<SourceActions> GetEnumerator()
//    {
//        var sourceActions = new List<SourceActions>
//        {
//            _keyActions,
//            _pointerActions,
//            _wheelActions,
//            _noneActions
//        };
//        return sourceActions.GetEnumerator();
//    }

//    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
//}

//public record PointerDownOptions : IPointerCommonProperties
//{
//    public int? Width { get; set; }
//    public int? Height { get; set; }
//    public double? Pressure { get; set; }
//    public double? TangentialPressure { get; set; }
//    public int? Twist { get; set; }
//    public double? AltitudeAngle { get; set; }
//    public double? AzimuthAngle { get; set; }
//}

//public record PointerMoveOptions : IPointerCommonProperties
//{
//    public int? Duration { get; set; }
//    public Origin? Origin { get; set; }

//    public int? Width { get; set; }
//    public int? Height { get; set; }
//    public double? Pressure { get; set; }
//    public double? TangentialPressure { get; set; }
//    public int? Twist { get; set; }
//    public double? AltitudeAngle { get; set; }
//    public double? AzimuthAngle { get; set; }
//}
