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


/**    
    Evaluates script in a global scope.
    @param [0]  The code to evaluate.
*/
globalEval=function(){
    return eval(arguments[0]);
}


/**
    Creates a new class object which inherits from superClass.
    @param className="anonymous"  The name of the new class.
                                                  If the created class is a public member of a module then 
                                                  the className is automatically set.
    @param superClass=Object        The class to inherit from (super class).
    @param classScope                  A function which is executed for class construction.
                                                As 1st parameter it will get the new class' protptype for 
                                                overrideing or extending the super class. As 2nd parameter it will get
                                                the super class' wrapper for calling inherited methods.
*/
Class = function(className, superClass, classScope){
    if(arguments.length == 2){
        classScope = superClass;
        if(typeof className != "string"){
            superClass = className;
            className = "anonymous";
        }else{
            superClass = Object;
        }
    }else if(arguments.length == 1){
        classScope = className;
        superClass = Object;
        className = "anonymous";
    }
    
    //this is the constructor for the new objects created from the new class.
    //if and only if it is NOT used for prototyping/subclassing the init method of the newly created object will be called.
    var NewClass = function(calledBy){
        if(calledBy !== Class){
            return this.init.apply(this, arguments);
        }
    }
    //This will create a new prototype object of the new class.
    NewClass.createPrototype = function(){
        return new NewClass(Class);
    }
    //setting class properties for the new class.
    NewClass.superClass = superClass;
    NewClass.className=className; 
    NewClass.toString = function(){
        return "[class %s]".format(NewClass.className);
    };
    if(superClass.createPrototype!=null){//see if the super class can create prototypes. (creating an object without calling init())
        NewClass.prototype = superClass.createPrototype();
    }else{//just create an object of the super class
        NewClass.prototype = new superClass();
    }
    //reset the constructor for new objects to the actual constructor.
    NewClass.prototype.constructor = NewClass;
    
    if(superClass == Object){//all other objects already have a nice toString method.
        NewClass.prototype.toString = function(){
            return "[object %s]".format(this.constructor.className);
        };
    }
    
    if(NewClass.prototype.init==null){
        NewClass.prototype.init=function(){
        }
    }
   
    
    //create a supr  function to be used to call methods of the super class
    var supr = function(self){
        //set up super class functionality  so a call to super(this) will return an object with all super class methods 
        //the methods can be called like super(this).foo and the this object will be bound to that method
        var wrapper = {};
        var superProto = superClass.prototype;
        for(var n in superProto){
            if(typeof superProto[n] == "function"){
                 wrapper[n] = function(){
                    var f = arguments.callee;
                    return superProto[f._name].apply(self, arguments);
                }
                wrapper[n]._name = n;
            }
        }
        return wrapper;
    }
        
    //execute the scope of the class
    classScope(NewClass.prototype, supr);
    
    return NewClass;
}    
Class.toString = function(){
    return "[object Class]";
}
Class.createPrototype=function(){ 
    throw "Can't use Class as a super class.";
}

/**
    Creates a new module and registers it.
    @param name              The name of the module.
    @param version            The version of a module.
    @param moduleScope    A function which is executed for module creation.
                                     As 1st parameter it will get the module variable.                                     
*/
Module = function(name, version, moduleScope){
    var mod = new Object();
    mod.version = version;
    mod.name = name;
    mod.toString=function(){
        return "[module '%s' version: %s]".format(mod.name, mod.version);
    }
    
    /**
        Base class for all module-Exceptions.
    */
    mod.Exception=Class("Exception", function(publ){
        /**
            Initializes a new Exception.
            @param msg           The error message for the user.
            @param trace=null   The error causing this Exception if available.
        */
        publ.init=function(msg, trace){
            this.name = this.constructor.className;
            this.message = msg;
            this.trace = trace;
        }
        
        publ.toString=function(){
            var s = "%s %s\n\n".format(this.name, this.module);
            s += this.message;
            return s;
        }
        /**
            Returns the complete trace of the exception.
            @return The error trace.
        */
        publ.toTraceString=function(){
            var s = "%s %s:\n    ".format(this.name, this.module );
            s+="%s\n\n".format(this.message);
            if(this.trace){
                if(this.trace.toTraceString){
                    s+= this.trace.toTraceString();
                }else{
                    s+= this.trace;
                }
            }
            return s;
        }
        ///The name of the Exception(className).
        publ.name;
        ///The error message.
        publ.message;
        ///The module the Exception belongs to.
        publ.module = mod;
        ///The error which caused the Exception or null.
        publ.trace;      
    })
    
    //execute the scope of the module
    moduleScope(mod);
    
    //todo: set classNames for anonymous classes.
    for(var n in mod){
        if(mod[n].className == "anonymous"){
            mod[n].className = n;
        }
    }
    
    if(name != "jsolait"){
        jsolait.registerModule(mod);
    }
    return mod;
}
Module.toString = function(){
    return "[object Module]";
}
Module.createPrototype=function(){ 
    throw "Can't use Module as a super class.";
}

//docstart
/**
    The root module for jsolait.
    It provides some global functionality for loading modules,
    some String enhancements.
*/
Module("jsolait", "0.1.0", function(mod){
    ///The global jsolait object.
    jsolait=mod;
    
    ///base url for user modules.
    mod.baseURL=".";
    ///The URL where jsolait is installed.
    mod.libURL ="./jsolait";
    ///Collection of all loaded modules.(module cache)
    mod.modules = new Array();
    ///The URLs of there the modules, part of jsolait.
    mod.moduleURLs = {urllib:"%(libURL)s/lib/urllib.js",
                                      xml:"%(libURL)s/lib/xml.js",
                                      crypto:"%(libURL)s/lib/crypto.js",
                                      codecs:"%(libURL)s/lib/codecs.js",
                                      jsonrpc:"%(libURL)s/lib/jsonrpc.js",
                                      lang:"%(libURL)s/lib/lang.js",
                                      xmlrpc:"%(libURL)s/lib/xmlrpc.js"};
   
    mod.init=function(){
        //make jsolait work with WScript
        var ws = null;
        try{//see if WScript is available
            ws = WScript;
        }catch(e){
        }
        if(ws != null){
            initWS();
        }
    }
    
    ///initializes jsolait for using it with WScript
    var initWS = function(){
        print=function(msg){
            WScript.echo(msg);
        }
        alert=function(msg){
            print(msg);
        }
        var args = WScript.arguments;
        try{
            //get script to execute
            var url = args(0);
            url = url.replace(/\\/g, "/");
            url = url.split("/");
            url = url.slice(0, url.length-1);
            //set base for user module loading
            mod.baseURL = url.join("/");
        }catch(e){
            throw new mod.Exception("Missing script filename to be run.", e);
        }
        
        //location of jsolait/init.js
        url = WScript.ScriptFullName;
        
        if(args(0).replace("file://","").toLowerCase() == url.toLowerCase()){
            WScript.stderr.write("Can't run myself! exiting ... \n");
            return;
        }
        url = url.replace(/\\/g, "/");
        url = url.split("/");
        url = url.slice(0, url.length-1);
        mod.libURL = "file://" + url.join("/");
        try{
            mod.loadScript(args(0));
        }catch(e){
            WScript.stdErr.write("%s(1,1) jsolait runtime error:\n%s\n".format(args(0).replace("file://",""), e.toTraceString()));
        }
    }
    
    
    /**
       Imports a module given its name(someModule.someSubModule).
       A module's file location is determined by treating each module name as a directory.
       Only the last one points to a file.
       If the module's URL is not known to jsolait then it will be searched for in jsolait.baseURL which is "." by default.
       @param name   The name of the module to load.
       @return           The module object.
    */
    mod.importModule = function(name){

        if (mod.modules[name]){ //module already loaded
            return mod.modules[name];
        }else{
            var src,modURL;
            //check if jsolait already knows the url of the module(moduleURLs contains urls to modules)
            if(mod.moduleURLs[name]){
                modURL = mod.moduleURLs[name].format(mod);
            }else{//assume it's a user module and located at baseURL
                modURL = "%s/%s.js".format(mod.baseURL, name.split(".").join("/"));
            }  
            try{//to load module from location calculated above
                src = getFile(modURL);
            }catch(e){//module could not be found at the location.
                throw new mod.ModuleImportFailed(name, modURL, e);
            }
            
            try{//interpret the script
                globalEval(src);
            }catch(e){
                throw new mod.ModuleImportFailed(name, modURL, e);
            }
            //the module should have registered itself
            return mod.modules[name]; 
        }
    }
    //make it global
    importModule = mod.importModule;
    
    /**
        Loads and interprets a script file.
        @param url  The url of the script to load.
    */
    mod.loadScript=function(url){
        var src = getFile(url);
        try{//to interpret the source 
            globalEval(src);
        }catch(e){
            throw new mod.EvalFailed(url, e);
        }
    }
    /**
        Registers a new module. 
        Registered modules can be imported with importModule(...).
        @param module  The module to register.
    */
    mod.registerModule = function(module){
        this.modules[module.name] = module;
    }
    
    /**
        Creates an HTTP request object for retreiving files.
        @return HTTP request object.
    */
    var getHTTP=function() {
        var obj;
        try{ //to get the mozilla httprequest object
            obj = new XMLHttpRequest();
        }catch(e){
            try{ //to get MS HTTP request object
                obj=new ActiveXObject("Msxml2.XMLHTTP.4.0");
            }catch(e){
                try{ //to get MS HTTP request object
                    obj=new ActiveXObject("Msxml2.XMLHTTP");
                }catch(e){
                    try{// to get the old MS HTTP request object
                        obj = new ActiveXObject("microsoft.XMLHTTP"); 
                    }catch(e){
                        throw new mod.Exception("Unable to get an HTTP request object.");
                    }
                }    
            }
        }
        return obj;
    }
    /**
        Retrieves a file given its URL.
        @param url             The url to load.
        @param headers=[]  The headers to use.
        @return                 The content of the file.
    */
    var getFile=function(url, headers) { 
        //if callback is defined then the operation is done async
        headers = (headers != null) ? headers : [];
        //setup the request
        try{
            var xmlhttp= getHTTP();
            xmlhttp.open("GET", url, false);
            for(var i=0;i< headers.length;i++){
                xmlhttp.setRequestHeader(headers[i][0], headers[i][1]);    
            }
            xmlhttp.send("");
        }catch(e){
            throw new mod.Exception("Unable to load URL: '%s'.".format(url), e);
        }
        if(xmlhttp.status == 200 || xmlhttp.status == 0){
            return xmlhttp.responseText;
        }else{
             throw new mod.Exception("File not loaded: '%s'.".format(url));
        }
    }
    
    Error.prototype.toTraceString = function(){
        if(this.message){
            return "%s\n".format(this.message);
        }
        if (this.description){
           return "%s\n".format(this.description);
        }
        return "unknown error\n"; 
    }
   
    
    /**
        Thrown when a module could not be found.
    */
    mod.ModuleImportFailed=Class(mod.Exception, function(publ, supr){
        /**
            Initializes a new ModuleImportFailed Exception.
            @param name      The name of the module.
            @param url          The url of the module.
            @param trace      The error cousing this Exception.
        */
        publ.init=function(moduleName, url, trace){
            supr(this).init("Failed to import module: '%s' from URL:'%s'".format(moduleName, url), trace);
            this.moduleName = moduleName;
            this.url = url;
        }
        ///The  name of the module that was not found.
        publ.moduleName;
        ///The url the module was expected to be found at.
        publ.url;
    })
    
    /**
        Thrown when a source could not be loaded due to an interpretation error.
    */
    mod.EvalFailed=Class(mod.Exception, function(publ, supr){
        /**
            Initializes a new EvalFailed exception.
            @param url                   The url of the module.
            @param trace               The exception that was thrown while interpreting the module's source code.
        */
        publ.init=function(url, trace){
            supr(this).init("File '%s' Eval of script failed.".format(url), trace);
            this.url = url;
        }
        ///The url the module was expected to be found at.
        publ.url;
    })
    
    /**
        Displays an exception and it's trace.
        This works better than alert(e) because traces are taken into account.
        @param exception  The exception to display.
    */
    mod.reportException=function(exception){
        if(exception.toTraceString){
            var s= exception.toTraceString();
        }else{
            var s = exception.toString();
        }
        var ws = null;
        try{//see if WScript is available
            ws = WScript;
        }catch(e){
        }
        if(ws != null){
            WScript.stderr.write(s);
        }else{
            alert(s);
        }
    }    
    ///The global exception report method;
    reportException = mod.reportException;
})

//stringmod
/**
    String formatting module.
    It allows python like string formatting ("some text %s" % "something").
    Also similar to sprintf from C.
*/
Module("stringformat", "0.1.0", function(mod){
    /**
        Creates a format specifier object. 
    */
    var FormatSpecifier=function(s){
        var s = s.match(/%(\(\w+\)){0,1}([ 0-]){0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}(.)/);
        if(s[1]){
            this.key=s[1].slice(1,-1);
        }else{
            this.key = null;
        }
        this.paddingFlag = s[2];
        if(this.paddingFlag==""){
            this.paddingFlag =" " 
        }
        this.signed=(s[3] == "+");
        this.minLength = parseInt(s[4]);
        if(isNaN(this.minLength)){
            this.minLength=0;
        }
        if(s[5]){
            this.percision = parseInt(s[5].slice(1,s[5].length));
        }else{
            this.percision=-1;
        }
        this.type = s[6];
    }

    /**
        Formats a string replacing formatting specifiers with values provided as arguments
        which are formatted according to the specifier.
        This is an implementation of  python's % operator for strings and is similar to sprintf from C.
        Usage:
            resultString = formatString.format(value1, v2, ...);
        
        Each formatString can contain any number of formatting specifiers which are
        replaced with the formated values.
        
        specifier([...]-items are optional): 
            "%(key)[flag][sign][min][percision]typeOfValue"
            
            (key)  If specified the 1st argument is treated as an object/associative array and the formating values 
                     are retrieved from that object using the key.
                
            flag:
                0      Use 0s for padding.
                -      Left justify result, padding it with spaces.
                        Use spaces for padding.
            sign:
                +      Numeric values will contain a +|- infront of the number.
            min:
                l      The string will be padded with the padding character until it has a minimum length of l. 
            percision:
               .x     Where x is the percision for floating point numbers and the lenght for 0 padding for integers.
            typeOfValue:
                d    Signed integer decimal.  	 
                i     Signed integer decimal. 	 
                b    Unsigned binary.                       //This does not exist in python!
                o    Unsigned octal. 	
                u    Unsigned decimal. 	 
                x    Unsigned hexidecimal (lowercase). 	
                X   Unsigned hexidecimal (uppercase). 	
                e   Floating point exponential format (lowercase). 	 
                E   Floating point exponential format (uppercase). 	 
                f    Floating point decimal format. 	 
                F   Floating point decimal format. 	 
                c   Single character (accepts byte or single character string). 	 
                s   String (converts any object using object.toString()). 	
        
        Examples:
            "%02d".format(8) == "08"
            "%05.2f".format(1.234) == "01.23"
            "123 in binary is: %08b".format(123) == "123 in binary is: 01111011"
            
        @param *  Each parameter is treated as a formating value. 
        @return The formated String.
    */
    String.prototype.format=function(){
        var sf = this.match(/(%(\(\w+\)){0,1}[ 0-]{0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}[dibouxXeEfFgGcrs%])|([^%]+)/g);
        if(sf){
            if(sf.join("") != this){
                throw new mod.Exception("Unsupported formating string.");
            }
        }else{
            throw new mod.Exception("Unsupported formating string.");
        }
        var rslt ="";
        var s;
        var obj;
        var cnt=0;
        var frmt;
        var sign="";
        
        for(var i=0;i<sf.length;i++){
            s=sf[i];
            if(s == "%%"){
                s = "%";
            }else if(s.slice(0,1) == "%"){
                frmt = new FormatSpecifier(s);//get the formating object
                if(frmt.key){//an object was given as formating value
                    if((typeof arguments[0]) == "object" && arguments.length == 1){
                        obj = arguments[0][frmt.key];
                    }else{
                        throw new mod.Exception("Object or associative array expected as formating value.");
                    }
                }else{//get the current value
                    if(cnt>=arguments.length){
                        throw new mod.Exception("Not enough arguments for format string");
                    }else{
                        obj=arguments[cnt];
                        cnt++;
                    }
                }
                    
                if(frmt.type == "s"){//String
                    if (obj == null){
                        obj = "null";
                    }
                    s=obj.toString().pad(frmt.paddingFlag, frmt.minLength);
                    
                }else if(frmt.type == "c"){//Character
                    if(frmt.paddingFlag == "0"){
                        frmt.paddingFlag=" ";//padding only spaces
                    }
                    if(typeof obj == "number"){//get the character code
                        s = String.fromCharCode(obj).pad(frmt.paddingFlag , frmt.minLength) ;
                    }else if(typeof obj == "string"){
                        if(obj.length == 1){//make sure it's a single character
                            s=obj.pad(frmt.paddingFlag, frmt.minLength);
                        }else{
                            throw new mod.Exception("Character of length 1 required.");
                        }
                    }else{
                        throw new mod.Exception("Character or Byte required.");
                    }
                }else if(typeof obj == "number"){
                    //get sign of the number
                    if(obj < 0){
                        obj = -obj;
                        sign = "-"; //negative signs are always needed
                    }else if(frmt.signed){
                        sign = "+"; // if sign is always wanted add it 
                    }else{
                        sign = "";
                    }
                    //do percision padding and number conversions
                    switch(frmt.type){
                        case "f": //floats
                        case "F":
                            if(frmt.percision > -1){
                                s = obj.toFixed(frmt.percision).toString();
                            }else{
                                s = obj.toString();
                            }
                            break;
                        case "E"://exponential
                        case "e":
                            if(frmt.percision > -1){
                                s = obj.toExponential(frmt.percision);
                            }else{
                                s = obj.toExponential();
                            }
                            s = s.replace("e", frmt.type);
                            break;
                        case "b"://binary
                            s = obj.toString(2);
                            s = s.pad("0", frmt.percision);
                            break;
                        case "o"://octal
                            s = obj.toString(8);
                            s = s.pad("0", frmt.percision);
                            break;
                        case "x"://hexadecimal
                            s = obj.toString(16).toLowerCase();
                            s = s.pad("0", frmt.percision);
                            break;
                        case "X"://hexadecimal
                            s = obj.toString(16).toUpperCase();
                            s = s.pad("0", frmt.percision);
                            break;
                        default://integers
                            s = parseInt(obj).toString();
                            s = s.pad("0", frmt.percision);
                            break;
                    }
                    if(frmt.paddingFlag == "0"){//do 0-padding
                        //make sure that the length of the possible sign is not ignored
                        s=s.pad("0", frmt.minLength - sign.length);
                    }
                    s=sign + s;//add sign
                    s=s.pad(frmt.paddingFlag, frmt.minLength);//do padding and justifiing
                }else{
                    throw new mod.Exception("Number required.");
                }
            }
            rslt += s;
        }
        return rslt;
    }
    
    /**
        Padds a String with a character to have a minimum length.
        
        @param flag   "-":      to padd with " " and left justify the string.
                            Other: the character to use for padding. 
        @param len    The minimum length of the resulting string.
    */
    String.prototype.pad = function(flag, len){
        var s = "";
        if(flag == "-"){
            var c = " ";
        }else{
            var c = flag;
        }
        for(var i=0;i<len-this.length;i++){
            s += c;
        }
        if(flag == "-"){
            s = this + s;
        }else{
            s += this;
        }
        return s;
    }
    
    /**
        Repeats a string.
        @param c  The count how often the string should be repeated.
    */
    String.prototype.mul = function(c){
        var a = new Array(this.length * c);
        var s=""+ this;
        for(var i=0;i<c;i++){
            a[i] = s;
        }
        return a.join("");
    }
})

//let jsolait do some startup initialization
jsolait.init();

