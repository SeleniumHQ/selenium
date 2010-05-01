
%%{
  machine build;

  string = '"' >start_string  /[^"]*/ $track %leaving '"';
  symbol = ':' lower >start_symbol $track (alpha | digit | '_')* $track %leaving;

  map_value = (string | symbol);
  map_key = (string | symbol);
  map_entry = map_key >start_map_entry space* '=>' space* map_value %leaving;
  map_entries = space* map_entry space* (',' space* map_entry space*)*;
  map = '{' >start_map map_entries '}' %leaving;

  array_value = string | symbol | map;
  array_values = space* array_value space* (',' space* array_value space*)*;
  array = '[' > start_array array_values ']' %leaving;

  type_name = [a-z] >start_type_name $track [a-z0-9_]* $track %leaving;

  arg_name = [a-z] >start_arg_name $track [a-z0-9_]* $track %leaving;
  arg_value = string | symbol | array;
  arg = space* >start_arg arg_name space* '=' space* arg_value space* %leaving;
  args = arg (',' arg)*;

  output_type = type_name >start_type '(' args ')' %leaving;
  
  eol = '\n' | '\r' | '\r\n';
  comment = '#' ^eol* eol;
  ignored = space | comment;
  
  main := (ignored* output_type ignored*)+ @done;
}%%
