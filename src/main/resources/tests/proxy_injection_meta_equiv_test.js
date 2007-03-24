// this fragment was making PI mode inject.  Oops -- should only inject HTML containing 66
//#DWR-START#
var s1="<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN \" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"><html xmlns=\"http://www.w3.org/1999/xhtml\">\n<head>\n  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=ISO-8859-"; var s2="1\" />\n  <title>Insert</title>\n</head>\n<body>n<p><strong>DWR tests passed</strong></p>\n\n</body>\n</html>\n";
var s0=s1+s2;
//#DWR-END#
