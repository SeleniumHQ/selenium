/*
  Copyright (c) 2003 Jan-Klaas Kollhof
  
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

if(Function.prototype.apply == null){
    Function.prototype.apply = function(thisObj, args){
        var a =[];
        for(var i=0;i<args.length;i++){
            a[i] = "args[" + i + "]";
        }
        thisObj.__apply__ = this;
        a="thisObj.__apply__(" + a.join(",") +")";
        var r = eval(a);
        delete thisObj.__apply__;
        return r;
    }
}
if(Function.prototype.call==null){
    Function.prototype.call=function(thisObj){
        var args=[]; //copy all arguments but the first
        for(var i=1;i<arguments.length;i++){
            args[i-1] = arguments[i];
        }
        return this.apply(thisObj, args);
    }
}


///----------------------------------Array functions----------------------------------
if(Array.prototype.splice == null){
    Array.prototype.splice = function(index, howMany){
        var a = this.slice(0, index);
        var e = this.slice(index + howMany, this.length);
        var r = this.slice(index, index+howMany);
        this.length=0;
        for(var i=0;i<a.length;i++){
            this[this.length] = a[i];
        }
        for(var i=2;i<arguments.length;i++){
            this[this.length] = arguments[i];
        }
        for(var i=0;i<e.length;i++){
            this[this.length] = e[i];
        }
        return r;
    }
}

if(Array.prototype.pop == null){
    Array.prototype.pop = function(){
        var e=this[this.length-1];
        this.length -= 1;
        return e;
    }
}

if(Array.prototype.push == null){
    Array.prototype.push = function(){
        for(var i=0;i<arguments.length;i++){
            this[this.length] = arguments[i];
        }
        return this.length;
    }
}

if(Array.prototype.shift == null){
    Array.prototype.shift = function(){
        var e = this[0];
        for(var i=1;i<this.length;i++){
            this[i-1] = this[i];
        }
        this.length -= 1;
        return e;
    }
}

if(Array.prototype.unshift == null){
    Array.prototype.unshift = function(){
        var a=[]
        for(var i=0;i<arguments.length;i++){
            a[i] = arguments[i];
        }
        for(var i=0;i<this.length;i++){
            a[a.length] = this[i];
        }
        this.length=a.length;
        for(var i=0;i<a.length;i++){
            this[i] = a[i];
        }
        return this.length;
    }
}


/**
    Number functions.
    
    Contributed by Wolfgang Dumhs.
*/
if(Number.prototype.toFixed == null){
    Number.prototype.toFixed = function(d){
        var n = this;
        d = d || 0;
        var f = Math.pow(10, d);
        n = Math.round (f * n) / f;
        n = (n >= 0) ? n+Math.pow(10, -(d+1)) : n-Math.pow(10, -(d+1));
        n += '';
        return d == 0 ? n.substring(0, n.indexOf('.')) : n.substring(0, n.indexOf('.') + d + 1);
    }
}

if(Number.prototype.toExponential == null){
    Number.prototype.toExponential = function(d){
        var n = this;
        var e = 0;
        if (n != 0){
            e = Math.floor(Math.log(Math.abs(n)) / Math.LN10);
        }
        n /= Math.pow(10, e);
        if (isFinite(d)){
            if (Math.abs(n) + 5*Math.pow(10, -(d+1)) >= 10.0){
                n /= 10;
                e += 1;
            }
            n = n.toFixed(d);
        }
        n += "e";
        if (e >= 0){
            n += "+";
        }
        n += e;
        return n;
    }
}

