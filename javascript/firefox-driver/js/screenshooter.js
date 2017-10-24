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

goog.provide('fxdriver.screenshot');

goog.require('fxdriver.moz');


fxdriver.screenshot.grab = function(window) {
  var document = window.document;
  var documentElement = document.documentElement;
  if (!documentElement) {
    throw new Error('Page is not loaded yet, try later');
  }
  var canvas = document.getElementById('fxdriver-screenshot-canvas');
  if (canvas == null) {
    canvas = document.createElement('canvas');
    canvas.id = 'fxdriver-screenshot-canvas';
    canvas.style.display = 'none';
    documentElement.appendChild(canvas);
  }
  var width = documentElement.scrollWidth;
  if (document.body && document.body.scrollWidth > width) {
    width = document.body.scrollWidth;
  }
  var height = documentElement.scrollHeight;
  if (document.body && document.body.scrollHeight > height) {
    height = document.body.scrollHeight;
  }

  //
  // CanvasRenderingContext2D::DrawWindow limits width and height up to 65535
  //  > 65535 leads to NS_ERROR_FAILURE
  //
  // HTMLCanvasElement::ToDataURLImpl limits width and height up to 32767
  //  >= 32769 leads to NS_ERROR_FAILURE
  //  = 32768 leads to black image (moz issue?).
  //
  var limit = 32767;
  if (width >= limit) {
    width = limit - 1;
  }
  if (height >= limit) {
    height = limit - 1;
  }

  canvas.width = width;
  canvas.height = height;

  try {
    var context = canvas.getContext('2d');
  } catch (e) {
    throw new Error('Unable to get context - ' + e);
  }
  try {
    context.drawWindow(window, 0, 0, width, height, 'rgb(255,255,255)');
  } catch (e) {
    throw new Error('Unable to draw window - ' + e);
  }

  return canvas;
};


fxdriver.screenshot.toBase64 = function(canvas) {
  try {
    var dataUrl = canvas.toDataURL('image/png');
  } catch (e) {
    throw new Error('Unable to load canvas into base64 string - ' + e);
  }
  var index = dataUrl.indexOf('base64,');
  if (index == -1) {
    // No base64 data marker.
    throw new Error("Invalid base64 data: " + dataUrl);
  }
  try {
    return dataUrl.substring(index + 'base64,'.length);
  } catch (e) {
    throw new Error('Unable to get data from base64 string - ' + e);
  }
};


fxdriver.screenshot.save = function(canvas, filepath) {
  var dataUrl = canvas.toDataURL('image/png');
  var ioService = CC['@mozilla.org/network/io-service;1'].
      getService(CI['nsIIOService']);
  var dataUri = ioService.newURI(dataUrl, 'UTF-8', null);
  var channel = ioService.newChannelFromURI(dataUri);
  var file = CC['@mozilla.org/file/local;1'].createInstance(CI['nsILocalFile']);
  file.initWithPath(filepath);
  var inputStream = channel.open();
  var binaryInputStream = CC['@mozilla.org/binaryinputstream;1'].
      createInstance(CI['nsIBinaryInputStream']);
  binaryInputStream.setInputStream(inputStream);
  var fileOutputStream = CC['@mozilla.org/network/safe-file-output-stream;1'].
      createInstance(CI['nsIFileOutputStream']);
  fileOutputStream.init(file, -1, -1, null);
  var n = binaryInputStream.available();
  var bytes = binaryInputStream.readBytes(n);
  fileOutputStream.write(bytes, n);
  if (fileOutputStream instanceof CI['nsISafeOutputStream']) {
    fileOutputStream.finish();
  } else {
    fileOutputStream.close();
  }
};
