var monthInitials = ["J","F","M","A","m","j","U","a","S","O","N","D"];

var initials = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var timeZone = [
    12*60,
    11*60,
    10*60,
    9.5*60,
    9*60,
    8*60,
    7*60,
    6*60,
    5*60,
    4*60,
    3.5*60,
    3*60,
    2*60,
    1*60,
    0*60,
    -1*60,
    -2*60,
    -3*60,
    -3.5*60,
    -4*60,
    -4.5*60,
    -5*60,
    -5.5*60,
    -5.75*60,
    -6*60,
    -6.5*60,
    -7*60,
    -8*60,
    -8.5*60,
    -8.75*60,
    -9*60,
    -9.5*60,
    -10*60,
    -10.5*60,
    -11*60,
    -12*60,
    -12.75*60,
    -13*60,
    -14*60
];

function parseToUTC(dtObj, includeDate, includeCentury, includeTime){
    if(typeof dtObj === "string"){
        dtObj = new Date(dtObj);
    }
    var dtStr = "";
    if(includeCentury){
        dtStr += char(Math.floor(dtObj.getUTCFullYear()/100)) ;
    }
    if(includeDate){//3
        //year
        dtStr += char(dtObj.getUTCFullYear()%100);
        //month
        dtStr += monthInitials[dtObj.getUTCMonth()];
        //date
        dtStr += initials[dtObj.getUTCDate()]
    }
    
    if(includeTime){//5
        //h
        dtStr += initials[dtObj.getUTCHours()]
        //m
        dtStr += initials[dtObj.getUTCMinutes()];
        //s
        dtStr += initials[dtObj.getUTCSeconds()];
        //ms
        var ms = dtObj.getUTCMilliseconds();
        dtStr += char(Math.floor(ms/10)) ;
        dtStr += char(ms%10) ;
    }
    
    //zone
    //if(includeZone){//1
        dtStr += initials[timeZone.indexOf(dtObj.getTimezoneOffset() ) ]
    //}
    return dtStr;
}

/**
 * 
 * @param {*} dtStr 
 * @param {*} includeDate 
 * @param {*} includeCentury 
 * @param {*} includeTime 
 * @param {*} includeZone 
 */
function parseBackUTC(dtStr,includeDate, includeCentury, includeTime){

    var century = 0;
    var startFrom = 0;
    var Y = 0, M = 0, D = 0, h = 0, m = 0, s = 0, ms = 0, z = 0;
    if(includeCentury){//1st digit is century
        century = 100 * ascii(dtStr[startFrom++]);
    }

    if(includeDate){
        Y = century + ascii(dtStr[startFrom++]);
        M = monthInitials.indexOf(dtStr[startFrom++]);
        D = initials.indexOf(dtStr[startFrom++])
        //startFrom += 3;
    }

    if(includeTime){
        h = initials.indexOf(dtStr[startFrom++]);
        m = initials.indexOf(dtStr[startFrom++]);
        s = initials.indexOf(dtStr[startFrom++]);

        ms = ascii(dtStr[startFrom++])*10 + ascii(dtStr[startFrom++]);
        //startFrom += 5;
    }
    var dt = new Date(Y,M,D,h,m,s,ms);
    //if(includeZone){
        z = timeZone[initials.indexOf(dtStr[startFrom])];
        dt.setTime(dt.getTime() - z*60*1000);
    //}

    return dt;
}


function ascii(ch){
    return ch.charCodeAt(0);
}

/**
 *  converts a ASCII number into equivalant ASCII char
 * @param {number} a 
 * @returns ASCII char
 */
var char = function (a){
    return String.fromCharCode(a);
}

exports.parse = parseToUTC;
exports.parseBack = parseBackUTC;
