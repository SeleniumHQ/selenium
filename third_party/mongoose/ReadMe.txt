This project contains version 3.1 of the Mongoose web server project, as 
found at http://code.google.com/p/mongoose.

It contains the code for version 3.1 as of 06-Nov-2011 (revision 4b235538bc43).

It contains an additional change in pthread_cond_broadcast() [~line 872] to 
improve stability when running a debug build.

It also contains changes added by the Chromium team to better support
Keep-Alive connections. These changes can be found at
http://codereview.chromium.org/8423073/patch/1028/12029