/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#include "interactions_common.h"

#include <assert.h>
#include <math.h>
#include <stdlib.h>

unsigned long distanceBetweenPoints(long fromX, long fromY, long toX, long toY)
{
  assert(fromX >= 0);
  assert(fromY >= 0);
  assert(toX >= 0);
  assert(toY >= 0);

  long xDiff = abs(toX - fromX);
  long yDiff = abs(toY - fromY);

  // Cast first argument of pow to double, since conversion of arguments on
  // Visual Studio ends up creating ambiguity.
  return (long) sqrt(pow((double) xDiff, 2) + pow((double) yDiff, 2));
}