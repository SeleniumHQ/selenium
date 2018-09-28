/**
* Date Constants
* (c) 2013 Bill, BunKat LLC.
*
* Useful constants for dealing with time conversions.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/

// Time to milliseconds conversion
later.SEC = 1000;
later.MIN = later.SEC * 60;
later.HOUR = later.MIN * 60;
later.DAY = later.HOUR * 24;
later.WEEK = later.DAY * 7;

// Array of days in each month, must be corrected for leap years
later.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// constant for specifying that a schedule can never occur
later.NEVER = 0;