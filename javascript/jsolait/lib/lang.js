/*
  Copyright (c) 2004 Jan-Klaas Kollhof
  
  This file is part of the JavaScript o lait library(jsolait).
  
  jsolait is free software; you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation; either version 2.1 of the License, or
  (at your option) any later version.
 
  This software is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.
 
  You should have received a copy of the GNU Lesser General Public License
  along with this software; if not, write to the Free Software
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

/**
    Module providing language services like tokenizing JavaScript code
    or converting JavaScript objects to and from JSON (see json.org).
    To customize JSON serialization of Objects just overwrite the toJSON method in your class.
*/
Module("lang", "0.3.5", function(mod){
   
    var ISODate = function(d){
        if(/^(\d{4})(\d{2})(\d{2})T(\d{2}):(\d{2}):(\d{2})/.test(d)){
            return new Date(Date.UTC(RegExp.$1, RegExp.$2-1, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6));
        }else{ //todo error message
            throw "Not an ISO date: " + d;
        }
    }
        
    mod.JSONParser=Class("JSONParser", function(publ, supr){
        publ.init=function(){
            this.libs = {};
            var sys = {"ISODate" : ISODate};
            this.addLib(sys, "sys", ["ISODate"]);
        }
        
        publ.addLib = function(obj, name, exports){
            if(exports == null){
                this.libs[name] = obj;
            }else{
                for(var i=0;i<exports.length;i++){
                    this.libs[name + "." + exports[i]] = obj[exports[i]];
                }
            }
        }
        
        var EmptyValue = {};
        var SeqSep = {};
        
        var parseValue = function(tkns, libs){
            var tkn = tkns.nextNonWS();
            switch(tkn.type){
                case mod.tokens.STR:
                case mod.tokens.NUM:
                    return eval(tkn.value);
                case mod.tokens.NAME:
                    return parseName(tkn.value);
                case mod.tokens.OP:
                    switch(tkn.value){
                        case "[":
                            return parseArray(tkns, libs);
                            break;
                        case "{":
                            return parseObj(tkns, libs);
                            break;
                        case "}": case "]":
                            return EmptyValue;
                        case ",":
                            return SeqSep;
                        default:
                            throw "expected '[' or '{' but found: '" + tkn.value + "'";
                    }
            }
            return EmptyValue;
        }
        
        var parseArray = function(tkns, libs){
            var a = [];
            while(! tkns.finished()){
                var v = parseValue(tkns, libs);
                if(v == EmptyValue){
                    return a;
                }else{
                    a.push(v);
                    v = parseValue(tkns, libs);
                    if(v == EmptyValue){
                        return a;
                    }else if(v != SeqSep){
                        throw "',' expected but found: '" + v + "'";
                    }
                }
            }
            throw "']' expected";
        }
                     
        var parseObj = function(tkns, libs){
            var obj = {};
            var nme =""
            while(! tkns.finished()){
                var tkn = tkns.nextNonWS();
                if(tkn.type == mod.tokens.STR){
                    var nme =  eval(tkn.value);
                    tkn = tkns.nextNonWS();
                    if(tkn.value == ":"){
                        var v = parseValue(tkns, libs);
                        if(v == SeqSep || v == EmptyValue){
                            throw "value expected";
                        }else{
                            obj[nme] = v;
                            v = parseValue(tkns, libs);
                            if(v == EmptyValue){
                                return transformObj(obj, libs);
                            }else if(v != SeqSep){
                                throw "',' expected";
                            }
                        }
                    }else{
                        throw "':' expected but found: '" + tkn.value + "'";
                    }
                }else if(tkn.value == "}"){
                    return transformObj(obj, libs);
                }else{
                    throw "String expected";
                }
            }
            throw "'}' expected."
        }
        
        var transformObj = function(obj, libs){
            var o2;
            if(obj.jsonclass != null){
                var clsName = obj.jsonclass[0];
                var params = obj.jsonclass[1]
                if(libs[clsName]){
                    o2 = libs[clsName].apply(this, params);
                    for(var nme in obj){
                        if(nme != "jsonclass"){
                            if(typeof obj[nme] != "function"){
                                o2[nme] = obj[nme];
                            }
                        }
                    }
                }else{
                    throw "jsonclass not found: " + clsName;
                }
            }else{
                o2 = obj;
            }
            return o2;
        }
        
        var parseName = function(name){
            switch(name){
                case "null":
                    return null;
                case "true":
                    return true;
                case "false":
                    return false;
                default:
                    throw "'null', 'true', 'false' expected but found: '" + name + "'";
            }
        }
        
        publ.jsonToObj = function(data){
            var t = new mod.Tokenizer(data);
            return parseValue(t, this.libs);
        }
                
        publ.objToJson=function(obj){
            if(obj == null){
                return "null";
            }else{
                return obj.toJSON();
            }
        }
    })
        
    mod.parser = new mod.JSONParser();
    
    /**
        Turns JSON code into JavaScript objects.
        @param src  The source as a String.
    */
    mod.jsonToObj=function(src){
        return mod.parser.jsonToObj(src);
    }
    
    /**
        Turns an object into JSON.
        This is the same as calling obj.toJSON();
        @param obj  The object to marshall.
    */
    mod.objToJson=function(obj){
        return mod.parser.objToJson(obj);
    }
    
    ///Token constants for the tokenizer.
    mod.tokens = {};
    mod.tokens.WSP = 0;
    mod.tokens.OP =1;
    mod.tokens.STR = 2;
    mod.tokens.NAME = 3;
    mod.tokens.NUM = 4;
    mod.tokens.ERR = 5;
    mod.tokens.NL = 6;
    mod.tokens.COMMENT = 7;
    mod.tokens.DOCCOMMENT = 8;
    mod.tokens.REGEXP = 9;
    
    
    //todo:doc
    mod.Token=Class(function(publ, supr){
        
        publ.init=function(type, value, pos, err){
            this.type = type;
            this.value = value;
            this.pos = pos;
            this.err= err;
        }
        
    })
    
    /**
        Tokenizer Class which incrementally parses JavaScript code and returns the language tokens.
    */
    mod.Tokenizer=Class("Tokenizer", function(publ, supr){
        publ.init=function(s){
            this._working = s;
            this._pos = 0;
        }
        
        /**
            Returns weather or not the code was parsed.
            @return True if the complete code was parsed, false otherwise.
        */
        publ.finished=function(){
            return this._working.length == 0;
        }
        
        publ.nextNonWS = function(nlIsWS){
            var tkn = this.next();
            while((tkn.type == mod.tokens.WSP) ||  (nlIsWS && (tkn.type == mod.tokens.NL))){
                tkn = this.next();
            }
            return tkn;
        }
        
        /**
            Returns the next token.
            @return The next token.
        */
        publ.next = function(){
            if(this._working ==""){
                throw "Empty";
            } 
            var s1 = this._working.charAt(0);
            var s2 = s1 + this._working.charAt(1);
            var s3 = s2 + this._working.charAt(2);
            var rslt=[];
            switch(s1){
                case '"': case "'":
                    try{
                        s1 = extractQString(this._working);
                        rslt= new mod.Token(mod.tokens.STR, s1, this._pos);
                    }catch(e){
                        rslt= new mod.Token(mod.tokens.ERR, s1, this._pos, e);
                    }
                    break;
                case "\n": case "\r":
                    rslt =new mod.Token(mod.tokens.NL, s1, this._pos);
                    break;   
                case "{": case "}": case "[": case "]": case "(": case ")":
                case ":": case ",": case ".": case ";":
                case "*": case "-": case "+":
                case "=": case "<": case ">":  case "!":   
                    switch(s2){
                        case "==": case "!=": case "<>":  case "<=": case ">=":
                            rslt = new mod.Token(mod.tokens.OP, s2, this._pos);
                            break;
                        default:
                            rslt = new mod.Token(mod.tokens.OP, s1, this._pos);
                    }
                    break;
                case "/":
                    if(s2 == "//" || s3 =="///"){
                        s1 = extractSLComment(this._working);
                        rslt = new mod.Token(s1.charAt(2) != "/" ? mod.tokens.COMMENT:mod.tokens.DOCCOMMENT, s1, this._pos);
                    }else if(s2 == "/*" || s3 =="/**"){
                        try{
                            s1 = extractMLComment(this._working);
                            rslt = new mod.Token(s3 !="/**" ? mod.tokens.COMMENT: mod.tokens.DOCCOMMENT, s1, this._pos);
                        }catch(e){
                            rslt= new mod.Token(mod.tokens.ERR, s3 != "/**" ? s2 : s3, this._pos, e);
                        }
                    }else{
                        try{
                            s1 = extractRegExp(this._working);
                            rslt  = new mod.Token(mod.tokens.REGEXP, s1, this._pos);
                        }catch(e){
                            rslt = new mod.Token(mod.tokens.OP, s1, this._pos, e);
                        }
                    }
                    break;
                default:
                    s1=this._working.match(/\d+\.\d+|\d+|\w+|\s+/)[0];
                    if(s1.replace(/\s+/g,"") == ""){ //whitespace
                        rslt = new mod.Token(mod.tokens.WSP, s1, this._pos);
                    }else if(/^\d|\d\.\d/.test(s1)){//number
                        rslt =  new mod.Token(mod.tokens.NUM, s1, this._pos);
                    }else{//name
                        rslt =new mod.Token(mod.tokens.NAME, s1, this._pos);
                    }
            }
            
            this._working=this._working.slice(rslt.value.length);
            this._pos += rslt.value.length;
            return rslt;
        }
        
        var searchQoute = function(s, q){
            if(q=="'"){
                return s.search(/[\\']/);
            }else{
                return s.search(/[\\"]/);
            }
        }
        
        var extractQString=function(s){
            if(s.charAt(0) == "'"){
                var q="'";
            }else{
                var q='"';
            }
            s=s.slice(1);
            var rs="";
            var p= searchQoute(s, q);
            while(p >= 0){
                if(p >=0){
                    if(s.charAt(p) == q){
                        rs += s.slice(0, p+1);
                        s = s.slice(p+1);
                        return q + rs;
                    }else{
                        rs+=s.slice(0, p+2);
                        s = s.slice(p+2);
                    }
                }
                p = searchQoute(s, q);
            }
            throw "End of String expected.";
        }
        
        var extractSLComment=function(s){
            var p = s.search(/\n/);
            if(p>=0){
                return s.slice(0,p+1);
            }else{
                return s;
            }
        }
        
        var extractMLComment=function(s){
            var p = s.search(/\*\//);
            if(p>=0){
                return s.slice(0,p+2);
            }else{
                throw "End of comment expected.";
            }
        }
        
        var extractRegExp=function(s){
            var p=0;
            for(var i=0;i<s.length;i++){
                if(s.charAt(i) == "/"){
                    p=i;
                }
                if(s.charAt(i) == "\n"){
                    i = s.length;
                }
            }
            return s.slice(0,p+1);
        }
    })
    
    /**
        Converts an object to JSON.
    */
    Object.prototype.toJSON = function(){
        var v=[];
        for(attr in this){
            if(typeof this[attr] != "function"){
                v.push('"' + attr + '": ' + mod.objToJson(this[attr]));
            }
        }
        return "{" + v.join(", ") + "}";
    }
    
    /**
        Converts a String to JSON.
    */
    String.prototype.toJSON = function(){
        var s = '"' + this.replace(/(["\\])/g, '\\$1') + '"';
        s = s.replace(/(\n)/g,"\\n");
        return s;
    }
    
    /**
        Converts a Number to JSON.
    */
    Number.prototype.toJSON = function(){
        return this.toString();
    }
    
    /**
        Converts a Boolean to JSON.
    */
    Boolean.prototype.toJSON = function(){
        return this.toString();
    }
    
    /**
        Converts a Date to JSON.
        Date representation is not defined in JSON.
    */
    Date.prototype.toJSON= function(){
        var padd=function(s, p){
            s=p+s
            return s.substring(s.length - p.length)
        }
        var y = padd(this.getUTCFullYear(), "0000");
        var m = padd(this.getUTCMonth() + 1, "00");
        var d = padd(this.getUTCDate(), "00");
        var h = padd(this.getUTCHours(), "00");
        var min = padd(this.getUTCMinutes(), "00");
        var s = padd(this.getUTCSeconds(), "00");
        
        var isodate = y +  m  + d + "T" + h +  ":" + min + ":" + s
        
        return '{"jsonclass":["sys.ISODate", ["' + isodate + '"]]}';
    }
    
    /**
        Converts an Array to JSON.
    */
    Array.prototype.toJSON = function(){
        var v = [];
        for(var i=0;i<this.length;i++){
            v.push(mod.objToJson(this[i])) ;
        }
        return "[" + v.join(", ") + "]";
    }
        
})

