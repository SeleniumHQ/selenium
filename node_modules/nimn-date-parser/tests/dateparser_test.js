var parser = require("../dateparser.js");

describe("Date parser", function () {
    it(" should parse and parseback full date", function () {

        var dt = new Date("Mon Feb 26 2018 17:42:17 GMT+0530 (IST)");
        //var dt = new Date("Tue May 15 2012 05:45:40 GMT-0500");
        //console.log(dt);

        var nimnDt = parser.parse(dt,true,true,true);
        console.log(nimnDt);
        
        var dt2 = parser.parseBack(nimnDt,true,true,true);
        //console.log(dt2);

        expect(dt).toEqual(dt2);
        expect(10).toEqual(nimnDt.length);

    });

    it(" should parse and parseback only date part", function () {

        var dt = new Date();
        //console.log(dt);

        var nimnDt = parser.parse(dt,true,false);
        //console.log(nimnDt);
        
        var dt2 = parser.parseBack(nimnDt,true,false);
        //console.log(dt2);

        expect(4).toEqual(nimnDt.length);
        expect(dt.getFullYear()%100).toEqual(dt2.getFullYear()%100);
        expect(dt.getMonth()).toEqual(dt2.getMonth());
        expect(dt.getDate()).toEqual(dt2.getDate());

    });

    it(" should parse and parseback date part with century", function () {
        var dt = new Date();
        //console.log(dt);

        var nimnDt = parser.parse(dt,true,true);
        //console.log(nimnDt);
        
        var dt2 = parser.parseBack(nimnDt,true,true);
        //console.log(dt2);

        expect(5).toEqual(nimnDt.length);
        expect(dt.getFullYear()).toEqual(dt2.getFullYear());
        expect(dt.getMonth()).toEqual(dt2.getMonth());
        expect(dt.getDate()).toEqual(dt2.getDate());
    });

    it(" should parse and parseback time", function () {
        var dt = new Date();
        //console.log(dt);

        var nimnDt = parser.parse(dt,false,false,true);
        //console.log(nimnDt);
        
        var dt2 = parser.parseBack(nimnDt,false,false,true);
        //console.log(dt2);

        expect(6).toEqual(nimnDt.length);
        expect(dt.getHours()).toEqual(dt2.getHours());
        expect(dt.getMinutes()).toEqual(dt2.getMinutes());
        expect(dt.getSeconds()).toEqual(dt2.getSeconds());
        expect(dt.getMilliseconds()).toEqual(dt2.getMilliseconds());
    });

});