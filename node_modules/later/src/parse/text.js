/**
* Parses an English string expression and produces a schedule that is
* compatible with Later.js.
*
* Examples:
*
* every 5 minutes between the 1st and 30th minute
* at 10:00 am on tues of may in 2012
* on the 15-20th day of march-dec
* every 20 seconds every 5 minutes every 4 hours between the 10th and 20th hour
*/
later.parse.text = function(str) {

  var recur = later.parse.recur,
      pos = 0,
      input = '',
      error;

  // Regex expressions for all of the valid tokens
  var TOKENTYPES = {
        eof: /^$/,
        rank: /^((\d\d\d\d)|([2-5]?1(st)?|[2-5]?2(nd)?|[2-5]?3(rd)?|(0|[1-5]?[4-9]|[1-5]0|1[1-3])(th)?))\b/,
        time: /^((([0]?[1-9]|1[0-2]):[0-5]\d(\s)?(am|pm))|(([0]?\d|1\d|2[0-3]):[0-5]\d))\b/,
        dayName: /^((sun|mon|tue(s)?|wed(nes)?|thu(r(s)?)?|fri|sat(ur)?)(day)?)\b/,
        monthName: /^(jan(uary)?|feb(ruary)?|ma((r(ch)?)?|y)|apr(il)?|ju(ly|ne)|aug(ust)?|oct(ober)?|(sept|nov|dec)(ember)?)\b/,
        yearIndex: /^(\d\d\d\d)\b/,
        every: /^every\b/,
        after: /^after\b/,
        before: /^before\b/,
        second: /^(s|sec(ond)?(s)?)\b/,
        minute: /^(m|min(ute)?(s)?)\b/,
        hour: /^(h|hour(s)?)\b/,
        day: /^(day(s)?( of the month)?)\b/,
        dayInstance: /^day instance\b/,
        dayOfWeek: /^day(s)? of the week\b/,
        dayOfYear: /^day(s)? of the year\b/,
        weekOfYear: /^week(s)?( of the year)?\b/,
        weekOfMonth: /^week(s)? of the month\b/,
        weekday: /^weekday\b/,
        weekend: /^weekend\b/,
        month: /^month(s)?\b/,
        year: /^year(s)?\b/,
        between: /^between (the)?\b/,
        start: /^(start(ing)? (at|on( the)?)?)\b/,
        at: /^(at|@)\b/,
        and: /^(,|and\b)/,
        except: /^(except\b)/,
        also: /(also)\b/,
        first: /^(first)\b/,
        last: /^last\b/,
        "in": /^in\b/,
        of: /^of\b/,
        onthe: /^on the\b/,
        on: /^on\b/,
        through: /(-|^(to|through)\b)/
      };

  // Array to convert string names to valid numerical values
  var NAMES = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7,
        aug: 8, sep: 9, oct: 10, nov: 11, dec: 12, sun: 1, mon: 2, tue: 3,
        wed: 4, thu: 5, fri: 6, sat: 7, '1st': 1, fir: 1, '2nd': 2, sec: 2,
        '3rd': 3, thi: 3, '4th': 4, 'for': 4
      };

  /**
  * Bundles up the results of the peek operation into a token.
  *
  * @param {Int} start: The start position of the token
  * @param {Int} end: The end position of the token
  * @param {String} text: The actual text that was parsed
  * @param {TokenType} type: The TokenType of the token
  */
  function t(start, end, text, type) {
    return {startPos: start, endPos: end, text: text, type: type};
  }

  /**
  * Peeks forward to see if the next token is the expected token and
  * returns the token if found.  Pos is not moved during a Peek operation.
  *
  * @param {TokenType} exepected: The types of token to scan for
  */
  function peek(expected) {
    var scanTokens = expected instanceof Array ? expected : [expected],
        whiteSpace = /\s+/,
        token, curInput, m, scanToken, start, len;

    scanTokens.push(whiteSpace);

    // loop past any skipped tokens and only look for expected tokens
    start = pos;
    while (!token || token.type === whiteSpace) {
      len = -1;
      curInput = input.substring(start);
      token = t(start, start, input.split(whiteSpace)[0]);

      var i, length = scanTokens.length;
      for(i = 0; i < length; i++) {
        scanToken = scanTokens[i];
        m = scanToken.exec(curInput);
        if (m && m.index === 0 && m[0].length > len) {
          len = m[0].length;
          token = t(start, start + len, curInput.substring(0, len), scanToken);
        }
      }

      // update the start position if this token should be skipped
      if (token.type === whiteSpace) {
        start = token.endPos;
      }
    }

    return token;
  }

  /**
  * Moves pos to the end of the expectedToken if it is found.
  *
  * @param {TokenType} exepectedToken: The types of token to scan for
  */
  function scan(expectedToken) {
    var token = peek(expectedToken);
    pos = token.endPos;
    return token;
  }

  /**
  * Parses the next 'y-z' expression and returns the resulting valid
  * value array.
  *
  * @param {TokenType} tokenType: The type of range values allowed
  */
  function parseThroughExpr(tokenType) {
    var start = +parseTokenValue(tokenType),
        end = checkAndParse(TOKENTYPES.through) ? +parseTokenValue(tokenType) : start,
        nums = [];

    for (var i = start; i <= end; i++) {
      nums.push(i);
    }

    return nums;
  }

  /**
  * Parses the next 'x,y-z' expression and returns the resulting valid
  * value array.
  *
  * @param {TokenType} tokenType: The type of range values allowed
  */
  function parseRanges(tokenType) {
    var nums = parseThroughExpr(tokenType);
    while (checkAndParse(TOKENTYPES.and)) {
      nums = nums.concat(parseThroughExpr(tokenType));
    }
    return nums;
  }

  /**
  * Parses the next 'every (weekend|weekday|x) (starting on|between)' expression.
  *
  * @param {Recur} r: The recurrence to add the expression to
  */
  function parseEvery(r) {
    var num, period, start, end;

    if (checkAndParse(TOKENTYPES.weekend)) {
      r.on(NAMES.sun,NAMES.sat).dayOfWeek();
    }
    else if (checkAndParse(TOKENTYPES.weekday)) {
      r.on(NAMES.mon,NAMES.tue,NAMES.wed,NAMES.thu,NAMES.fri).dayOfWeek();
    }
    else {
      num = parseTokenValue(TOKENTYPES.rank);
      r.every(num);
      period = parseTimePeriod(r);

      if (checkAndParse(TOKENTYPES.start)) {
        num = parseTokenValue(TOKENTYPES.rank);
        r.startingOn(num);
        parseToken(period.type);
      }
      else if (checkAndParse(TOKENTYPES.between)) {
        start = parseTokenValue(TOKENTYPES.rank);
        if (checkAndParse(TOKENTYPES.and)) {
          end = parseTokenValue(TOKENTYPES.rank);
          r.between(start,end);
        }
      }
    }
  }

  /**
  * Parses the next 'on the (first|last|x,y-z)' expression.
  *
  * @param {Recur} r: The recurrence to add the expression to
  */
  function parseOnThe(r) {
    if (checkAndParse(TOKENTYPES.first)) {
      r.first();
    }
    else if (checkAndParse(TOKENTYPES.last)) {
      r.last();
    }
    else {
      r.on(parseRanges(TOKENTYPES.rank));
    }

    parseTimePeriod(r);
  }

  /**
  * Parses the schedule expression and returns the resulting schedules,
  * and exceptions.  Error will return the position in the string where
  * an error occurred, will be null if no errors were found in the
  * expression.
  *
  * @param {String} str: The schedule expression to parse
  */
  function parseScheduleExpr(str) {
    pos = 0;
    input = str;
    error = -1;

    var r = recur();
    while (pos < input.length && error < 0) {

      var token = parseToken([TOKENTYPES.every, TOKENTYPES.after, TOKENTYPES.before,
            TOKENTYPES.onthe, TOKENTYPES.on, TOKENTYPES.of, TOKENTYPES["in"],
            TOKENTYPES.at, TOKENTYPES.and, TOKENTYPES.except,
            TOKENTYPES.also]);

      switch (token.type) {
        case TOKENTYPES.every:
          parseEvery(r);
          break;
        case TOKENTYPES.after:
          if(peek(TOKENTYPES.time).type !== undefined) {
            r.after(parseTokenValue(TOKENTYPES.time));
            r.time();
          }
          else {
            r.after(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          }
          break;
        case TOKENTYPES.before:
          if(peek(TOKENTYPES.time).type !== undefined) {
            r.before(parseTokenValue(TOKENTYPES.time));
            r.time();
          }
          else {
            r.before(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          }
          break;
        case TOKENTYPES.onthe:
          parseOnThe(r);
          break;
        case TOKENTYPES.on:
          r.on(parseRanges(TOKENTYPES.dayName)).dayOfWeek();
          break;
        case TOKENTYPES.of:
          r.on(parseRanges(TOKENTYPES.monthName)).month();
          break;
        case TOKENTYPES["in"]:
          r.on(parseRanges(TOKENTYPES.yearIndex)).year();
          break;
        case TOKENTYPES.at:
          r.on(parseTokenValue(TOKENTYPES.time)).time();
          while (checkAndParse(TOKENTYPES.and)) {
            r.on(parseTokenValue(TOKENTYPES.time)).time();
          }
          break;
        case TOKENTYPES.and:
          break;
        case TOKENTYPES.also:
          r.and();
          break;
        case TOKENTYPES.except:
          r.except();
          break;
        default:
          error = pos;
      }
    }

    return {schedules: r.schedules, exceptions: r.exceptions, error: error};
  }

  /**
  * Parses the next token representing a time period and adds it to
  * the provided recur object.
  *
  * @param {Recur} r: The recurrence to add the time period to
  */
  function parseTimePeriod(r) {
    var timePeriod = parseToken([TOKENTYPES.second, TOKENTYPES.minute,
          TOKENTYPES.hour, TOKENTYPES.dayOfYear, TOKENTYPES.dayOfWeek,
          TOKENTYPES.dayInstance, TOKENTYPES.day, TOKENTYPES.month,
          TOKENTYPES.year, TOKENTYPES.weekOfMonth, TOKENTYPES.weekOfYear]);

    switch (timePeriod.type) {
      case TOKENTYPES.second:
        r.second();
        break;
      case TOKENTYPES.minute:
        r.minute();
        break;
      case TOKENTYPES.hour:
        r.hour();
        break;
      case TOKENTYPES.dayOfYear:
        r.dayOfYear();
        break;
      case TOKENTYPES.dayOfWeek:
        r.dayOfWeek();
        break;
      case TOKENTYPES.dayInstance:
        r.dayOfWeekCount();
        break;
      case TOKENTYPES.day:
        r.dayOfMonth();
        break;
      case TOKENTYPES.weekOfMonth:
        r.weekOfMonth();
        break;
      case TOKENTYPES.weekOfYear:
        r.weekOfYear();
        break;
      case TOKENTYPES.month:
        r.month();
        break;
      case TOKENTYPES.year:
        r.year();
        break;
      default:
        error = pos;
    }

    return timePeriod;
  }

  /**
  * Checks the next token to see if it is of tokenType. Returns true if
  * it is and discards the token.  Returns false otherwise.
  *
  * @param {TokenType} tokenType: The type or types of token to parse
  */
  function checkAndParse(tokenType) {
    var found = (peek(tokenType)).type === tokenType;
    if (found) {
      scan(tokenType);
    }
    return found;
  }

  /**
  * Parses and returns the next token.
  *
  * @param {TokenType} tokenType: The type or types of token to parse
  */
  function parseToken(tokenType) {
    var t = scan(tokenType);
    if (t.type) {
      t.text = convertString(t.text, tokenType);
    }
    else {
      error = pos;
    }
    return t;
  }

  /**
  * Returns the text value of the token that was parsed.
  *
  * @param {TokenType} tokenType: The type of token to parse
  */
  function parseTokenValue(tokenType) {
    return (parseToken(tokenType)).text;
  }

  /**
  * Converts a string value to a numerical value based on the type of
  * token that was parsed.
  *
  * @param {String} str: The schedule string to parse
  * @param {TokenType} tokenType: The type of token to convert
  */
  function convertString(str, tokenType) {
    var output = str;

    switch (tokenType) {
      case TOKENTYPES.time:
        var parts = str.split(/(:|am|pm)/),
            hour = parts[3] === 'pm' && parts[0] < 12 ? parseInt(parts[0],10) + 12 : parts[0],
            min = parts[2].trim();

        output = (hour.length === 1 ? '0' : '') + hour + ":" + min;
        break;

      case TOKENTYPES.rank:
        output = parseInt((/^\d+/.exec(str))[0],10);
        break;

      case TOKENTYPES.monthName:
      case TOKENTYPES.dayName:
        output = NAMES[str.substring(0,3)];
        break;
    }

    return output;
  }

  return parseScheduleExpr(str.toLowerCase());
};