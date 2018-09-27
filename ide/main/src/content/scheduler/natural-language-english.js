/*
 * NaturalLanguageProcessor - a Javascript based library to convert English like expressions into cron like expressions
 *
 * Copyright 2014,2015 Samit Badle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 *Every 15 minutes
 *Every hour
 *Every 2 hours at 5
 *Every day at 8
 *Every weekday at 8
 On weekday at 8
 *Daily at 8
 *At midnight
 *Sunday at midnight
 *Sunday at noon
 *Sunday at 8am
 *Sunday at 8:15am
 *Sunday at 8:15
 Every hour on Monday
 Every Monday Every hour
 Sunday at 0815
 Monday at 1000, 11:15
 */

function NaturalLanguageProcessor() {
}

NaturalLanguageProcessor.prototype.fromString = function(string) {
  return NaturalLanguageProcessor.fromString(string);
};

NaturalLanguageProcessor.fromString = function(string) {
  var m;
  m = string.match(/^\s*(?:every\s*)?(\d+)(?:\s*(?:min(?:ute)?(?:s)?))\s*$/i);
  if (m) {
    return this._fromMinutes(parseInt(m[1], 10));
  }
  m = string.match(/^\s*(?:every\s*)?(\d*)(?:\s*(?:hour(?:s)?))(?:\s+at\s+(\d+)(?:\s*(?:min(?:ute)?(?:s)?))?)?\s*$/i);
  if (m) {
    return this._fromHours(m[1] && m[1].length > 0 ? parseInt(m[1], 10) : 1, m.length > 2 ? parseInt(m[2], 10) : 0);
  }
  m = string.replace(/at midnight\s*$/i, 'at 0:0').replace(/at noon\s*$/i, 'at 12:00').match(/^\s*(?:every\s+)?(?:([A-Za-z ,]+)\s+)?at\s+(\d+)(?::(\d+)\s*(am|pm)?)?\s*$/i);
  if (m) {
    return this._fromTime(parseInt(m[2], 10), m[3] && m[3].length > 0 ? parseInt(m[3], 10) : 0, m[4], m[1].length > 0 ? this._fromDays(m[1]) : '*');
  }
};

NaturalLanguageProcessor._fromMinutes = function(minutes, days) {
  //TODO extract day processing into a separate fn
  if (!days || days == '') {
    days = '*';
  } else {
    if (days == 'weekday') {
      days = '1-5';
    } else if (days == 'weekend') {
      days = '0,6';
    } else {
      //TODO
    }
    //TODO
  }
  if (minutes == 0) {
    //TODO cannot be every 0 minutes
  } else if (minutes < 60) {
    if (minutes % 5 == 0) {
      switch (minutes) {
        case 5: return days + " * *";
        case 10: return days + " * */2";
        case 15: return days + " * */3";
        case 20: return days + " * */4";
        case 30: return days + " * */6";
      }
      //TODO error not valid minute interval
    } else {
      //TODO error. can only be a multiple of 5
    }
  } else if (minutes % 60 == 0) {
    return this._fromHours(minutes / 60);
  }
  //TODO error. not a valid hour interval
};

NaturalLanguageProcessor._fromHours = function(hours, minute) {
  if (minute) {
    if (minute >= 0 && minute < 60 && minute % 5 == 0) {
      minute /= 5;
    } else {
      //TODO invalid minute
    }
  } else {
    minute = 0;
  }
  if (hours == 0) {
    //TODO error cannot be every 0 hour
  } else if (hours < 24) {
    switch (hours) {
      case 1: return "* * " + minute;
      case 2: return "* */2 " + minute;
      case 3: return "* */3 " + minute;
      case 4: return "* */4 " + minute;
      case 6: return "* */6 " + minute;
      case 8: return "* */8 " + minute;
      case 12: return "* */12 " + minute;
    }
    //TODO error not valid minute interval
  } else if (hours % 24 == 0) {
    return this._fromDays(hours / 24);
  }
  //TODO error. not a valid day interval
};

NaturalLanguageProcessor._fromTime = function(hour, minute, ampm, day) {
  if (ampm) {
    if (ampm.toLowerCase() === 'pm') {
      if (hour >= 1 && hour <= 12) {
        if (hour != 12) {
          hour += 12;
        }
      } else {
        //TODO error
      }
    } else {
      if (hour >= 1 && hour <= 12) {
        if (hour == 12) {
          hour = 0;
        }
      } else {
        //TODO error
      }
    }
  } else {
    if (hour < 0 || hour > 23) {
      //TODO error
    }
  }
  if (!minute) {
    minute = 0;
  }
  if (minute < 0 || minute >= 60) {
    //TODO invalid time portion
  } else if (minute % 5 == 0) {
    minute /= 5;
    return day + " " + hour + " " + minute;
  } else {
    //TODO error. can only be a multiple of 5
  }
  //TODO error. not a valid hour interval
};

NaturalLanguageProcessor._fromDays = function(daysList) {
  var ra = [0, 0, 0, 0, 0, 0, 0];
  var rx = [/^sun(?:day)?$/i, /^mon(?:day)?$/i, /^tue(?:sday)?$/i, /^wed(?:nesday)?$/i, /^thu(?:rsday)?$/i, /^fri(?:day)?$/i, /^sat(?:urday)?$/i];
  var days = daysList.split(',');
  for (var i = 0; i < days.length; i++) {
    var d = days[i].replace(/\s+/g, '');
    for (var x = 0; x < 7; x++) {
      if (rx[x].test(d)) {
        ra[x] = 1;
        break;
      }
    }
    if (d.match(/^daily$/i)) {
      return '*';
    }
    if (d.match(/^day$/i)) {
      return '*';
    }
    if (d.match(/^weekday$/i)) {
      ra[1] = 1;
      ra[2] = 1;
      ra[3] = 1;
      ra[4] = 1;
      ra[5] = 1;
    }
    if (d.match(/^weekend$/i)) {
      ra[0] = 1;
      ra[6] = 1;
    }
  }
  var day = '';
  for (x = 0; x < 7; x++) {
    if (ra[x] == 1) {
      day += ',' + x;
    }
  }
  return day.length > 0 ? day.substr(1) : '';
};
