// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Sample code to instantiate a few goog.ui.Buttons.  The
 * size of the resulting jsbinary for this sample file is tracked using
 * Greenspan (http://go/greenspan).
 *
*
 */

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.Button');
goog.require('goog.ui.Button.Side');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.CustomButton');


function drawButtons() {
  function logEvent(e) {
  }

  // Create a simple button programmatically
  var b1 = new goog.ui.Button('Hello!');
  b1.render(goog.dom.getElement('b1'));
  b1.setTooltip('I changed the tooltip.');
  goog.events.listen(b1, goog.ui.Component.EventType.ACTION, logEvent);

  // Create some custom buttons programatically.
  var disabledButton, leftButton, centerButton, rightButton;
  var customButtons = [
      new goog.ui.CustomButton('Button'),
      new goog.ui.CustomButton('Another Button'),
      disabledButton = new goog.ui.CustomButton('Disabled Button'),
      new goog.ui.CustomButton('Yet Another Button'),
      leftButton = new goog.ui.CustomButton('Left'),
      centerButton = new goog.ui.CustomButton('Center'),
      rightButton = new goog.ui.CustomButton('Right')
  ];
  disabledButton.setEnabled(false);
  leftButton.setCollapsed(goog.ui.Button.Side.END);
  centerButton.setCollapsed(goog.ui.Button.Side.BOTH);
  rightButton.setCollapsed(goog.ui.Button.Side.START);
  goog.array.forEach(customButtons, function(b) {
    b.render(goog.dom.getElement('cb1'));
    goog.events.listen(b, goog.ui.Component.EventType.ACTION, logEvent);
  });
}

goog.exportSymbol('drawButtons', drawButtons);
