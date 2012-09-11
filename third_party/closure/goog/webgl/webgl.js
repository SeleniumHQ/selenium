// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Constants used by the WebGL rendering, including all of the
 * constants used from the WebGL context.  For example, instead of using
 * context.ARRAY_BUFFER, your code can use
 * goog.webgl.ARRAY_BUFFER. The benefits for doing this include allowing
 * the compiler to optimize your code so that the compiled code does not have to
 * contain large strings to reference these properties, and reducing runtime
 * property access.
 *
 * Values are taken from the WebGL Spec:
 * https://www.khronos.org/registry/webgl/specs/1.0/#WEBGLRENDERINGCONTEXT
 */

goog.provide('goog.webgl');


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_BUFFER_BIT = 0x00000100;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BUFFER_BIT = 0x00000400;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_BUFFER_BIT = 0x00004000;


/**
 * @const
 * @type {number}
 */
goog.webgl.POINTS = 0x0000;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINES = 0x0001;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINE_LOOP = 0x0002;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINE_STRIP = 0x0003;


/**
 * @const
 * @type {number}
 */
goog.webgl.TRIANGLES = 0x0004;


/**
 * @const
 * @type {number}
 */
goog.webgl.TRIANGLE_STRIP = 0x0005;


/**
 * @const
 * @type {number}
 */
goog.webgl.TRIANGLE_FAN = 0x0006;


/**
 * @const
 * @type {number}
 */
goog.webgl.ZERO = 0;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE = 1;


/**
 * @const
 * @type {number}
 */
goog.webgl.SRC_COLOR = 0x0300;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_SRC_COLOR = 0x0301;


/**
 * @const
 * @type {number}
 */
goog.webgl.SRC_ALPHA = 0x0302;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_SRC_ALPHA = 0x0303;


/**
 * @const
 * @type {number}
 */
goog.webgl.DST_ALPHA = 0x0304;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_DST_ALPHA = 0x0305;


/**
 * @const
 * @type {number}
 */
goog.webgl.DST_COLOR = 0x0306;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_DST_COLOR = 0x0307;


/**
 * @const
 * @type {number}
 */
goog.webgl.SRC_ALPHA_SATURATE = 0x0308;


/**
 * @const
 * @type {number}
 */
goog.webgl.FUNC_ADD = 0x8006;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_EQUATION = 0x8009;


/**
 * Same as BLEND_EQUATION
 * @const
 * @type {number}
 */
goog.webgl.BLEND_EQUATION_RGB = 0x8009;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_EQUATION_ALPHA = 0x883D;


/**
 * @const
 * @type {number}
 */
goog.webgl.FUNC_SUBTRACT = 0x800A;


/**
 * @const
 * @type {number}
 */
goog.webgl.FUNC_REVERSE_SUBTRACT = 0x800B;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_DST_RGB = 0x80C8;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_SRC_RGB = 0x80C9;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_DST_ALPHA = 0x80CA;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_SRC_ALPHA = 0x80CB;


/**
 * @const
 * @type {number}
 */
goog.webgl.CONSTANT_COLOR = 0x8001;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_CONSTANT_COLOR = 0x8002;


/**
 * @const
 * @type {number}
 */
goog.webgl.CONSTANT_ALPHA = 0x8003;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_CONSTANT_ALPHA = 0x8004;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_COLOR = 0x8005;


/**
 * @const
 * @type {number}
 */
goog.webgl.ARRAY_BUFFER = 0x8892;


/**
 * @const
 * @type {number}
 */
goog.webgl.ELEMENT_ARRAY_BUFFER = 0x8893;


/**
 * @const
 * @type {number}
 */
goog.webgl.ARRAY_BUFFER_BINDING = 0x8894;


/**
 * @const
 * @type {number}
 */
goog.webgl.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;


/**
 * @const
 * @type {number}
 */
goog.webgl.STREAM_DRAW = 0x88E0;


/**
 * @const
 * @type {number}
 */
goog.webgl.STATIC_DRAW = 0x88E4;


/**
 * @const
 * @type {number}
 */
goog.webgl.DYNAMIC_DRAW = 0x88E8;


/**
 * @const
 * @type {number}
 */
goog.webgl.BUFFER_SIZE = 0x8764;


/**
 * @const
 * @type {number}
 */
goog.webgl.BUFFER_USAGE = 0x8765;


/**
 * @const
 * @type {number}
 */
goog.webgl.CURRENT_VERTEX_ATTRIB = 0x8626;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRONT = 0x0404;


/**
 * @const
 * @type {number}
 */
goog.webgl.BACK = 0x0405;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRONT_AND_BACK = 0x0408;


/**
 * @const
 * @type {number}
 */
goog.webgl.CULL_FACE = 0x0B44;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND = 0x0BE2;


/**
 * @const
 * @type {number}
 */
goog.webgl.DITHER = 0x0BD0;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_TEST = 0x0B90;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_TEST = 0x0B71;


/**
 * @const
 * @type {number}
 */
goog.webgl.SCISSOR_TEST = 0x0C11;


/**
 * @const
 * @type {number}
 */
goog.webgl.POLYGON_OFFSET_FILL = 0x8037;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_COVERAGE = 0x80A0;


/**
 * @const
 * @type {number}
 */
goog.webgl.NO_ERROR = 0;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_ENUM = 0x0500;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_VALUE = 0x0501;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_OPERATION = 0x0502;


/**
 * @const
 * @type {number}
 */
goog.webgl.OUT_OF_MEMORY = 0x0505;


/**
 * @const
 * @type {number}
 */
goog.webgl.CW = 0x0900;


/**
 * @const
 * @type {number}
 */
goog.webgl.CCW = 0x0901;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINE_WIDTH = 0x0B21;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALIASED_POINT_SIZE_RANGE = 0x846D;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALIASED_LINE_WIDTH_RANGE = 0x846E;


/**
 * @const
 * @type {number}
 */
goog.webgl.CULL_FACE_MODE = 0x0B45;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRONT_FACE = 0x0B46;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_RANGE = 0x0B70;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_WRITEMASK = 0x0B72;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_CLEAR_VALUE = 0x0B73;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_FUNC = 0x0B74;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_CLEAR_VALUE = 0x0B91;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_FUNC = 0x0B92;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_FAIL = 0x0B94;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_PASS_DEPTH_FAIL = 0x0B95;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_PASS_DEPTH_PASS = 0x0B96;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_REF = 0x0B97;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_VALUE_MASK = 0x0B93;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_WRITEMASK = 0x0B98;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_FUNC = 0x8800;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_FAIL = 0x8801;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_REF = 0x8CA3;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_VALUE_MASK = 0x8CA4;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_WRITEMASK = 0x8CA5;


/**
 * @const
 * @type {number}
 */
goog.webgl.VIEWPORT = 0x0BA2;


/**
 * @const
 * @type {number}
 */
goog.webgl.SCISSOR_BOX = 0x0C10;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_CLEAR_VALUE = 0x0C22;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_WRITEMASK = 0x0C23;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_ALIGNMENT = 0x0CF5;


/**
 * @const
 * @type {number}
 */
goog.webgl.PACK_ALIGNMENT = 0x0D05;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_TEXTURE_SIZE = 0x0D33;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VIEWPORT_DIMS = 0x0D3A;


/**
 * @const
 * @type {number}
 */
goog.webgl.SUBPIXEL_BITS = 0x0D50;


/**
 * @const
 * @type {number}
 */
goog.webgl.RED_BITS = 0x0D52;


/**
 * @const
 * @type {number}
 */
goog.webgl.GREEN_BITS = 0x0D53;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLUE_BITS = 0x0D54;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALPHA_BITS = 0x0D55;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_BITS = 0x0D56;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BITS = 0x0D57;


/**
 * @const
 * @type {number}
 */
goog.webgl.POLYGON_OFFSET_UNITS = 0x2A00;


/**
 * @const
 * @type {number}
 */
goog.webgl.POLYGON_OFFSET_FACTOR = 0x8038;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_BINDING_2D = 0x8069;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_BUFFERS = 0x80A8;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLES = 0x80A9;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_COVERAGE_VALUE = 0x80AA;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_COVERAGE_INVERT = 0x80AB;


/**
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_TEXTURE_FORMATS = 0x86A3;


/**
 * @const
 * @type {number}
 */
goog.webgl.DONT_CARE = 0x1100;


/**
 * @const
 * @type {number}
 */
goog.webgl.FASTEST = 0x1101;


/**
 * @const
 * @type {number}
 */
goog.webgl.NICEST = 0x1102;


/**
 * @const
 * @type {number}
 */
goog.webgl.GENERATE_MIPMAP_HINT = 0x8192;


/**
 * @const
 * @type {number}
 */
goog.webgl.BYTE = 0x1400;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_BYTE = 0x1401;


/**
 * @const
 * @type {number}
 */
goog.webgl.SHORT = 0x1402;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT = 0x1403;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT = 0x1404;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_INT = 0x1405;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT = 0x1406;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_COMPONENT = 0x1902;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALPHA = 0x1906;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGB = 0x1907;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGBA = 0x1908;


/**
 * @const
 * @type {number}
 */
goog.webgl.LUMINANCE = 0x1909;


/**
 * @const
 * @type {number}
 */
goog.webgl.LUMINANCE_ALPHA = 0x190A;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT_4_4_4_4 = 0x8033;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT_5_5_5_1 = 0x8034;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT_5_6_5 = 0x8363;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAGMENT_SHADER = 0x8B30;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_SHADER = 0x8B31;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VERTEX_ATTRIBS = 0x8869;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VARYING_VECTORS = 0x8DFC;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_TEXTURE_IMAGE_UNITS = 0x8872;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;


/**
 * @const
 * @type {number}
 */
goog.webgl.SHADER_TYPE = 0x8B4F;


/**
 * @const
 * @type {number}
 */
goog.webgl.DELETE_STATUS = 0x8B80;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINK_STATUS = 0x8B82;


/**
 * @const
 * @type {number}
 */
goog.webgl.VALIDATE_STATUS = 0x8B83;


/**
 * @const
 * @type {number}
 */
goog.webgl.ATTACHED_SHADERS = 0x8B85;


/**
 * @const
 * @type {number}
 */
goog.webgl.ACTIVE_UNIFORMS = 0x8B86;


/**
 * @const
 * @type {number}
 */
goog.webgl.ACTIVE_ATTRIBUTES = 0x8B89;


/**
 * @const
 * @type {number}
 */
goog.webgl.SHADING_LANGUAGE_VERSION = 0x8B8C;


/**
 * @const
 * @type {number}
 */
goog.webgl.CURRENT_PROGRAM = 0x8B8D;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEVER = 0x0200;


/**
 * @const
 * @type {number}
 */
goog.webgl.LESS = 0x0201;


/**
 * @const
 * @type {number}
 */
goog.webgl.EQUAL = 0x0202;


/**
 * @const
 * @type {number}
 */
goog.webgl.LEQUAL = 0x0203;


/**
 * @const
 * @type {number}
 */
goog.webgl.GREATER = 0x0204;


/**
 * @const
 * @type {number}
 */
goog.webgl.NOTEQUAL = 0x0205;


/**
 * @const
 * @type {number}
 */
goog.webgl.GEQUAL = 0x0206;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALWAYS = 0x0207;


/**
 * @const
 * @type {number}
 */
goog.webgl.KEEP = 0x1E00;


/**
 * @const
 * @type {number}
 */
goog.webgl.REPLACE = 0x1E01;


/**
 * @const
 * @type {number}
 */
goog.webgl.INCR = 0x1E02;


/**
 * @const
 * @type {number}
 */
goog.webgl.DECR = 0x1E03;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVERT = 0x150A;


/**
 * @const
 * @type {number}
 */
goog.webgl.INCR_WRAP = 0x8507;


/**
 * @const
 * @type {number}
 */
goog.webgl.DECR_WRAP = 0x8508;


/**
 * @const
 * @type {number}
 */
goog.webgl.VENDOR = 0x1F00;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERER = 0x1F01;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERSION = 0x1F02;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEAREST = 0x2600;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINEAR = 0x2601;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEAREST_MIPMAP_NEAREST = 0x2700;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINEAR_MIPMAP_NEAREST = 0x2701;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEAREST_MIPMAP_LINEAR = 0x2702;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINEAR_MIPMAP_LINEAR = 0x2703;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_MAG_FILTER = 0x2800;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_MIN_FILTER = 0x2801;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_WRAP_S = 0x2802;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_WRAP_T = 0x2803;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_2D = 0x0DE1;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE = 0x1702;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP = 0x8513;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_BINDING_CUBE_MAP = 0x8514;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE0 = 0x84C0;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE1 = 0x84C1;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE2 = 0x84C2;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE3 = 0x84C3;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE4 = 0x84C4;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE5 = 0x84C5;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE6 = 0x84C6;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE7 = 0x84C7;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE8 = 0x84C8;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE9 = 0x84C9;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE10 = 0x84CA;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE11 = 0x84CB;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE12 = 0x84CC;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE13 = 0x84CD;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE14 = 0x84CE;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE15 = 0x84CF;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE16 = 0x84D0;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE17 = 0x84D1;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE18 = 0x84D2;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE19 = 0x84D3;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE20 = 0x84D4;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE21 = 0x84D5;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE22 = 0x84D6;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE23 = 0x84D7;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE24 = 0x84D8;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE25 = 0x84D9;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE26 = 0x84DA;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE27 = 0x84DB;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE28 = 0x84DC;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE29 = 0x84DD;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE30 = 0x84DE;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE31 = 0x84DF;


/**
 * @const
 * @type {number}
 */
goog.webgl.ACTIVE_TEXTURE = 0x84E0;


/**
 * @const
 * @type {number}
 */
goog.webgl.REPEAT = 0x2901;


/**
 * @const
 * @type {number}
 */
goog.webgl.CLAMP_TO_EDGE = 0x812F;


/**
 * @const
 * @type {number}
 */
goog.webgl.MIRRORED_REPEAT = 0x8370;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_VEC2 = 0x8B50;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_VEC3 = 0x8B51;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_VEC4 = 0x8B52;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT_VEC2 = 0x8B53;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT_VEC3 = 0x8B54;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT_VEC4 = 0x8B55;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL = 0x8B56;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL_VEC2 = 0x8B57;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL_VEC3 = 0x8B58;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL_VEC4 = 0x8B59;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_MAT2 = 0x8B5A;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_MAT3 = 0x8B5B;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_MAT4 = 0x8B5C;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLER_2D = 0x8B5E;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLER_CUBE = 0x8B60;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;


/**
 * @const
 * @type {number}
 */
goog.webgl.COMPILE_STATUS = 0x8B81;


/**
 * @const
 * @type {number}
 */
goog.webgl.LOW_FLOAT = 0x8DF0;


/**
 * @const
 * @type {number}
 */
goog.webgl.MEDIUM_FLOAT = 0x8DF1;


/**
 * @const
 * @type {number}
 */
goog.webgl.HIGH_FLOAT = 0x8DF2;


/**
 * @const
 * @type {number}
 */
goog.webgl.LOW_INT = 0x8DF3;


/**
 * @const
 * @type {number}
 */
goog.webgl.MEDIUM_INT = 0x8DF4;


/**
 * @const
 * @type {number}
 */
goog.webgl.HIGH_INT = 0x8DF5;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER = 0x8D40;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER = 0x8D41;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGBA4 = 0x8056;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGB5_A1 = 0x8057;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGB565 = 0x8D62;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_COMPONENT16 = 0x81A5;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_INDEX = 0x1901;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_INDEX8 = 0x8D48;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_STENCIL = 0x84F9;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_WIDTH = 0x8D42;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_HEIGHT = 0x8D43;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_RED_SIZE = 0x8D50;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_GREEN_SIZE = 0x8D51;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_BLUE_SIZE = 0x8D52;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_ALPHA_SIZE = 0x8D53;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_DEPTH_SIZE = 0x8D54;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_STENCIL_SIZE = 0x8D55;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_ATTACHMENT0 = 0x8CE0;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_ATTACHMENT = 0x8D00;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_ATTACHMENT = 0x8D20;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_STENCIL_ATTACHMENT = 0x821A;


/**
 * @const
 * @type {number}
 */
goog.webgl.NONE = 0;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_COMPLETE = 0x8CD5;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_BINDING = 0x8CA6;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_BINDING = 0x8CA7;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_RENDERBUFFER_SIZE = 0x84E8;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_FRAMEBUFFER_OPERATION = 0x0506;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_FLIP_Y_WEBGL = 0x9240;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;


/**
 * @const
 * @type {number}
 */
goog.webgl.CONTEXT_LOST_WEBGL = 0x9242;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;


/**
 * @const
 * @type {number}
 */
goog.webgl.BROWSER_DEFAULT_WEBGL = 0x9244;


/**
 * From the OES_texture_half_float extension.
 * http://www.khronos.org/registry/webgl/extensions/OES_texture_half_float/
 * @const
 * @type {number}
 */
goog.webgl.HALF_FLOAT_OES = 0x8D61;


/**
 * From the OES_standard_derivatives extension.
 * http://www.khronos.org/registry/webgl/extensions/OES_standard_derivatives/
 * @const
 * @type {number}
 */
goog.webgl.FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;


/**
 * From the OES_vertex_array_object extension.
 * http://www.khronos.org/registry/webgl/extensions/OES_vertex_array_object/
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ARRAY_BINDING_OES = 0x85B5;


/**
 * From the WEBGL_debug_renderer_info extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_debug_renderer_info/
 * @const
 * @type {number}
 */
goog.webgl.UNMASKED_VENDOR_WEBGL = 0x9245;


/**
 * From the WEBGL_debug_renderer_info extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_debug_renderer_info/
 * @const
 * @type {number}
 */
goog.webgl.UNMASKED_RENDERER_WEBGL = 0x9246;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;


/**
 * From the EXT_texture_filter_anisotropic extension.
 * http://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;


/**
 * From the EXT_texture_filter_anisotropic extension.
 * http://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/
 * @const
 * @type {number}
 */
goog.webgl.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;
