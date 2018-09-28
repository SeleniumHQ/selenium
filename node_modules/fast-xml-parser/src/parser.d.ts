type X2jOptions = {
  attributeNamePrefix: string;
  attrNodeName: false | string;
  textNodeName: string;
  ignoreAttributes: boolean;
  ignoreNameSpace: boolean;
  allowBooleanAttributes: boolean;
  parseNodeValue: boolean;
  parseAttributeValue: boolean;
  arrayMode: boolean;
  trimValues: boolean;
  cdataTagName: false | string;
  cdataPositionChar: string;
  localeRange:  string;
  parseTrueNumberOnly: boolean;
  tagValueProcessor: (tagValue: string) => string;
  attrValueProcessor: (attrValue: string) => string;
};
type X2jOptionsOptional = Partial<X2jOptions>;

type J2xOptions = {
  attributeNamePrefix: string;
  attrNodeName: false | string;
  textNodeName: string;
  ignoreAttributes: boolean;
  cdataTagName: false | string;
  cdataPositionChar: string;
  format: boolean;
  indentBy: string;
  supressEmptyNode: boolean;
  tagValueProcessor: (tagValue: string) => string;
  attrValueProcessor: (attrValue: string) => string;
};
type J2xOptionsOptional = Partial<J2xOptions>;

type ESchema = string | object | Array<string|object>;

type ValidationError = {
  err: { code: string; msg: string };
};

export function parse(xmlData: string, options?: X2jOptionsOptional): any;
export function convert2nimn(
  node: any,
  e_schema: ESchema,
  options?: X2jOptionsOptional
): any;
export function getTraversalObj(
  xmlData: string,
  options?: X2jOptionsOptional
): any;
export function convertToJson(node: any, options?: X2jOptionsOptional): any;
export function convertToJsonString(
  node: any,
  options?: X2jOptionsOptional
): string;
export function validate(
  xmlData: string,
  options?: { allowBooleanAttributes?: boolean }
): true | ValidationError;
export class j2xParser {
  constructor(options: J2xOptionsOptional);
  parse(options: any): any;
}
export function parseToNimn(
  xmlData: string,
  schema: any,
  options: Partial<X2jOptions>
): any;
