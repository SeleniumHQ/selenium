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
 * @fileoverview Extended date/time patterns.
 *
 * File generated from CLDR ver. 35
 *
 * This file covers those locales that are not covered in
 * "datetimepatterns.js".
 *
 * @suppress {const,missingRequire} Suppress "missing require" warnings for
 *     names like goog.i18n.DateTimePatterns_af. They are included
 *     by requiring goog.i18n.DateTimePatterns.
 */

// clang-format off

/**
 * Only locales that can be enumerated in ICU are supported. For the rest
 * of the locales, it will fallback to 'en'.
 * The code is designed to work with Closure compiler using
 * ADVANCED_OPTIMIZATIONS. We will continue to add popular date/time
 * patterns over time. There is no intention to cover all possible
 * usages. If simple pattern works fine, it won't be covered here either.
 * For example, pattern 'MMM' will work well to get short month name for
 * almost all locales thus won't be included here.
 */


goog.provide('goog.i18n.DateTimePatternsExt');
goog.provide('goog.i18n.DateTimePatterns_af_NA');
goog.provide('goog.i18n.DateTimePatterns_af_ZA');
goog.provide('goog.i18n.DateTimePatterns_agq');
goog.provide('goog.i18n.DateTimePatterns_agq_CM');
goog.provide('goog.i18n.DateTimePatterns_ak');
goog.provide('goog.i18n.DateTimePatterns_ak_GH');
goog.provide('goog.i18n.DateTimePatterns_am_ET');
goog.provide('goog.i18n.DateTimePatterns_ar_001');
goog.provide('goog.i18n.DateTimePatterns_ar_AE');
goog.provide('goog.i18n.DateTimePatterns_ar_BH');
goog.provide('goog.i18n.DateTimePatterns_ar_DJ');
goog.provide('goog.i18n.DateTimePatterns_ar_EH');
goog.provide('goog.i18n.DateTimePatterns_ar_ER');
goog.provide('goog.i18n.DateTimePatterns_ar_IL');
goog.provide('goog.i18n.DateTimePatterns_ar_IQ');
goog.provide('goog.i18n.DateTimePatterns_ar_JO');
goog.provide('goog.i18n.DateTimePatterns_ar_KM');
goog.provide('goog.i18n.DateTimePatterns_ar_KW');
goog.provide('goog.i18n.DateTimePatterns_ar_LB');
goog.provide('goog.i18n.DateTimePatterns_ar_LY');
goog.provide('goog.i18n.DateTimePatterns_ar_MA');
goog.provide('goog.i18n.DateTimePatterns_ar_MR');
goog.provide('goog.i18n.DateTimePatterns_ar_OM');
goog.provide('goog.i18n.DateTimePatterns_ar_PS');
goog.provide('goog.i18n.DateTimePatterns_ar_QA');
goog.provide('goog.i18n.DateTimePatterns_ar_SA');
goog.provide('goog.i18n.DateTimePatterns_ar_SD');
goog.provide('goog.i18n.DateTimePatterns_ar_SO');
goog.provide('goog.i18n.DateTimePatterns_ar_SS');
goog.provide('goog.i18n.DateTimePatterns_ar_SY');
goog.provide('goog.i18n.DateTimePatterns_ar_TD');
goog.provide('goog.i18n.DateTimePatterns_ar_TN');
goog.provide('goog.i18n.DateTimePatterns_ar_XB');
goog.provide('goog.i18n.DateTimePatterns_ar_YE');
goog.provide('goog.i18n.DateTimePatterns_as');
goog.provide('goog.i18n.DateTimePatterns_as_IN');
goog.provide('goog.i18n.DateTimePatterns_asa');
goog.provide('goog.i18n.DateTimePatterns_asa_TZ');
goog.provide('goog.i18n.DateTimePatterns_ast');
goog.provide('goog.i18n.DateTimePatterns_ast_ES');
goog.provide('goog.i18n.DateTimePatterns_az_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_az_Cyrl_AZ');
goog.provide('goog.i18n.DateTimePatterns_az_Latn');
goog.provide('goog.i18n.DateTimePatterns_az_Latn_AZ');
goog.provide('goog.i18n.DateTimePatterns_bas');
goog.provide('goog.i18n.DateTimePatterns_bas_CM');
goog.provide('goog.i18n.DateTimePatterns_be_BY');
goog.provide('goog.i18n.DateTimePatterns_bem');
goog.provide('goog.i18n.DateTimePatterns_bem_ZM');
goog.provide('goog.i18n.DateTimePatterns_bez');
goog.provide('goog.i18n.DateTimePatterns_bez_TZ');
goog.provide('goog.i18n.DateTimePatterns_bg_BG');
goog.provide('goog.i18n.DateTimePatterns_bm');
goog.provide('goog.i18n.DateTimePatterns_bm_ML');
goog.provide('goog.i18n.DateTimePatterns_bn_BD');
goog.provide('goog.i18n.DateTimePatterns_bn_IN');
goog.provide('goog.i18n.DateTimePatterns_bo');
goog.provide('goog.i18n.DateTimePatterns_bo_CN');
goog.provide('goog.i18n.DateTimePatterns_bo_IN');
goog.provide('goog.i18n.DateTimePatterns_br_FR');
goog.provide('goog.i18n.DateTimePatterns_brx');
goog.provide('goog.i18n.DateTimePatterns_brx_IN');
goog.provide('goog.i18n.DateTimePatterns_bs_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_bs_Cyrl_BA');
goog.provide('goog.i18n.DateTimePatterns_bs_Latn');
goog.provide('goog.i18n.DateTimePatterns_bs_Latn_BA');
goog.provide('goog.i18n.DateTimePatterns_ca_AD');
goog.provide('goog.i18n.DateTimePatterns_ca_ES');
goog.provide('goog.i18n.DateTimePatterns_ca_FR');
goog.provide('goog.i18n.DateTimePatterns_ca_IT');
goog.provide('goog.i18n.DateTimePatterns_ccp');
goog.provide('goog.i18n.DateTimePatterns_ccp_BD');
goog.provide('goog.i18n.DateTimePatterns_ccp_IN');
goog.provide('goog.i18n.DateTimePatterns_ce');
goog.provide('goog.i18n.DateTimePatterns_ce_RU');
goog.provide('goog.i18n.DateTimePatterns_ceb');
goog.provide('goog.i18n.DateTimePatterns_ceb_PH');
goog.provide('goog.i18n.DateTimePatterns_cgg');
goog.provide('goog.i18n.DateTimePatterns_cgg_UG');
goog.provide('goog.i18n.DateTimePatterns_chr_US');
goog.provide('goog.i18n.DateTimePatterns_ckb');
goog.provide('goog.i18n.DateTimePatterns_ckb_IQ');
goog.provide('goog.i18n.DateTimePatterns_ckb_IR');
goog.provide('goog.i18n.DateTimePatterns_cs_CZ');
goog.provide('goog.i18n.DateTimePatterns_cy_GB');
goog.provide('goog.i18n.DateTimePatterns_da_DK');
goog.provide('goog.i18n.DateTimePatterns_da_GL');
goog.provide('goog.i18n.DateTimePatterns_dav');
goog.provide('goog.i18n.DateTimePatterns_dav_KE');
goog.provide('goog.i18n.DateTimePatterns_de_BE');
goog.provide('goog.i18n.DateTimePatterns_de_DE');
goog.provide('goog.i18n.DateTimePatterns_de_IT');
goog.provide('goog.i18n.DateTimePatterns_de_LI');
goog.provide('goog.i18n.DateTimePatterns_de_LU');
goog.provide('goog.i18n.DateTimePatterns_dje');
goog.provide('goog.i18n.DateTimePatterns_dje_NE');
goog.provide('goog.i18n.DateTimePatterns_dsb');
goog.provide('goog.i18n.DateTimePatterns_dsb_DE');
goog.provide('goog.i18n.DateTimePatterns_dua');
goog.provide('goog.i18n.DateTimePatterns_dua_CM');
goog.provide('goog.i18n.DateTimePatterns_dyo');
goog.provide('goog.i18n.DateTimePatterns_dyo_SN');
goog.provide('goog.i18n.DateTimePatterns_dz');
goog.provide('goog.i18n.DateTimePatterns_dz_BT');
goog.provide('goog.i18n.DateTimePatterns_ebu');
goog.provide('goog.i18n.DateTimePatterns_ebu_KE');
goog.provide('goog.i18n.DateTimePatterns_ee');
goog.provide('goog.i18n.DateTimePatterns_ee_GH');
goog.provide('goog.i18n.DateTimePatterns_ee_TG');
goog.provide('goog.i18n.DateTimePatterns_el_CY');
goog.provide('goog.i18n.DateTimePatterns_el_GR');
goog.provide('goog.i18n.DateTimePatterns_en_001');
goog.provide('goog.i18n.DateTimePatterns_en_150');
goog.provide('goog.i18n.DateTimePatterns_en_AE');
goog.provide('goog.i18n.DateTimePatterns_en_AG');
goog.provide('goog.i18n.DateTimePatterns_en_AI');
goog.provide('goog.i18n.DateTimePatterns_en_AS');
goog.provide('goog.i18n.DateTimePatterns_en_AT');
goog.provide('goog.i18n.DateTimePatterns_en_BB');
goog.provide('goog.i18n.DateTimePatterns_en_BE');
goog.provide('goog.i18n.DateTimePatterns_en_BI');
goog.provide('goog.i18n.DateTimePatterns_en_BM');
goog.provide('goog.i18n.DateTimePatterns_en_BS');
goog.provide('goog.i18n.DateTimePatterns_en_BW');
goog.provide('goog.i18n.DateTimePatterns_en_BZ');
goog.provide('goog.i18n.DateTimePatterns_en_CC');
goog.provide('goog.i18n.DateTimePatterns_en_CH');
goog.provide('goog.i18n.DateTimePatterns_en_CK');
goog.provide('goog.i18n.DateTimePatterns_en_CM');
goog.provide('goog.i18n.DateTimePatterns_en_CX');
goog.provide('goog.i18n.DateTimePatterns_en_CY');
goog.provide('goog.i18n.DateTimePatterns_en_DE');
goog.provide('goog.i18n.DateTimePatterns_en_DG');
goog.provide('goog.i18n.DateTimePatterns_en_DK');
goog.provide('goog.i18n.DateTimePatterns_en_DM');
goog.provide('goog.i18n.DateTimePatterns_en_ER');
goog.provide('goog.i18n.DateTimePatterns_en_FI');
goog.provide('goog.i18n.DateTimePatterns_en_FJ');
goog.provide('goog.i18n.DateTimePatterns_en_FK');
goog.provide('goog.i18n.DateTimePatterns_en_FM');
goog.provide('goog.i18n.DateTimePatterns_en_GD');
goog.provide('goog.i18n.DateTimePatterns_en_GG');
goog.provide('goog.i18n.DateTimePatterns_en_GH');
goog.provide('goog.i18n.DateTimePatterns_en_GI');
goog.provide('goog.i18n.DateTimePatterns_en_GM');
goog.provide('goog.i18n.DateTimePatterns_en_GU');
goog.provide('goog.i18n.DateTimePatterns_en_GY');
goog.provide('goog.i18n.DateTimePatterns_en_HK');
goog.provide('goog.i18n.DateTimePatterns_en_IL');
goog.provide('goog.i18n.DateTimePatterns_en_IM');
goog.provide('goog.i18n.DateTimePatterns_en_IO');
goog.provide('goog.i18n.DateTimePatterns_en_JE');
goog.provide('goog.i18n.DateTimePatterns_en_JM');
goog.provide('goog.i18n.DateTimePatterns_en_KE');
goog.provide('goog.i18n.DateTimePatterns_en_KI');
goog.provide('goog.i18n.DateTimePatterns_en_KN');
goog.provide('goog.i18n.DateTimePatterns_en_KY');
goog.provide('goog.i18n.DateTimePatterns_en_LC');
goog.provide('goog.i18n.DateTimePatterns_en_LR');
goog.provide('goog.i18n.DateTimePatterns_en_LS');
goog.provide('goog.i18n.DateTimePatterns_en_MG');
goog.provide('goog.i18n.DateTimePatterns_en_MH');
goog.provide('goog.i18n.DateTimePatterns_en_MO');
goog.provide('goog.i18n.DateTimePatterns_en_MP');
goog.provide('goog.i18n.DateTimePatterns_en_MS');
goog.provide('goog.i18n.DateTimePatterns_en_MT');
goog.provide('goog.i18n.DateTimePatterns_en_MU');
goog.provide('goog.i18n.DateTimePatterns_en_MW');
goog.provide('goog.i18n.DateTimePatterns_en_MY');
goog.provide('goog.i18n.DateTimePatterns_en_NA');
goog.provide('goog.i18n.DateTimePatterns_en_NF');
goog.provide('goog.i18n.DateTimePatterns_en_NG');
goog.provide('goog.i18n.DateTimePatterns_en_NL');
goog.provide('goog.i18n.DateTimePatterns_en_NR');
goog.provide('goog.i18n.DateTimePatterns_en_NU');
goog.provide('goog.i18n.DateTimePatterns_en_NZ');
goog.provide('goog.i18n.DateTimePatterns_en_PG');
goog.provide('goog.i18n.DateTimePatterns_en_PH');
goog.provide('goog.i18n.DateTimePatterns_en_PK');
goog.provide('goog.i18n.DateTimePatterns_en_PN');
goog.provide('goog.i18n.DateTimePatterns_en_PR');
goog.provide('goog.i18n.DateTimePatterns_en_PW');
goog.provide('goog.i18n.DateTimePatterns_en_RW');
goog.provide('goog.i18n.DateTimePatterns_en_SB');
goog.provide('goog.i18n.DateTimePatterns_en_SC');
goog.provide('goog.i18n.DateTimePatterns_en_SD');
goog.provide('goog.i18n.DateTimePatterns_en_SE');
goog.provide('goog.i18n.DateTimePatterns_en_SH');
goog.provide('goog.i18n.DateTimePatterns_en_SI');
goog.provide('goog.i18n.DateTimePatterns_en_SL');
goog.provide('goog.i18n.DateTimePatterns_en_SS');
goog.provide('goog.i18n.DateTimePatterns_en_SX');
goog.provide('goog.i18n.DateTimePatterns_en_SZ');
goog.provide('goog.i18n.DateTimePatterns_en_TC');
goog.provide('goog.i18n.DateTimePatterns_en_TK');
goog.provide('goog.i18n.DateTimePatterns_en_TO');
goog.provide('goog.i18n.DateTimePatterns_en_TT');
goog.provide('goog.i18n.DateTimePatterns_en_TV');
goog.provide('goog.i18n.DateTimePatterns_en_TZ');
goog.provide('goog.i18n.DateTimePatterns_en_UG');
goog.provide('goog.i18n.DateTimePatterns_en_UM');
goog.provide('goog.i18n.DateTimePatterns_en_US_POSIX');
goog.provide('goog.i18n.DateTimePatterns_en_VC');
goog.provide('goog.i18n.DateTimePatterns_en_VG');
goog.provide('goog.i18n.DateTimePatterns_en_VI');
goog.provide('goog.i18n.DateTimePatterns_en_VU');
goog.provide('goog.i18n.DateTimePatterns_en_WS');
goog.provide('goog.i18n.DateTimePatterns_en_XA');
goog.provide('goog.i18n.DateTimePatterns_en_ZM');
goog.provide('goog.i18n.DateTimePatterns_en_ZW');
goog.provide('goog.i18n.DateTimePatterns_eo');
goog.provide('goog.i18n.DateTimePatterns_eo_001');
goog.provide('goog.i18n.DateTimePatterns_es_AR');
goog.provide('goog.i18n.DateTimePatterns_es_BO');
goog.provide('goog.i18n.DateTimePatterns_es_BR');
goog.provide('goog.i18n.DateTimePatterns_es_BZ');
goog.provide('goog.i18n.DateTimePatterns_es_CL');
goog.provide('goog.i18n.DateTimePatterns_es_CO');
goog.provide('goog.i18n.DateTimePatterns_es_CR');
goog.provide('goog.i18n.DateTimePatterns_es_CU');
goog.provide('goog.i18n.DateTimePatterns_es_DO');
goog.provide('goog.i18n.DateTimePatterns_es_EA');
goog.provide('goog.i18n.DateTimePatterns_es_EC');
goog.provide('goog.i18n.DateTimePatterns_es_GQ');
goog.provide('goog.i18n.DateTimePatterns_es_GT');
goog.provide('goog.i18n.DateTimePatterns_es_HN');
goog.provide('goog.i18n.DateTimePatterns_es_IC');
goog.provide('goog.i18n.DateTimePatterns_es_NI');
goog.provide('goog.i18n.DateTimePatterns_es_PA');
goog.provide('goog.i18n.DateTimePatterns_es_PE');
goog.provide('goog.i18n.DateTimePatterns_es_PH');
goog.provide('goog.i18n.DateTimePatterns_es_PR');
goog.provide('goog.i18n.DateTimePatterns_es_PY');
goog.provide('goog.i18n.DateTimePatterns_es_SV');
goog.provide('goog.i18n.DateTimePatterns_es_UY');
goog.provide('goog.i18n.DateTimePatterns_es_VE');
goog.provide('goog.i18n.DateTimePatterns_et_EE');
goog.provide('goog.i18n.DateTimePatterns_eu_ES');
goog.provide('goog.i18n.DateTimePatterns_ewo');
goog.provide('goog.i18n.DateTimePatterns_ewo_CM');
goog.provide('goog.i18n.DateTimePatterns_fa_AF');
goog.provide('goog.i18n.DateTimePatterns_fa_IR');
goog.provide('goog.i18n.DateTimePatterns_ff');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_BF');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_CM');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_GH');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_GM');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_GN');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_GW');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_LR');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_MR');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_NE');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_NG');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_SL');
goog.provide('goog.i18n.DateTimePatterns_ff_Latn_SN');
goog.provide('goog.i18n.DateTimePatterns_fi_FI');
goog.provide('goog.i18n.DateTimePatterns_fil_PH');
goog.provide('goog.i18n.DateTimePatterns_fo');
goog.provide('goog.i18n.DateTimePatterns_fo_DK');
goog.provide('goog.i18n.DateTimePatterns_fo_FO');
goog.provide('goog.i18n.DateTimePatterns_fr_BE');
goog.provide('goog.i18n.DateTimePatterns_fr_BF');
goog.provide('goog.i18n.DateTimePatterns_fr_BI');
goog.provide('goog.i18n.DateTimePatterns_fr_BJ');
goog.provide('goog.i18n.DateTimePatterns_fr_BL');
goog.provide('goog.i18n.DateTimePatterns_fr_CD');
goog.provide('goog.i18n.DateTimePatterns_fr_CF');
goog.provide('goog.i18n.DateTimePatterns_fr_CG');
goog.provide('goog.i18n.DateTimePatterns_fr_CH');
goog.provide('goog.i18n.DateTimePatterns_fr_CI');
goog.provide('goog.i18n.DateTimePatterns_fr_CM');
goog.provide('goog.i18n.DateTimePatterns_fr_DJ');
goog.provide('goog.i18n.DateTimePatterns_fr_DZ');
goog.provide('goog.i18n.DateTimePatterns_fr_FR');
goog.provide('goog.i18n.DateTimePatterns_fr_GA');
goog.provide('goog.i18n.DateTimePatterns_fr_GF');
goog.provide('goog.i18n.DateTimePatterns_fr_GN');
goog.provide('goog.i18n.DateTimePatterns_fr_GP');
goog.provide('goog.i18n.DateTimePatterns_fr_GQ');
goog.provide('goog.i18n.DateTimePatterns_fr_HT');
goog.provide('goog.i18n.DateTimePatterns_fr_KM');
goog.provide('goog.i18n.DateTimePatterns_fr_LU');
goog.provide('goog.i18n.DateTimePatterns_fr_MA');
goog.provide('goog.i18n.DateTimePatterns_fr_MC');
goog.provide('goog.i18n.DateTimePatterns_fr_MF');
goog.provide('goog.i18n.DateTimePatterns_fr_MG');
goog.provide('goog.i18n.DateTimePatterns_fr_ML');
goog.provide('goog.i18n.DateTimePatterns_fr_MQ');
goog.provide('goog.i18n.DateTimePatterns_fr_MR');
goog.provide('goog.i18n.DateTimePatterns_fr_MU');
goog.provide('goog.i18n.DateTimePatterns_fr_NC');
goog.provide('goog.i18n.DateTimePatterns_fr_NE');
goog.provide('goog.i18n.DateTimePatterns_fr_PF');
goog.provide('goog.i18n.DateTimePatterns_fr_PM');
goog.provide('goog.i18n.DateTimePatterns_fr_RE');
goog.provide('goog.i18n.DateTimePatterns_fr_RW');
goog.provide('goog.i18n.DateTimePatterns_fr_SC');
goog.provide('goog.i18n.DateTimePatterns_fr_SN');
goog.provide('goog.i18n.DateTimePatterns_fr_SY');
goog.provide('goog.i18n.DateTimePatterns_fr_TD');
goog.provide('goog.i18n.DateTimePatterns_fr_TG');
goog.provide('goog.i18n.DateTimePatterns_fr_TN');
goog.provide('goog.i18n.DateTimePatterns_fr_VU');
goog.provide('goog.i18n.DateTimePatterns_fr_WF');
goog.provide('goog.i18n.DateTimePatterns_fr_YT');
goog.provide('goog.i18n.DateTimePatterns_fur');
goog.provide('goog.i18n.DateTimePatterns_fur_IT');
goog.provide('goog.i18n.DateTimePatterns_fy');
goog.provide('goog.i18n.DateTimePatterns_fy_NL');
goog.provide('goog.i18n.DateTimePatterns_ga_IE');
goog.provide('goog.i18n.DateTimePatterns_gd');
goog.provide('goog.i18n.DateTimePatterns_gd_GB');
goog.provide('goog.i18n.DateTimePatterns_gl_ES');
goog.provide('goog.i18n.DateTimePatterns_gsw_CH');
goog.provide('goog.i18n.DateTimePatterns_gsw_FR');
goog.provide('goog.i18n.DateTimePatterns_gsw_LI');
goog.provide('goog.i18n.DateTimePatterns_gu_IN');
goog.provide('goog.i18n.DateTimePatterns_guz');
goog.provide('goog.i18n.DateTimePatterns_guz_KE');
goog.provide('goog.i18n.DateTimePatterns_gv');
goog.provide('goog.i18n.DateTimePatterns_gv_IM');
goog.provide('goog.i18n.DateTimePatterns_ha');
goog.provide('goog.i18n.DateTimePatterns_ha_GH');
goog.provide('goog.i18n.DateTimePatterns_ha_NE');
goog.provide('goog.i18n.DateTimePatterns_ha_NG');
goog.provide('goog.i18n.DateTimePatterns_haw_US');
goog.provide('goog.i18n.DateTimePatterns_he_IL');
goog.provide('goog.i18n.DateTimePatterns_hi_IN');
goog.provide('goog.i18n.DateTimePatterns_hr_BA');
goog.provide('goog.i18n.DateTimePatterns_hr_HR');
goog.provide('goog.i18n.DateTimePatterns_hsb');
goog.provide('goog.i18n.DateTimePatterns_hsb_DE');
goog.provide('goog.i18n.DateTimePatterns_hu_HU');
goog.provide('goog.i18n.DateTimePatterns_hy_AM');
goog.provide('goog.i18n.DateTimePatterns_ia');
goog.provide('goog.i18n.DateTimePatterns_ia_001');
goog.provide('goog.i18n.DateTimePatterns_id_ID');
goog.provide('goog.i18n.DateTimePatterns_ig');
goog.provide('goog.i18n.DateTimePatterns_ig_NG');
goog.provide('goog.i18n.DateTimePatterns_ii');
goog.provide('goog.i18n.DateTimePatterns_ii_CN');
goog.provide('goog.i18n.DateTimePatterns_is_IS');
goog.provide('goog.i18n.DateTimePatterns_it_CH');
goog.provide('goog.i18n.DateTimePatterns_it_IT');
goog.provide('goog.i18n.DateTimePatterns_it_SM');
goog.provide('goog.i18n.DateTimePatterns_it_VA');
goog.provide('goog.i18n.DateTimePatterns_ja_JP');
goog.provide('goog.i18n.DateTimePatterns_jgo');
goog.provide('goog.i18n.DateTimePatterns_jgo_CM');
goog.provide('goog.i18n.DateTimePatterns_jmc');
goog.provide('goog.i18n.DateTimePatterns_jmc_TZ');
goog.provide('goog.i18n.DateTimePatterns_jv');
goog.provide('goog.i18n.DateTimePatterns_jv_ID');
goog.provide('goog.i18n.DateTimePatterns_ka_GE');
goog.provide('goog.i18n.DateTimePatterns_kab');
goog.provide('goog.i18n.DateTimePatterns_kab_DZ');
goog.provide('goog.i18n.DateTimePatterns_kam');
goog.provide('goog.i18n.DateTimePatterns_kam_KE');
goog.provide('goog.i18n.DateTimePatterns_kde');
goog.provide('goog.i18n.DateTimePatterns_kde_TZ');
goog.provide('goog.i18n.DateTimePatterns_kea');
goog.provide('goog.i18n.DateTimePatterns_kea_CV');
goog.provide('goog.i18n.DateTimePatterns_khq');
goog.provide('goog.i18n.DateTimePatterns_khq_ML');
goog.provide('goog.i18n.DateTimePatterns_ki');
goog.provide('goog.i18n.DateTimePatterns_ki_KE');
goog.provide('goog.i18n.DateTimePatterns_kk_KZ');
goog.provide('goog.i18n.DateTimePatterns_kkj');
goog.provide('goog.i18n.DateTimePatterns_kkj_CM');
goog.provide('goog.i18n.DateTimePatterns_kl');
goog.provide('goog.i18n.DateTimePatterns_kl_GL');
goog.provide('goog.i18n.DateTimePatterns_kln');
goog.provide('goog.i18n.DateTimePatterns_kln_KE');
goog.provide('goog.i18n.DateTimePatterns_km_KH');
goog.provide('goog.i18n.DateTimePatterns_kn_IN');
goog.provide('goog.i18n.DateTimePatterns_ko_KP');
goog.provide('goog.i18n.DateTimePatterns_ko_KR');
goog.provide('goog.i18n.DateTimePatterns_kok');
goog.provide('goog.i18n.DateTimePatterns_kok_IN');
goog.provide('goog.i18n.DateTimePatterns_ks');
goog.provide('goog.i18n.DateTimePatterns_ks_IN');
goog.provide('goog.i18n.DateTimePatterns_ksb');
goog.provide('goog.i18n.DateTimePatterns_ksb_TZ');
goog.provide('goog.i18n.DateTimePatterns_ksf');
goog.provide('goog.i18n.DateTimePatterns_ksf_CM');
goog.provide('goog.i18n.DateTimePatterns_ksh');
goog.provide('goog.i18n.DateTimePatterns_ksh_DE');
goog.provide('goog.i18n.DateTimePatterns_ku');
goog.provide('goog.i18n.DateTimePatterns_ku_TR');
goog.provide('goog.i18n.DateTimePatterns_kw');
goog.provide('goog.i18n.DateTimePatterns_kw_GB');
goog.provide('goog.i18n.DateTimePatterns_ky_KG');
goog.provide('goog.i18n.DateTimePatterns_lag');
goog.provide('goog.i18n.DateTimePatterns_lag_TZ');
goog.provide('goog.i18n.DateTimePatterns_lb');
goog.provide('goog.i18n.DateTimePatterns_lb_LU');
goog.provide('goog.i18n.DateTimePatterns_lg');
goog.provide('goog.i18n.DateTimePatterns_lg_UG');
goog.provide('goog.i18n.DateTimePatterns_lkt');
goog.provide('goog.i18n.DateTimePatterns_lkt_US');
goog.provide('goog.i18n.DateTimePatterns_ln_AO');
goog.provide('goog.i18n.DateTimePatterns_ln_CD');
goog.provide('goog.i18n.DateTimePatterns_ln_CF');
goog.provide('goog.i18n.DateTimePatterns_ln_CG');
goog.provide('goog.i18n.DateTimePatterns_lo_LA');
goog.provide('goog.i18n.DateTimePatterns_lrc');
goog.provide('goog.i18n.DateTimePatterns_lrc_IQ');
goog.provide('goog.i18n.DateTimePatterns_lrc_IR');
goog.provide('goog.i18n.DateTimePatterns_lt_LT');
goog.provide('goog.i18n.DateTimePatterns_lu');
goog.provide('goog.i18n.DateTimePatterns_lu_CD');
goog.provide('goog.i18n.DateTimePatterns_luo');
goog.provide('goog.i18n.DateTimePatterns_luo_KE');
goog.provide('goog.i18n.DateTimePatterns_luy');
goog.provide('goog.i18n.DateTimePatterns_luy_KE');
goog.provide('goog.i18n.DateTimePatterns_lv_LV');
goog.provide('goog.i18n.DateTimePatterns_mas');
goog.provide('goog.i18n.DateTimePatterns_mas_KE');
goog.provide('goog.i18n.DateTimePatterns_mas_TZ');
goog.provide('goog.i18n.DateTimePatterns_mer');
goog.provide('goog.i18n.DateTimePatterns_mer_KE');
goog.provide('goog.i18n.DateTimePatterns_mfe');
goog.provide('goog.i18n.DateTimePatterns_mfe_MU');
goog.provide('goog.i18n.DateTimePatterns_mg');
goog.provide('goog.i18n.DateTimePatterns_mg_MG');
goog.provide('goog.i18n.DateTimePatterns_mgh');
goog.provide('goog.i18n.DateTimePatterns_mgh_MZ');
goog.provide('goog.i18n.DateTimePatterns_mgo');
goog.provide('goog.i18n.DateTimePatterns_mgo_CM');
goog.provide('goog.i18n.DateTimePatterns_mi');
goog.provide('goog.i18n.DateTimePatterns_mi_NZ');
goog.provide('goog.i18n.DateTimePatterns_mk_MK');
goog.provide('goog.i18n.DateTimePatterns_ml_IN');
goog.provide('goog.i18n.DateTimePatterns_mn_MN');
goog.provide('goog.i18n.DateTimePatterns_mr_IN');
goog.provide('goog.i18n.DateTimePatterns_ms_BN');
goog.provide('goog.i18n.DateTimePatterns_ms_MY');
goog.provide('goog.i18n.DateTimePatterns_ms_SG');
goog.provide('goog.i18n.DateTimePatterns_mt_MT');
goog.provide('goog.i18n.DateTimePatterns_mua');
goog.provide('goog.i18n.DateTimePatterns_mua_CM');
goog.provide('goog.i18n.DateTimePatterns_my_MM');
goog.provide('goog.i18n.DateTimePatterns_mzn');
goog.provide('goog.i18n.DateTimePatterns_mzn_IR');
goog.provide('goog.i18n.DateTimePatterns_naq');
goog.provide('goog.i18n.DateTimePatterns_naq_NA');
goog.provide('goog.i18n.DateTimePatterns_nb_NO');
goog.provide('goog.i18n.DateTimePatterns_nb_SJ');
goog.provide('goog.i18n.DateTimePatterns_nd');
goog.provide('goog.i18n.DateTimePatterns_nd_ZW');
goog.provide('goog.i18n.DateTimePatterns_nds');
goog.provide('goog.i18n.DateTimePatterns_nds_DE');
goog.provide('goog.i18n.DateTimePatterns_nds_NL');
goog.provide('goog.i18n.DateTimePatterns_ne_IN');
goog.provide('goog.i18n.DateTimePatterns_ne_NP');
goog.provide('goog.i18n.DateTimePatterns_nl_AW');
goog.provide('goog.i18n.DateTimePatterns_nl_BE');
goog.provide('goog.i18n.DateTimePatterns_nl_BQ');
goog.provide('goog.i18n.DateTimePatterns_nl_CW');
goog.provide('goog.i18n.DateTimePatterns_nl_NL');
goog.provide('goog.i18n.DateTimePatterns_nl_SR');
goog.provide('goog.i18n.DateTimePatterns_nl_SX');
goog.provide('goog.i18n.DateTimePatterns_nmg');
goog.provide('goog.i18n.DateTimePatterns_nmg_CM');
goog.provide('goog.i18n.DateTimePatterns_nn');
goog.provide('goog.i18n.DateTimePatterns_nn_NO');
goog.provide('goog.i18n.DateTimePatterns_nnh');
goog.provide('goog.i18n.DateTimePatterns_nnh_CM');
goog.provide('goog.i18n.DateTimePatterns_nus');
goog.provide('goog.i18n.DateTimePatterns_nus_SS');
goog.provide('goog.i18n.DateTimePatterns_nyn');
goog.provide('goog.i18n.DateTimePatterns_nyn_UG');
goog.provide('goog.i18n.DateTimePatterns_om');
goog.provide('goog.i18n.DateTimePatterns_om_ET');
goog.provide('goog.i18n.DateTimePatterns_om_KE');
goog.provide('goog.i18n.DateTimePatterns_or_IN');
goog.provide('goog.i18n.DateTimePatterns_os');
goog.provide('goog.i18n.DateTimePatterns_os_GE');
goog.provide('goog.i18n.DateTimePatterns_os_RU');
goog.provide('goog.i18n.DateTimePatterns_pa_Arab');
goog.provide('goog.i18n.DateTimePatterns_pa_Arab_PK');
goog.provide('goog.i18n.DateTimePatterns_pa_Guru');
goog.provide('goog.i18n.DateTimePatterns_pa_Guru_IN');
goog.provide('goog.i18n.DateTimePatterns_pl_PL');
goog.provide('goog.i18n.DateTimePatterns_ps');
goog.provide('goog.i18n.DateTimePatterns_ps_AF');
goog.provide('goog.i18n.DateTimePatterns_ps_PK');
goog.provide('goog.i18n.DateTimePatterns_pt_AO');
goog.provide('goog.i18n.DateTimePatterns_pt_CH');
goog.provide('goog.i18n.DateTimePatterns_pt_CV');
goog.provide('goog.i18n.DateTimePatterns_pt_GQ');
goog.provide('goog.i18n.DateTimePatterns_pt_GW');
goog.provide('goog.i18n.DateTimePatterns_pt_LU');
goog.provide('goog.i18n.DateTimePatterns_pt_MO');
goog.provide('goog.i18n.DateTimePatterns_pt_MZ');
goog.provide('goog.i18n.DateTimePatterns_pt_ST');
goog.provide('goog.i18n.DateTimePatterns_pt_TL');
goog.provide('goog.i18n.DateTimePatterns_qu');
goog.provide('goog.i18n.DateTimePatterns_qu_BO');
goog.provide('goog.i18n.DateTimePatterns_qu_EC');
goog.provide('goog.i18n.DateTimePatterns_qu_PE');
goog.provide('goog.i18n.DateTimePatterns_rm');
goog.provide('goog.i18n.DateTimePatterns_rm_CH');
goog.provide('goog.i18n.DateTimePatterns_rn');
goog.provide('goog.i18n.DateTimePatterns_rn_BI');
goog.provide('goog.i18n.DateTimePatterns_ro_MD');
goog.provide('goog.i18n.DateTimePatterns_ro_RO');
goog.provide('goog.i18n.DateTimePatterns_rof');
goog.provide('goog.i18n.DateTimePatterns_rof_TZ');
goog.provide('goog.i18n.DateTimePatterns_ru_BY');
goog.provide('goog.i18n.DateTimePatterns_ru_KG');
goog.provide('goog.i18n.DateTimePatterns_ru_KZ');
goog.provide('goog.i18n.DateTimePatterns_ru_MD');
goog.provide('goog.i18n.DateTimePatterns_ru_RU');
goog.provide('goog.i18n.DateTimePatterns_ru_UA');
goog.provide('goog.i18n.DateTimePatterns_rw');
goog.provide('goog.i18n.DateTimePatterns_rw_RW');
goog.provide('goog.i18n.DateTimePatterns_rwk');
goog.provide('goog.i18n.DateTimePatterns_rwk_TZ');
goog.provide('goog.i18n.DateTimePatterns_sah');
goog.provide('goog.i18n.DateTimePatterns_sah_RU');
goog.provide('goog.i18n.DateTimePatterns_saq');
goog.provide('goog.i18n.DateTimePatterns_saq_KE');
goog.provide('goog.i18n.DateTimePatterns_sbp');
goog.provide('goog.i18n.DateTimePatterns_sbp_TZ');
goog.provide('goog.i18n.DateTimePatterns_sd');
goog.provide('goog.i18n.DateTimePatterns_sd_PK');
goog.provide('goog.i18n.DateTimePatterns_se');
goog.provide('goog.i18n.DateTimePatterns_se_FI');
goog.provide('goog.i18n.DateTimePatterns_se_NO');
goog.provide('goog.i18n.DateTimePatterns_se_SE');
goog.provide('goog.i18n.DateTimePatterns_seh');
goog.provide('goog.i18n.DateTimePatterns_seh_MZ');
goog.provide('goog.i18n.DateTimePatterns_ses');
goog.provide('goog.i18n.DateTimePatterns_ses_ML');
goog.provide('goog.i18n.DateTimePatterns_sg');
goog.provide('goog.i18n.DateTimePatterns_sg_CF');
goog.provide('goog.i18n.DateTimePatterns_shi');
goog.provide('goog.i18n.DateTimePatterns_shi_Latn');
goog.provide('goog.i18n.DateTimePatterns_shi_Latn_MA');
goog.provide('goog.i18n.DateTimePatterns_shi_Tfng');
goog.provide('goog.i18n.DateTimePatterns_shi_Tfng_MA');
goog.provide('goog.i18n.DateTimePatterns_si_LK');
goog.provide('goog.i18n.DateTimePatterns_sk_SK');
goog.provide('goog.i18n.DateTimePatterns_sl_SI');
goog.provide('goog.i18n.DateTimePatterns_smn');
goog.provide('goog.i18n.DateTimePatterns_smn_FI');
goog.provide('goog.i18n.DateTimePatterns_sn');
goog.provide('goog.i18n.DateTimePatterns_sn_ZW');
goog.provide('goog.i18n.DateTimePatterns_so');
goog.provide('goog.i18n.DateTimePatterns_so_DJ');
goog.provide('goog.i18n.DateTimePatterns_so_ET');
goog.provide('goog.i18n.DateTimePatterns_so_KE');
goog.provide('goog.i18n.DateTimePatterns_so_SO');
goog.provide('goog.i18n.DateTimePatterns_sq_AL');
goog.provide('goog.i18n.DateTimePatterns_sq_MK');
goog.provide('goog.i18n.DateTimePatterns_sq_XK');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl_BA');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl_ME');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl_RS');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl_XK');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn_BA');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn_ME');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn_RS');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn_XK');
goog.provide('goog.i18n.DateTimePatterns_sv_AX');
goog.provide('goog.i18n.DateTimePatterns_sv_FI');
goog.provide('goog.i18n.DateTimePatterns_sv_SE');
goog.provide('goog.i18n.DateTimePatterns_sw_CD');
goog.provide('goog.i18n.DateTimePatterns_sw_KE');
goog.provide('goog.i18n.DateTimePatterns_sw_TZ');
goog.provide('goog.i18n.DateTimePatterns_sw_UG');
goog.provide('goog.i18n.DateTimePatterns_ta_IN');
goog.provide('goog.i18n.DateTimePatterns_ta_LK');
goog.provide('goog.i18n.DateTimePatterns_ta_MY');
goog.provide('goog.i18n.DateTimePatterns_ta_SG');
goog.provide('goog.i18n.DateTimePatterns_te_IN');
goog.provide('goog.i18n.DateTimePatterns_teo');
goog.provide('goog.i18n.DateTimePatterns_teo_KE');
goog.provide('goog.i18n.DateTimePatterns_teo_UG');
goog.provide('goog.i18n.DateTimePatterns_tg');
goog.provide('goog.i18n.DateTimePatterns_tg_TJ');
goog.provide('goog.i18n.DateTimePatterns_th_TH');
goog.provide('goog.i18n.DateTimePatterns_ti');
goog.provide('goog.i18n.DateTimePatterns_ti_ER');
goog.provide('goog.i18n.DateTimePatterns_ti_ET');
goog.provide('goog.i18n.DateTimePatterns_tk');
goog.provide('goog.i18n.DateTimePatterns_tk_TM');
goog.provide('goog.i18n.DateTimePatterns_to');
goog.provide('goog.i18n.DateTimePatterns_to_TO');
goog.provide('goog.i18n.DateTimePatterns_tr_CY');
goog.provide('goog.i18n.DateTimePatterns_tr_TR');
goog.provide('goog.i18n.DateTimePatterns_tt');
goog.provide('goog.i18n.DateTimePatterns_tt_RU');
goog.provide('goog.i18n.DateTimePatterns_twq');
goog.provide('goog.i18n.DateTimePatterns_twq_NE');
goog.provide('goog.i18n.DateTimePatterns_tzm');
goog.provide('goog.i18n.DateTimePatterns_tzm_MA');
goog.provide('goog.i18n.DateTimePatterns_ug');
goog.provide('goog.i18n.DateTimePatterns_ug_CN');
goog.provide('goog.i18n.DateTimePatterns_uk_UA');
goog.provide('goog.i18n.DateTimePatterns_ur_IN');
goog.provide('goog.i18n.DateTimePatterns_ur_PK');
goog.provide('goog.i18n.DateTimePatterns_uz_Arab');
goog.provide('goog.i18n.DateTimePatterns_uz_Arab_AF');
goog.provide('goog.i18n.DateTimePatterns_uz_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_uz_Cyrl_UZ');
goog.provide('goog.i18n.DateTimePatterns_uz_Latn');
goog.provide('goog.i18n.DateTimePatterns_uz_Latn_UZ');
goog.provide('goog.i18n.DateTimePatterns_vai');
goog.provide('goog.i18n.DateTimePatterns_vai_Latn');
goog.provide('goog.i18n.DateTimePatterns_vai_Latn_LR');
goog.provide('goog.i18n.DateTimePatterns_vai_Vaii');
goog.provide('goog.i18n.DateTimePatterns_vai_Vaii_LR');
goog.provide('goog.i18n.DateTimePatterns_vi_VN');
goog.provide('goog.i18n.DateTimePatterns_vun');
goog.provide('goog.i18n.DateTimePatterns_vun_TZ');
goog.provide('goog.i18n.DateTimePatterns_wae');
goog.provide('goog.i18n.DateTimePatterns_wae_CH');
goog.provide('goog.i18n.DateTimePatterns_wo');
goog.provide('goog.i18n.DateTimePatterns_wo_SN');
goog.provide('goog.i18n.DateTimePatterns_xh');
goog.provide('goog.i18n.DateTimePatterns_xh_ZA');
goog.provide('goog.i18n.DateTimePatterns_xog');
goog.provide('goog.i18n.DateTimePatterns_xog_UG');
goog.provide('goog.i18n.DateTimePatterns_yav');
goog.provide('goog.i18n.DateTimePatterns_yav_CM');
goog.provide('goog.i18n.DateTimePatterns_yi');
goog.provide('goog.i18n.DateTimePatterns_yi_001');
goog.provide('goog.i18n.DateTimePatterns_yo');
goog.provide('goog.i18n.DateTimePatterns_yo_BJ');
goog.provide('goog.i18n.DateTimePatterns_yo_NG');
goog.provide('goog.i18n.DateTimePatterns_yue');
goog.provide('goog.i18n.DateTimePatterns_yue_Hans');
goog.provide('goog.i18n.DateTimePatterns_yue_Hans_CN');
goog.provide('goog.i18n.DateTimePatterns_yue_Hant');
goog.provide('goog.i18n.DateTimePatterns_yue_Hant_HK');
goog.provide('goog.i18n.DateTimePatterns_zgh');
goog.provide('goog.i18n.DateTimePatterns_zgh_MA');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_CN');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_HK');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_MO');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_SG');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant_HK');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant_MO');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant_TW');
goog.provide('goog.i18n.DateTimePatterns_zu_ZA');
goog.require('goog.i18n.DateTimePatterns');


/**
 * Extended set of localized date/time patterns for locale af_NA.
 */
goog.i18n.DateTimePatterns_af_NA = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale af_ZA.
 */
goog.i18n.DateTimePatterns_af_ZA = goog.i18n.DateTimePatterns_af;


/**
 * Extended set of localized date/time patterns for locale agq.
 */
goog.i18n.DateTimePatterns_agq = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale agq_CM.
 */
goog.i18n.DateTimePatterns_agq_CM = goog.i18n.DateTimePatterns_agq;


/**
 * Extended set of localized date/time patterns for locale ak.
 */
goog.i18n.DateTimePatterns_ak = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ak_GH.
 */
goog.i18n.DateTimePatterns_ak_GH = goog.i18n.DateTimePatterns_ak;


/**
 * Extended set of localized date/time patterns for locale am_ET.
 */
goog.i18n.DateTimePatterns_am_ET = goog.i18n.DateTimePatterns_am;


/**
 * Extended set of localized date/time patterns for locale ar_001.
 */
goog.i18n.DateTimePatterns_ar_001 = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_AE.
 */
goog.i18n.DateTimePatterns_ar_AE = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_BH.
 */
goog.i18n.DateTimePatterns_ar_BH = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_DJ.
 */
goog.i18n.DateTimePatterns_ar_DJ = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_EH.
 */
goog.i18n.DateTimePatterns_ar_EH = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_ER.
 */
goog.i18n.DateTimePatterns_ar_ER = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_IL.
 */
goog.i18n.DateTimePatterns_ar_IL = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM‏/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/‏M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE، d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ar_IQ.
 */
goog.i18n.DateTimePatterns_ar_IQ = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_JO.
 */
goog.i18n.DateTimePatterns_ar_JO = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_KM.
 */
goog.i18n.DateTimePatterns_ar_KM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM‏/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/‏M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE، d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ar_KW.
 */
goog.i18n.DateTimePatterns_ar_KW = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_LB.
 */
goog.i18n.DateTimePatterns_ar_LB = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_LY.
 */
goog.i18n.DateTimePatterns_ar_LY = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_MA.
 */
goog.i18n.DateTimePatterns_ar_MA = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM‏/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/‏M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE، d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ar_MR.
 */
goog.i18n.DateTimePatterns_ar_MR = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_OM.
 */
goog.i18n.DateTimePatterns_ar_OM = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_PS.
 */
goog.i18n.DateTimePatterns_ar_PS = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_QA.
 */
goog.i18n.DateTimePatterns_ar_QA = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_SA.
 */
goog.i18n.DateTimePatterns_ar_SA = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_SD.
 */
goog.i18n.DateTimePatterns_ar_SD = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_SO.
 */
goog.i18n.DateTimePatterns_ar_SO = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_SS.
 */
goog.i18n.DateTimePatterns_ar_SS = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_SY.
 */
goog.i18n.DateTimePatterns_ar_SY = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_TD.
 */
goog.i18n.DateTimePatterns_ar_TD = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_TN.
 */
goog.i18n.DateTimePatterns_ar_TN = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_XB.
 */
goog.i18n.DateTimePatterns_ar_XB = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale ar_YE.
 */
goog.i18n.DateTimePatterns_ar_YE = goog.i18n.DateTimePatterns_ar;


/**
 * Extended set of localized date/time patterns for locale as.
 */
goog.i18n.DateTimePatterns_as = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM a h:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale as_IN.
 */
goog.i18n.DateTimePatterns_as_IN = goog.i18n.DateTimePatterns_as;


/**
 * Extended set of localized date/time patterns for locale asa.
 */
goog.i18n.DateTimePatterns_asa = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale asa_TZ.
 */
goog.i18n.DateTimePatterns_asa_TZ = goog.i18n.DateTimePatterns_asa;


/**
 * Extended set of localized date/time patterns for locale ast.
 */
goog.i18n.DateTimePatterns_ast = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'LLLL \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ast_ES.
 */
goog.i18n.DateTimePatterns_ast_ES = goog.i18n.DateTimePatterns_ast;


/**
 * Extended set of localized date/time patterns for locale az_Cyrl.
 */
goog.i18n.DateTimePatterns_az_Cyrl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM, y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'd MMM y, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale az_Cyrl_AZ.
 */
goog.i18n.DateTimePatterns_az_Cyrl_AZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM, y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'd MMM y, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale az_Latn.
 */
goog.i18n.DateTimePatterns_az_Latn = goog.i18n.DateTimePatterns_az;


/**
 * Extended set of localized date/time patterns for locale az_Latn_AZ.
 */
goog.i18n.DateTimePatterns_az_Latn_AZ = goog.i18n.DateTimePatterns_az;


/**
 * Extended set of localized date/time patterns for locale bas.
 */
goog.i18n.DateTimePatterns_bas = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bas_CM.
 */
goog.i18n.DateTimePatterns_bas_CM = goog.i18n.DateTimePatterns_bas;


/**
 * Extended set of localized date/time patterns for locale be_BY.
 */
goog.i18n.DateTimePatterns_be_BY = goog.i18n.DateTimePatterns_be;


/**
 * Extended set of localized date/time patterns for locale bem.
 */
goog.i18n.DateTimePatterns_bem = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bem_ZM.
 */
goog.i18n.DateTimePatterns_bem_ZM = goog.i18n.DateTimePatterns_bem;


/**
 * Extended set of localized date/time patterns for locale bez.
 */
goog.i18n.DateTimePatterns_bez = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bez_TZ.
 */
goog.i18n.DateTimePatterns_bez_TZ = goog.i18n.DateTimePatterns_bez;


/**
 * Extended set of localized date/time patterns for locale bg_BG.
 */
goog.i18n.DateTimePatterns_bg_BG = goog.i18n.DateTimePatterns_bg;


/**
 * Extended set of localized date/time patterns for locale bm.
 */
goog.i18n.DateTimePatterns_bm = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bm_ML.
 */
goog.i18n.DateTimePatterns_bm_ML = goog.i18n.DateTimePatterns_bm;


/**
 * Extended set of localized date/time patterns for locale bn_BD.
 */
goog.i18n.DateTimePatterns_bn_BD = goog.i18n.DateTimePatterns_bn;


/**
 * Extended set of localized date/time patterns for locale bn_IN.
 */
goog.i18n.DateTimePatterns_bn_IN = goog.i18n.DateTimePatterns_bn;


/**
 * Extended set of localized date/time patterns for locale bo.
 */
goog.i18n.DateTimePatterns_bo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y LLL',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMMཚེས་d',
  MONTH_DAY_FULL: 'MMMMའི་ཚེས་dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMMའི་ཚེས་d',
  MONTH_DAY_YEAR_MEDIUM: 'y ལོའི་MMMཚེས་d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMMཚེས་d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMMཚེས་d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bo_CN.
 */
goog.i18n.DateTimePatterns_bo_CN = goog.i18n.DateTimePatterns_bo;


/**
 * Extended set of localized date/time patterns for locale bo_IN.
 */
goog.i18n.DateTimePatterns_bo_IN = goog.i18n.DateTimePatterns_bo;


/**
 * Extended set of localized date/time patterns for locale br_FR.
 */
goog.i18n.DateTimePatterns_br_FR = goog.i18n.DateTimePatterns_br;


/**
 * Extended set of localized date/time patterns for locale brx.
 */
goog.i18n.DateTimePatterns_brx = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd-MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd-MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale brx_IN.
 */
goog.i18n.DateTimePatterns_brx_IN = goog.i18n.DateTimePatterns_brx;


/**
 * Extended set of localized date/time patterns for locale bs_Cyrl.
 */
goog.i18n.DateTimePatterns_bs_Cyrl = {
  YEAR_FULL: 'y.',
  YEAR_FULL_WITH_ERA: 'y. G',
  YEAR_MONTH_ABBR: 'MMM y.',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y.',
  MONTH_DAY_ABBR: 'dd. MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'dd.MM.',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'dd. MMM y.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, dd. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dd. MMM y.',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bs_Cyrl_BA.
 */
goog.i18n.DateTimePatterns_bs_Cyrl_BA = {
  YEAR_FULL: 'y.',
  YEAR_FULL_WITH_ERA: 'y. G',
  YEAR_MONTH_ABBR: 'MMM y.',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y.',
  MONTH_DAY_ABBR: 'dd. MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'dd.MM.',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'dd. MMM y.',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, dd. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dd. MMM y.',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale bs_Latn.
 */
goog.i18n.DateTimePatterns_bs_Latn = goog.i18n.DateTimePatterns_bs;


/**
 * Extended set of localized date/time patterns for locale bs_Latn_BA.
 */
goog.i18n.DateTimePatterns_bs_Latn_BA = goog.i18n.DateTimePatterns_bs;


/**
 * Extended set of localized date/time patterns for locale ca_AD.
 */
goog.i18n.DateTimePatterns_ca_AD = goog.i18n.DateTimePatterns_ca;


/**
 * Extended set of localized date/time patterns for locale ca_ES.
 */
goog.i18n.DateTimePatterns_ca_ES = goog.i18n.DateTimePatterns_ca;


/**
 * Extended set of localized date/time patterns for locale ca_FR.
 */
goog.i18n.DateTimePatterns_ca_FR = goog.i18n.DateTimePatterns_ca;


/**
 * Extended set of localized date/time patterns for locale ca_IT.
 */
goog.i18n.DateTimePatterns_ca_IT = goog.i18n.DateTimePatterns_ca;


/**
 * Extended set of localized date/time patterns for locale ccp.
 */
goog.i18n.DateTimePatterns_ccp = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ccp_BD.
 */
goog.i18n.DateTimePatterns_ccp_BD = goog.i18n.DateTimePatterns_ccp;


/**
 * Extended set of localized date/time patterns for locale ccp_IN.
 */
goog.i18n.DateTimePatterns_ccp_IN = goog.i18n.DateTimePatterns_ccp;


/**
 * Extended set of localized date/time patterns for locale ce.
 */
goog.i18n.DateTimePatterns_ce = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ce_RU.
 */
goog.i18n.DateTimePatterns_ce_RU = goog.i18n.DateTimePatterns_ce;


/**
 * Extended set of localized date/time patterns for locale ceb.
 */
goog.i18n.DateTimePatterns_ceb = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ceb_PH.
 */
goog.i18n.DateTimePatterns_ceb_PH = goog.i18n.DateTimePatterns_ceb;


/**
 * Extended set of localized date/time patterns for locale cgg.
 */
goog.i18n.DateTimePatterns_cgg = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale cgg_UG.
 */
goog.i18n.DateTimePatterns_cgg_UG = goog.i18n.DateTimePatterns_cgg;


/**
 * Extended set of localized date/time patterns for locale chr_US.
 */
goog.i18n.DateTimePatterns_chr_US = goog.i18n.DateTimePatterns_chr;


/**
 * Extended set of localized date/time patterns for locale ckb.
 */
goog.i18n.DateTimePatterns_ckb = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMMی y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'dی MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'dی MMMی y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE، dی MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، dی MMMی y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dی MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ckb_IQ.
 */
goog.i18n.DateTimePatterns_ckb_IQ = goog.i18n.DateTimePatterns_ckb;


/**
 * Extended set of localized date/time patterns for locale ckb_IR.
 */
goog.i18n.DateTimePatterns_ckb_IR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMMی y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'dی MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'dی MMMی y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE، dی MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، dی MMMی y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dی MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale cs_CZ.
 */
goog.i18n.DateTimePatterns_cs_CZ = goog.i18n.DateTimePatterns_cs;


/**
 * Extended set of localized date/time patterns for locale cy_GB.
 */
goog.i18n.DateTimePatterns_cy_GB = goog.i18n.DateTimePatterns_cy;


/**
 * Extended set of localized date/time patterns for locale da_DK.
 */
goog.i18n.DateTimePatterns_da_DK = goog.i18n.DateTimePatterns_da;


/**
 * Extended set of localized date/time patterns for locale da_GL.
 */
goog.i18n.DateTimePatterns_da_GL = goog.i18n.DateTimePatterns_da;


/**
 * Extended set of localized date/time patterns for locale dav.
 */
goog.i18n.DateTimePatterns_dav = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale dav_KE.
 */
goog.i18n.DateTimePatterns_dav_KE = goog.i18n.DateTimePatterns_dav;


/**
 * Extended set of localized date/time patterns for locale de_BE.
 */
goog.i18n.DateTimePatterns_de_BE = goog.i18n.DateTimePatterns_de;


/**
 * Extended set of localized date/time patterns for locale de_DE.
 */
goog.i18n.DateTimePatterns_de_DE = goog.i18n.DateTimePatterns_de;


/**
 * Extended set of localized date/time patterns for locale de_IT.
 */
goog.i18n.DateTimePatterns_de_IT = goog.i18n.DateTimePatterns_de;


/**
 * Extended set of localized date/time patterns for locale de_LI.
 */
goog.i18n.DateTimePatterns_de_LI = goog.i18n.DateTimePatterns_de;


/**
 * Extended set of localized date/time patterns for locale de_LU.
 */
goog.i18n.DateTimePatterns_de_LU = goog.i18n.DateTimePatterns_de;


/**
 * Extended set of localized date/time patterns for locale dje.
 */
goog.i18n.DateTimePatterns_dje = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale dje_NE.
 */
goog.i18n.DateTimePatterns_dje_NE = goog.i18n.DateTimePatterns_dje;


/**
 * Extended set of localized date/time patterns for locale dsb.
 */
goog.i18n.DateTimePatterns_dsb = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale dsb_DE.
 */
goog.i18n.DateTimePatterns_dsb_DE = goog.i18n.DateTimePatterns_dsb;


/**
 * Extended set of localized date/time patterns for locale dua.
 */
goog.i18n.DateTimePatterns_dua = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale dua_CM.
 */
goog.i18n.DateTimePatterns_dua_CM = goog.i18n.DateTimePatterns_dua;


/**
 * Extended set of localized date/time patterns for locale dyo.
 */
goog.i18n.DateTimePatterns_dyo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale dyo_SN.
 */
goog.i18n.DateTimePatterns_dyo_SN = goog.i18n.DateTimePatterns_dyo;


/**
 * Extended set of localized date/time patterns for locale dz.
 */
goog.i18n.DateTimePatterns_dz = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y སྤྱི་ཟླ་MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'སྤྱི་LLL ཚེ་d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M-d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, སྤྱི་LLL ཚེ་d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'གཟའ་EEE, ལོy ཟླ་MMM ཚེ་d',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'སྤྱི་LLL ཚེ་d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale dz_BT.
 */
goog.i18n.DateTimePatterns_dz_BT = goog.i18n.DateTimePatterns_dz;


/**
 * Extended set of localized date/time patterns for locale ebu.
 */
goog.i18n.DateTimePatterns_ebu = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ebu_KE.
 */
goog.i18n.DateTimePatterns_ebu_KE = goog.i18n.DateTimePatterns_ebu;


/**
 * Extended set of localized date/time patterns for locale ee.
 */
goog.i18n.DateTimePatterns_ee = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d \'lia\'',
  MONTH_DAY_FULL: 'MMMM dd \'lia\'',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d \'lia\'',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d \'lia\', y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d \'lia\'',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'a \'ga\' h:mm \'le\' zzzz MMM d \'lia\''
};


/**
 * Extended set of localized date/time patterns for locale ee_GH.
 */
goog.i18n.DateTimePatterns_ee_GH = goog.i18n.DateTimePatterns_ee;


/**
 * Extended set of localized date/time patterns for locale ee_TG.
 */
goog.i18n.DateTimePatterns_ee_TG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d \'lia\'',
  MONTH_DAY_FULL: 'MMMM dd \'lia\'',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d \'lia\'',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d \'lia\', y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d \'lia\'',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: '\'ga\' HH:mm \'le\' zzzz MMM d \'lia\''
};


/**
 * Extended set of localized date/time patterns for locale el_CY.
 */
goog.i18n.DateTimePatterns_el_CY = goog.i18n.DateTimePatterns_el;


/**
 * Extended set of localized date/time patterns for locale el_GR.
 */
goog.i18n.DateTimePatterns_el_GR = goog.i18n.DateTimePatterns_el;


/**
 * Extended set of localized date/time patterns for locale en_001.
 */
goog.i18n.DateTimePatterns_en_001 = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_150.
 */
goog.i18n.DateTimePatterns_en_150 = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_AE.
 */
goog.i18n.DateTimePatterns_en_AE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_AG.
 */
goog.i18n.DateTimePatterns_en_AG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_AI.
 */
goog.i18n.DateTimePatterns_en_AI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_AS.
 */
goog.i18n.DateTimePatterns_en_AS = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_AT.
 */
goog.i18n.DateTimePatterns_en_AT = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_BB.
 */
goog.i18n.DateTimePatterns_en_BB = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_BE.
 */
goog.i18n.DateTimePatterns_en_BE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_BI.
 */
goog.i18n.DateTimePatterns_en_BI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_BM.
 */
goog.i18n.DateTimePatterns_en_BM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_BS.
 */
goog.i18n.DateTimePatterns_en_BS = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_BW.
 */
goog.i18n.DateTimePatterns_en_BW = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'dd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'dd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, dd MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dd MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_BZ.
 */
goog.i18n.DateTimePatterns_en_BZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'dd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'dd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, dd MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dd MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_CC.
 */
goog.i18n.DateTimePatterns_en_CC = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_CH.
 */
goog.i18n.DateTimePatterns_en_CH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_CK.
 */
goog.i18n.DateTimePatterns_en_CK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_CM.
 */
goog.i18n.DateTimePatterns_en_CM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_CX.
 */
goog.i18n.DateTimePatterns_en_CX = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_CY.
 */
goog.i18n.DateTimePatterns_en_CY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_DE.
 */
goog.i18n.DateTimePatterns_en_DE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_DG.
 */
goog.i18n.DateTimePatterns_en_DG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_DK.
 */
goog.i18n.DateTimePatterns_en_DK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_DM.
 */
goog.i18n.DateTimePatterns_en_DM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_ER.
 */
goog.i18n.DateTimePatterns_en_ER = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_FI.
 */
goog.i18n.DateTimePatterns_en_FI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, H.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_FJ.
 */
goog.i18n.DateTimePatterns_en_FJ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_FK.
 */
goog.i18n.DateTimePatterns_en_FK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_FM.
 */
goog.i18n.DateTimePatterns_en_FM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_GD.
 */
goog.i18n.DateTimePatterns_en_GD = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_GG.
 */
goog.i18n.DateTimePatterns_en_GG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_GH.
 */
goog.i18n.DateTimePatterns_en_GH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_GI.
 */
goog.i18n.DateTimePatterns_en_GI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_GM.
 */
goog.i18n.DateTimePatterns_en_GM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_GU.
 */
goog.i18n.DateTimePatterns_en_GU = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_GY.
 */
goog.i18n.DateTimePatterns_en_GY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_HK.
 */
goog.i18n.DateTimePatterns_en_HK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_IL.
 */
goog.i18n.DateTimePatterns_en_IL = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_IM.
 */
goog.i18n.DateTimePatterns_en_IM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_IO.
 */
goog.i18n.DateTimePatterns_en_IO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_JE.
 */
goog.i18n.DateTimePatterns_en_JE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_JM.
 */
goog.i18n.DateTimePatterns_en_JM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_KE.
 */
goog.i18n.DateTimePatterns_en_KE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_KI.
 */
goog.i18n.DateTimePatterns_en_KI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_KN.
 */
goog.i18n.DateTimePatterns_en_KN = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_KY.
 */
goog.i18n.DateTimePatterns_en_KY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_LC.
 */
goog.i18n.DateTimePatterns_en_LC = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_LR.
 */
goog.i18n.DateTimePatterns_en_LR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_LS.
 */
goog.i18n.DateTimePatterns_en_LS = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_MG.
 */
goog.i18n.DateTimePatterns_en_MG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_MH.
 */
goog.i18n.DateTimePatterns_en_MH = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_MO.
 */
goog.i18n.DateTimePatterns_en_MO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_MP.
 */
goog.i18n.DateTimePatterns_en_MP = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_MS.
 */
goog.i18n.DateTimePatterns_en_MS = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_MT.
 */
goog.i18n.DateTimePatterns_en_MT = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'dd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'dd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dd MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_MU.
 */
goog.i18n.DateTimePatterns_en_MU = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_MW.
 */
goog.i18n.DateTimePatterns_en_MW = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_MY.
 */
goog.i18n.DateTimePatterns_en_MY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_NA.
 */
goog.i18n.DateTimePatterns_en_NA = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_NF.
 */
goog.i18n.DateTimePatterns_en_NF = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_NG.
 */
goog.i18n.DateTimePatterns_en_NG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_NL.
 */
goog.i18n.DateTimePatterns_en_NL = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_NR.
 */
goog.i18n.DateTimePatterns_en_NR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_NU.
 */
goog.i18n.DateTimePatterns_en_NU = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_NZ.
 */
goog.i18n.DateTimePatterns_en_NZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_PG.
 */
goog.i18n.DateTimePatterns_en_PG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_PH.
 */
goog.i18n.DateTimePatterns_en_PH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_PK.
 */
goog.i18n.DateTimePatterns_en_PK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_PN.
 */
goog.i18n.DateTimePatterns_en_PN = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_PR.
 */
goog.i18n.DateTimePatterns_en_PR = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_PW.
 */
goog.i18n.DateTimePatterns_en_PW = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_RW.
 */
goog.i18n.DateTimePatterns_en_RW = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SB.
 */
goog.i18n.DateTimePatterns_en_SB = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SC.
 */
goog.i18n.DateTimePatterns_en_SC = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SD.
 */
goog.i18n.DateTimePatterns_en_SD = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SE.
 */
goog.i18n.DateTimePatterns_en_SE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SH.
 */
goog.i18n.DateTimePatterns_en_SH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SI.
 */
goog.i18n.DateTimePatterns_en_SI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SL.
 */
goog.i18n.DateTimePatterns_en_SL = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SS.
 */
goog.i18n.DateTimePatterns_en_SS = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SX.
 */
goog.i18n.DateTimePatterns_en_SX = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_SZ.
 */
goog.i18n.DateTimePatterns_en_SZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_TC.
 */
goog.i18n.DateTimePatterns_en_TC = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_TK.
 */
goog.i18n.DateTimePatterns_en_TK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_TO.
 */
goog.i18n.DateTimePatterns_en_TO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_TT.
 */
goog.i18n.DateTimePatterns_en_TT = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_TV.
 */
goog.i18n.DateTimePatterns_en_TV = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_TZ.
 */
goog.i18n.DateTimePatterns_en_TZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_UG.
 */
goog.i18n.DateTimePatterns_en_UG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_UM.
 */
goog.i18n.DateTimePatterns_en_UM = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_US_POSIX.
 */
goog.i18n.DateTimePatterns_en_US_POSIX = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_VC.
 */
goog.i18n.DateTimePatterns_en_VC = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_VG.
 */
goog.i18n.DateTimePatterns_en_VG = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_VI.
 */
goog.i18n.DateTimePatterns_en_VI = goog.i18n.DateTimePatterns_en;


/**
 * Extended set of localized date/time patterns for locale en_VU.
 */
goog.i18n.DateTimePatterns_en_VU = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_WS.
 */
goog.i18n.DateTimePatterns_en_WS = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_XA.
 */
goog.i18n.DateTimePatterns_en_XA = {
  YEAR_FULL: '[y]',
  YEAR_FULL_WITH_ERA: '[y G]',
  YEAR_MONTH_ABBR: '[MMM y]',
  YEAR_MONTH_FULL: '[MMMM y]',
  YEAR_MONTH_SHORT: '[MM/y]',
  MONTH_DAY_ABBR: '[MMM d]',
  MONTH_DAY_FULL: '[MMMM dd]',
  MONTH_DAY_SHORT: '[M/d]',
  MONTH_DAY_MEDIUM: '[MMMM d]',
  MONTH_DAY_YEAR_MEDIUM: '[MMM d, y]',
  WEEKDAY_MONTH_DAY_MEDIUM: '[EEE, MMM d]',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: '[EEE, MMM d, y]',
  DAY_ABBR: '[d]',
  MONTH_DAY_TIME_ZONE_SHORT: '[[MMM d], [h:mm a zzzz]]'
};


/**
 * Extended set of localized date/time patterns for locale en_ZM.
 */
goog.i18n.DateTimePatterns_en_ZM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale en_ZW.
 */
goog.i18n.DateTimePatterns_en_ZW = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'dd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'dd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, dd MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dd MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'dd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale eo.
 */
goog.i18n.DateTimePatterns_eo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y-MMM-d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale eo_001.
 */
goog.i18n.DateTimePatterns_eo_001 = goog.i18n.DateTimePatterns_eo;


/**
 * Extended set of localized date/time patterns for locale es_AR.
 */
goog.i18n.DateTimePatterns_es_AR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_BO.
 */
goog.i18n.DateTimePatterns_es_BO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_BR.
 */
goog.i18n.DateTimePatterns_es_BR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_BZ.
 */
goog.i18n.DateTimePatterns_es_BZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_CL.
 */
goog.i18n.DateTimePatterns_es_CL = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_CO.
 */
goog.i18n.DateTimePatterns_es_CO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d \'de\' MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd \'de\' MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_CR.
 */
goog.i18n.DateTimePatterns_es_CR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_CU.
 */
goog.i18n.DateTimePatterns_es_CU = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_DO.
 */
goog.i18n.DateTimePatterns_es_DO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_EA.
 */
goog.i18n.DateTimePatterns_es_EA = goog.i18n.DateTimePatterns_es;


/**
 * Extended set of localized date/time patterns for locale es_EC.
 */
goog.i18n.DateTimePatterns_es_EC = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_GQ.
 */
goog.i18n.DateTimePatterns_es_GQ = goog.i18n.DateTimePatterns_es;


/**
 * Extended set of localized date/time patterns for locale es_GT.
 */
goog.i18n.DateTimePatterns_es_GT = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_HN.
 */
goog.i18n.DateTimePatterns_es_HN = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_IC.
 */
goog.i18n.DateTimePatterns_es_IC = goog.i18n.DateTimePatterns_es;


/**
 * Extended set of localized date/time patterns for locale es_NI.
 */
goog.i18n.DateTimePatterns_es_NI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_PA.
 */
goog.i18n.DateTimePatterns_es_PA = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'MM/dd',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_PE.
 */
goog.i18n.DateTimePatterns_es_PE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_PH.
 */
goog.i18n.DateTimePatterns_es_PH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_PR.
 */
goog.i18n.DateTimePatterns_es_PR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'MM/dd',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_PY.
 */
goog.i18n.DateTimePatterns_es_PY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_SV.
 */
goog.i18n.DateTimePatterns_es_SV = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_UY.
 */
goog.i18n.DateTimePatterns_es_UY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM H:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale es_VE.
 */
goog.i18n.DateTimePatterns_es_VE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'M/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale et_EE.
 */
goog.i18n.DateTimePatterns_et_EE = goog.i18n.DateTimePatterns_et;


/**
 * Extended set of localized date/time patterns for locale eu_ES.
 */
goog.i18n.DateTimePatterns_eu_ES = goog.i18n.DateTimePatterns_eu;


/**
 * Extended set of localized date/time patterns for locale ewo.
 */
goog.i18n.DateTimePatterns_ewo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ewo_CM.
 */
goog.i18n.DateTimePatterns_ewo_CM = goog.i18n.DateTimePatterns_ewo;


/**
 * Extended set of localized date/time patterns for locale fa_AF.
 */
goog.i18n.DateTimePatterns_fa_AF = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d،‏ HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale fa_IR.
 */
goog.i18n.DateTimePatterns_fa_IR = goog.i18n.DateTimePatterns_fa;


/**
 * Extended set of localized date/time patterns for locale ff.
 */
goog.i18n.DateTimePatterns_ff = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ff_Latn.
 */
goog.i18n.DateTimePatterns_ff_Latn = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale ff_Latn_BF.
 */
goog.i18n.DateTimePatterns_ff_Latn_BF = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale ff_Latn_CM.
 */
goog.i18n.DateTimePatterns_ff_Latn_CM = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale ff_Latn_GH.
 */
goog.i18n.DateTimePatterns_ff_Latn_GH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ff_Latn_GM.
 */
goog.i18n.DateTimePatterns_ff_Latn_GM = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ff_Latn_GN.
 */
goog.i18n.DateTimePatterns_ff_Latn_GN = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale ff_Latn_GW.
 */
goog.i18n.DateTimePatterns_ff_Latn_GW = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale ff_Latn_LR.
 */
goog.i18n.DateTimePatterns_ff_Latn_LR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ff_Latn_MR.
 */
goog.i18n.DateTimePatterns_ff_Latn_MR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ff_Latn_NE.
 */
goog.i18n.DateTimePatterns_ff_Latn_NE = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale ff_Latn_NG.
 */
goog.i18n.DateTimePatterns_ff_Latn_NG = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale ff_Latn_SL.
 */
goog.i18n.DateTimePatterns_ff_Latn_SL = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ff_Latn_SN.
 */
goog.i18n.DateTimePatterns_ff_Latn_SN = goog.i18n.DateTimePatterns_ff;


/**
 * Extended set of localized date/time patterns for locale fi_FI.
 */
goog.i18n.DateTimePatterns_fi_FI = goog.i18n.DateTimePatterns_fi;


/**
 * Extended set of localized date/time patterns for locale fil_PH.
 */
goog.i18n.DateTimePatterns_fil_PH = goog.i18n.DateTimePatterns_fil;


/**
 * Extended set of localized date/time patterns for locale fo.
 */
goog.i18n.DateTimePatterns_fo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. MMM y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fo_DK.
 */
goog.i18n.DateTimePatterns_fo_DK = goog.i18n.DateTimePatterns_fo;


/**
 * Extended set of localized date/time patterns for locale fo_FO.
 */
goog.i18n.DateTimePatterns_fo_FO = goog.i18n.DateTimePatterns_fo;


/**
 * Extended set of localized date/time patterns for locale fr_BE.
 */
goog.i18n.DateTimePatterns_fr_BE = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_BF.
 */
goog.i18n.DateTimePatterns_fr_BF = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_BI.
 */
goog.i18n.DateTimePatterns_fr_BI = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_BJ.
 */
goog.i18n.DateTimePatterns_fr_BJ = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_BL.
 */
goog.i18n.DateTimePatterns_fr_BL = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_CD.
 */
goog.i18n.DateTimePatterns_fr_CD = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_CF.
 */
goog.i18n.DateTimePatterns_fr_CF = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_CG.
 */
goog.i18n.DateTimePatterns_fr_CG = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_CH.
 */
goog.i18n.DateTimePatterns_fr_CH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM.',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_CI.
 */
goog.i18n.DateTimePatterns_fr_CI = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_CM.
 */
goog.i18n.DateTimePatterns_fr_CM = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_DJ.
 */
goog.i18n.DateTimePatterns_fr_DJ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_DZ.
 */
goog.i18n.DateTimePatterns_fr_DZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_FR.
 */
goog.i18n.DateTimePatterns_fr_FR = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_GA.
 */
goog.i18n.DateTimePatterns_fr_GA = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_GF.
 */
goog.i18n.DateTimePatterns_fr_GF = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_GN.
 */
goog.i18n.DateTimePatterns_fr_GN = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_GP.
 */
goog.i18n.DateTimePatterns_fr_GP = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_GQ.
 */
goog.i18n.DateTimePatterns_fr_GQ = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_HT.
 */
goog.i18n.DateTimePatterns_fr_HT = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_KM.
 */
goog.i18n.DateTimePatterns_fr_KM = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_LU.
 */
goog.i18n.DateTimePatterns_fr_LU = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_MA.
 */
goog.i18n.DateTimePatterns_fr_MA = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_MC.
 */
goog.i18n.DateTimePatterns_fr_MC = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_MF.
 */
goog.i18n.DateTimePatterns_fr_MF = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_MG.
 */
goog.i18n.DateTimePatterns_fr_MG = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_ML.
 */
goog.i18n.DateTimePatterns_fr_ML = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_MQ.
 */
goog.i18n.DateTimePatterns_fr_MQ = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_MR.
 */
goog.i18n.DateTimePatterns_fr_MR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_MU.
 */
goog.i18n.DateTimePatterns_fr_MU = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_NC.
 */
goog.i18n.DateTimePatterns_fr_NC = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_NE.
 */
goog.i18n.DateTimePatterns_fr_NE = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_PF.
 */
goog.i18n.DateTimePatterns_fr_PF = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_PM.
 */
goog.i18n.DateTimePatterns_fr_PM = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_RE.
 */
goog.i18n.DateTimePatterns_fr_RE = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_RW.
 */
goog.i18n.DateTimePatterns_fr_RW = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_SC.
 */
goog.i18n.DateTimePatterns_fr_SC = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_SN.
 */
goog.i18n.DateTimePatterns_fr_SN = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_SY.
 */
goog.i18n.DateTimePatterns_fr_SY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_TD.
 */
goog.i18n.DateTimePatterns_fr_TD = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_TG.
 */
goog.i18n.DateTimePatterns_fr_TG = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_TN.
 */
goog.i18n.DateTimePatterns_fr_TN = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_VU.
 */
goog.i18n.DateTimePatterns_fr_VU = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM \'à\' h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fr_WF.
 */
goog.i18n.DateTimePatterns_fr_WF = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fr_YT.
 */
goog.i18n.DateTimePatterns_fr_YT = goog.i18n.DateTimePatterns_fr;


/**
 * Extended set of localized date/time patterns for locale fur.
 */
goog.i18n.DateTimePatterns_fur = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'LLLL \'dal\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'di\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd \'di\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fur_IT.
 */
goog.i18n.DateTimePatterns_fur_IT = goog.i18n.DateTimePatterns_fur;


/**
 * Extended set of localized date/time patterns for locale fy.
 */
goog.i18n.DateTimePatterns_fy = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd-M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale fy_NL.
 */
goog.i18n.DateTimePatterns_fy_NL = goog.i18n.DateTimePatterns_fy;


/**
 * Extended set of localized date/time patterns for locale ga_IE.
 */
goog.i18n.DateTimePatterns_ga_IE = goog.i18n.DateTimePatterns_ga;


/**
 * Extended set of localized date/time patterns for locale gd.
 */
goog.i18n.DateTimePatterns_gd = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'LLL Y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'LL/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd\'mh\' MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd\'mh\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale gd_GB.
 */
goog.i18n.DateTimePatterns_gd_GB = goog.i18n.DateTimePatterns_gd;


/**
 * Extended set of localized date/time patterns for locale gl_ES.
 */
goog.i18n.DateTimePatterns_gl_ES = goog.i18n.DateTimePatterns_gl;


/**
 * Extended set of localized date/time patterns for locale gsw_CH.
 */
goog.i18n.DateTimePatterns_gsw_CH = goog.i18n.DateTimePatterns_gsw;


/**
 * Extended set of localized date/time patterns for locale gsw_FR.
 */
goog.i18n.DateTimePatterns_gsw_FR = goog.i18n.DateTimePatterns_gsw;


/**
 * Extended set of localized date/time patterns for locale gsw_LI.
 */
goog.i18n.DateTimePatterns_gsw_LI = goog.i18n.DateTimePatterns_gsw;


/**
 * Extended set of localized date/time patterns for locale gu_IN.
 */
goog.i18n.DateTimePatterns_gu_IN = goog.i18n.DateTimePatterns_gu;


/**
 * Extended set of localized date/time patterns for locale guz.
 */
goog.i18n.DateTimePatterns_guz = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale guz_KE.
 */
goog.i18n.DateTimePatterns_guz_KE = goog.i18n.DateTimePatterns_guz;


/**
 * Extended set of localized date/time patterns for locale gv.
 */
goog.i18n.DateTimePatterns_gv = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale gv_IM.
 */
goog.i18n.DateTimePatterns_gv_IM = goog.i18n.DateTimePatterns_gv;


/**
 * Extended set of localized date/time patterns for locale ha.
 */
goog.i18n.DateTimePatterns_ha = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ha_GH.
 */
goog.i18n.DateTimePatterns_ha_GH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ha_NE.
 */
goog.i18n.DateTimePatterns_ha_NE = goog.i18n.DateTimePatterns_ha;


/**
 * Extended set of localized date/time patterns for locale ha_NG.
 */
goog.i18n.DateTimePatterns_ha_NG = goog.i18n.DateTimePatterns_ha;


/**
 * Extended set of localized date/time patterns for locale haw_US.
 */
goog.i18n.DateTimePatterns_haw_US = goog.i18n.DateTimePatterns_haw;


/**
 * Extended set of localized date/time patterns for locale he_IL.
 */
goog.i18n.DateTimePatterns_he_IL = goog.i18n.DateTimePatterns_he;


/**
 * Extended set of localized date/time patterns for locale hi_IN.
 */
goog.i18n.DateTimePatterns_hi_IN = goog.i18n.DateTimePatterns_hi;


/**
 * Extended set of localized date/time patterns for locale hr_BA.
 */
goog.i18n.DateTimePatterns_hr_BA = goog.i18n.DateTimePatterns_hr;


/**
 * Extended set of localized date/time patterns for locale hr_HR.
 */
goog.i18n.DateTimePatterns_hr_HR = goog.i18n.DateTimePatterns_hr;


/**
 * Extended set of localized date/time patterns for locale hsb.
 */
goog.i18n.DateTimePatterns_hsb = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale hsb_DE.
 */
goog.i18n.DateTimePatterns_hsb_DE = goog.i18n.DateTimePatterns_hsb;


/**
 * Extended set of localized date/time patterns for locale hu_HU.
 */
goog.i18n.DateTimePatterns_hu_HU = goog.i18n.DateTimePatterns_hu;


/**
 * Extended set of localized date/time patterns for locale hy_AM.
 */
goog.i18n.DateTimePatterns_hy_AM = goog.i18n.DateTimePatterns_hy;


/**
 * Extended set of localized date/time patterns for locale ia.
 */
goog.i18n.DateTimePatterns_ia = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ia_001.
 */
goog.i18n.DateTimePatterns_ia_001 = goog.i18n.DateTimePatterns_ia;


/**
 * Extended set of localized date/time patterns for locale id_ID.
 */
goog.i18n.DateTimePatterns_id_ID = goog.i18n.DateTimePatterns_id;


/**
 * Extended set of localized date/time patterns for locale ig.
 */
goog.i18n.DateTimePatterns_ig = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ig_NG.
 */
goog.i18n.DateTimePatterns_ig_NG = goog.i18n.DateTimePatterns_ig;


/**
 * Extended set of localized date/time patterns for locale ii.
 */
goog.i18n.DateTimePatterns_ii = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ii_CN.
 */
goog.i18n.DateTimePatterns_ii_CN = goog.i18n.DateTimePatterns_ii;


/**
 * Extended set of localized date/time patterns for locale is_IS.
 */
goog.i18n.DateTimePatterns_is_IS = goog.i18n.DateTimePatterns_is;


/**
 * Extended set of localized date/time patterns for locale it_CH.
 */
goog.i18n.DateTimePatterns_it_CH = goog.i18n.DateTimePatterns_it;


/**
 * Extended set of localized date/time patterns for locale it_IT.
 */
goog.i18n.DateTimePatterns_it_IT = goog.i18n.DateTimePatterns_it;


/**
 * Extended set of localized date/time patterns for locale it_SM.
 */
goog.i18n.DateTimePatterns_it_SM = goog.i18n.DateTimePatterns_it;


/**
 * Extended set of localized date/time patterns for locale it_VA.
 */
goog.i18n.DateTimePatterns_it_VA = goog.i18n.DateTimePatterns_it;


/**
 * Extended set of localized date/time patterns for locale ja_JP.
 */
goog.i18n.DateTimePatterns_ja_JP = goog.i18n.DateTimePatterns_ja;


/**
 * Extended set of localized date/time patterns for locale jgo.
 */
goog.i18n.DateTimePatterns_jgo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale jgo_CM.
 */
goog.i18n.DateTimePatterns_jgo_CM = goog.i18n.DateTimePatterns_jgo;


/**
 * Extended set of localized date/time patterns for locale jmc.
 */
goog.i18n.DateTimePatterns_jmc = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale jmc_TZ.
 */
goog.i18n.DateTimePatterns_jmc_TZ = goog.i18n.DateTimePatterns_jmc;


/**
 * Extended set of localized date/time patterns for locale jv.
 */
goog.i18n.DateTimePatterns_jv = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale jv_ID.
 */
goog.i18n.DateTimePatterns_jv_ID = goog.i18n.DateTimePatterns_jv;


/**
 * Extended set of localized date/time patterns for locale ka_GE.
 */
goog.i18n.DateTimePatterns_ka_GE = goog.i18n.DateTimePatterns_ka;


/**
 * Extended set of localized date/time patterns for locale kab.
 */
goog.i18n.DateTimePatterns_kab = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kab_DZ.
 */
goog.i18n.DateTimePatterns_kab_DZ = goog.i18n.DateTimePatterns_kab;


/**
 * Extended set of localized date/time patterns for locale kam.
 */
goog.i18n.DateTimePatterns_kam = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kam_KE.
 */
goog.i18n.DateTimePatterns_kam_KE = goog.i18n.DateTimePatterns_kam;


/**
 * Extended set of localized date/time patterns for locale kde.
 */
goog.i18n.DateTimePatterns_kde = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kde_TZ.
 */
goog.i18n.DateTimePatterns_kde_TZ = goog.i18n.DateTimePatterns_kde;


/**
 * Extended set of localized date/time patterns for locale kea.
 */
goog.i18n.DateTimePatterns_kea = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM \'di\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd \'di\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'di\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale kea_CV.
 */
goog.i18n.DateTimePatterns_kea_CV = goog.i18n.DateTimePatterns_kea;


/**
 * Extended set of localized date/time patterns for locale khq.
 */
goog.i18n.DateTimePatterns_khq = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale khq_ML.
 */
goog.i18n.DateTimePatterns_khq_ML = goog.i18n.DateTimePatterns_khq;


/**
 * Extended set of localized date/time patterns for locale ki.
 */
goog.i18n.DateTimePatterns_ki = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ki_KE.
 */
goog.i18n.DateTimePatterns_ki_KE = goog.i18n.DateTimePatterns_ki;


/**
 * Extended set of localized date/time patterns for locale kk_KZ.
 */
goog.i18n.DateTimePatterns_kk_KZ = goog.i18n.DateTimePatterns_kk;


/**
 * Extended set of localized date/time patterns for locale kkj.
 */
goog.i18n.DateTimePatterns_kkj = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kkj_CM.
 */
goog.i18n.DateTimePatterns_kkj_CM = goog.i18n.DateTimePatterns_kkj;


/**
 * Extended set of localized date/time patterns for locale kl.
 */
goog.i18n.DateTimePatterns_kl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kl_GL.
 */
goog.i18n.DateTimePatterns_kl_GL = goog.i18n.DateTimePatterns_kl;


/**
 * Extended set of localized date/time patterns for locale kln.
 */
goog.i18n.DateTimePatterns_kln = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kln_KE.
 */
goog.i18n.DateTimePatterns_kln_KE = goog.i18n.DateTimePatterns_kln;


/**
 * Extended set of localized date/time patterns for locale km_KH.
 */
goog.i18n.DateTimePatterns_km_KH = goog.i18n.DateTimePatterns_km;


/**
 * Extended set of localized date/time patterns for locale kn_IN.
 */
goog.i18n.DateTimePatterns_kn_IN = goog.i18n.DateTimePatterns_kn;


/**
 * Extended set of localized date/time patterns for locale ko_KP.
 */
goog.i18n.DateTimePatterns_ko_KP = goog.i18n.DateTimePatterns_ko;


/**
 * Extended set of localized date/time patterns for locale ko_KR.
 */
goog.i18n.DateTimePatterns_ko_KR = goog.i18n.DateTimePatterns_ko;


/**
 * Extended set of localized date/time patterns for locale kok.
 */
goog.i18n.DateTimePatterns_kok = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kok_IN.
 */
goog.i18n.DateTimePatterns_kok_IN = goog.i18n.DateTimePatterns_kok;


/**
 * Extended set of localized date/time patterns for locale ks.
 */
goog.i18n.DateTimePatterns_ks = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'Gy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd-MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd-MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ks_IN.
 */
goog.i18n.DateTimePatterns_ks_IN = goog.i18n.DateTimePatterns_ks;


/**
 * Extended set of localized date/time patterns for locale ksb.
 */
goog.i18n.DateTimePatterns_ksb = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ksb_TZ.
 */
goog.i18n.DateTimePatterns_ksb_TZ = goog.i18n.DateTimePatterns_ksb;


/**
 * Extended set of localized date/time patterns for locale ksf.
 */
goog.i18n.DateTimePatterns_ksf = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ksf_CM.
 */
goog.i18n.DateTimePatterns_ksf_CM = goog.i18n.DateTimePatterns_ksf;


/**
 * Extended set of localized date/time patterns for locale ksh.
 */
goog.i18n.DateTimePatterns_ksh = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'Y-MM',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM. y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. MMM. y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ksh_DE.
 */
goog.i18n.DateTimePatterns_ksh_DE = goog.i18n.DateTimePatterns_ksh;


/**
 * Extended set of localized date/time patterns for locale ku.
 */
goog.i18n.DateTimePatterns_ku = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ku_TR.
 */
goog.i18n.DateTimePatterns_ku_TR = goog.i18n.DateTimePatterns_ku;


/**
 * Extended set of localized date/time patterns for locale kw.
 */
goog.i18n.DateTimePatterns_kw = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale kw_GB.
 */
goog.i18n.DateTimePatterns_kw_GB = goog.i18n.DateTimePatterns_kw;


/**
 * Extended set of localized date/time patterns for locale ky_KG.
 */
goog.i18n.DateTimePatterns_ky_KG = goog.i18n.DateTimePatterns_ky;


/**
 * Extended set of localized date/time patterns for locale lag.
 */
goog.i18n.DateTimePatterns_lag = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lag_TZ.
 */
goog.i18n.DateTimePatterns_lag_TZ = goog.i18n.DateTimePatterns_lag;


/**
 * Extended set of localized date/time patterns for locale lb.
 */
goog.i18n.DateTimePatterns_lb = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lb_LU.
 */
goog.i18n.DateTimePatterns_lb_LU = goog.i18n.DateTimePatterns_lb;


/**
 * Extended set of localized date/time patterns for locale lg.
 */
goog.i18n.DateTimePatterns_lg = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lg_UG.
 */
goog.i18n.DateTimePatterns_lg_UG = goog.i18n.DateTimePatterns_lg;


/**
 * Extended set of localized date/time patterns for locale lkt.
 */
goog.i18n.DateTimePatterns_lkt = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lkt_US.
 */
goog.i18n.DateTimePatterns_lkt_US = goog.i18n.DateTimePatterns_lkt;


/**
 * Extended set of localized date/time patterns for locale ln_AO.
 */
goog.i18n.DateTimePatterns_ln_AO = goog.i18n.DateTimePatterns_ln;


/**
 * Extended set of localized date/time patterns for locale ln_CD.
 */
goog.i18n.DateTimePatterns_ln_CD = goog.i18n.DateTimePatterns_ln;


/**
 * Extended set of localized date/time patterns for locale ln_CF.
 */
goog.i18n.DateTimePatterns_ln_CF = goog.i18n.DateTimePatterns_ln;


/**
 * Extended set of localized date/time patterns for locale ln_CG.
 */
goog.i18n.DateTimePatterns_ln_CG = goog.i18n.DateTimePatterns_ln;


/**
 * Extended set of localized date/time patterns for locale lo_LA.
 */
goog.i18n.DateTimePatterns_lo_LA = goog.i18n.DateTimePatterns_lo;


/**
 * Extended set of localized date/time patterns for locale lrc.
 */
goog.i18n.DateTimePatterns_lrc = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lrc_IQ.
 */
goog.i18n.DateTimePatterns_lrc_IQ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lrc_IR.
 */
goog.i18n.DateTimePatterns_lrc_IR = goog.i18n.DateTimePatterns_lrc;


/**
 * Extended set of localized date/time patterns for locale lt_LT.
 */
goog.i18n.DateTimePatterns_lt_LT = goog.i18n.DateTimePatterns_lt;


/**
 * Extended set of localized date/time patterns for locale lu.
 */
goog.i18n.DateTimePatterns_lu = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale lu_CD.
 */
goog.i18n.DateTimePatterns_lu_CD = goog.i18n.DateTimePatterns_lu;


/**
 * Extended set of localized date/time patterns for locale luo.
 */
goog.i18n.DateTimePatterns_luo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale luo_KE.
 */
goog.i18n.DateTimePatterns_luo_KE = goog.i18n.DateTimePatterns_luo;


/**
 * Extended set of localized date/time patterns for locale luy.
 */
goog.i18n.DateTimePatterns_luy = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale luy_KE.
 */
goog.i18n.DateTimePatterns_luy_KE = goog.i18n.DateTimePatterns_luy;


/**
 * Extended set of localized date/time patterns for locale lv_LV.
 */
goog.i18n.DateTimePatterns_lv_LV = goog.i18n.DateTimePatterns_lv;


/**
 * Extended set of localized date/time patterns for locale mas.
 */
goog.i18n.DateTimePatterns_mas = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mas_KE.
 */
goog.i18n.DateTimePatterns_mas_KE = goog.i18n.DateTimePatterns_mas;


/**
 * Extended set of localized date/time patterns for locale mas_TZ.
 */
goog.i18n.DateTimePatterns_mas_TZ = goog.i18n.DateTimePatterns_mas;


/**
 * Extended set of localized date/time patterns for locale mer.
 */
goog.i18n.DateTimePatterns_mer = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mer_KE.
 */
goog.i18n.DateTimePatterns_mer_KE = goog.i18n.DateTimePatterns_mer;


/**
 * Extended set of localized date/time patterns for locale mfe.
 */
goog.i18n.DateTimePatterns_mfe = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mfe_MU.
 */
goog.i18n.DateTimePatterns_mfe_MU = goog.i18n.DateTimePatterns_mfe;


/**
 * Extended set of localized date/time patterns for locale mg.
 */
goog.i18n.DateTimePatterns_mg = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mg_MG.
 */
goog.i18n.DateTimePatterns_mg_MG = goog.i18n.DateTimePatterns_mg;


/**
 * Extended set of localized date/time patterns for locale mgh.
 */
goog.i18n.DateTimePatterns_mgh = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mgh_MZ.
 */
goog.i18n.DateTimePatterns_mgh_MZ = goog.i18n.DateTimePatterns_mgh;


/**
 * Extended set of localized date/time patterns for locale mgo.
 */
goog.i18n.DateTimePatterns_mgo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mgo_CM.
 */
goog.i18n.DateTimePatterns_mgo_CM = goog.i18n.DateTimePatterns_mgo;


/**
 * Extended set of localized date/time patterns for locale mi.
 */
goog.i18n.DateTimePatterns_mi = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mi_NZ.
 */
goog.i18n.DateTimePatterns_mi_NZ = goog.i18n.DateTimePatterns_mi;


/**
 * Extended set of localized date/time patterns for locale mk_MK.
 */
goog.i18n.DateTimePatterns_mk_MK = goog.i18n.DateTimePatterns_mk;


/**
 * Extended set of localized date/time patterns for locale ml_IN.
 */
goog.i18n.DateTimePatterns_ml_IN = goog.i18n.DateTimePatterns_ml;


/**
 * Extended set of localized date/time patterns for locale mn_MN.
 */
goog.i18n.DateTimePatterns_mn_MN = goog.i18n.DateTimePatterns_mn;


/**
 * Extended set of localized date/time patterns for locale mr_IN.
 */
goog.i18n.DateTimePatterns_mr_IN = goog.i18n.DateTimePatterns_mr;


/**
 * Extended set of localized date/time patterns for locale ms_BN.
 */
goog.i18n.DateTimePatterns_ms_BN = goog.i18n.DateTimePatterns_ms;


/**
 * Extended set of localized date/time patterns for locale ms_MY.
 */
goog.i18n.DateTimePatterns_ms_MY = goog.i18n.DateTimePatterns_ms;


/**
 * Extended set of localized date/time patterns for locale ms_SG.
 */
goog.i18n.DateTimePatterns_ms_SG = goog.i18n.DateTimePatterns_ms;


/**
 * Extended set of localized date/time patterns for locale mt_MT.
 */
goog.i18n.DateTimePatterns_mt_MT = goog.i18n.DateTimePatterns_mt;


/**
 * Extended set of localized date/time patterns for locale mua.
 */
goog.i18n.DateTimePatterns_mua = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mua_CM.
 */
goog.i18n.DateTimePatterns_mua_CM = goog.i18n.DateTimePatterns_mua;


/**
 * Extended set of localized date/time patterns for locale my_MM.
 */
goog.i18n.DateTimePatterns_my_MM = goog.i18n.DateTimePatterns_my;


/**
 * Extended set of localized date/time patterns for locale mzn.
 */
goog.i18n.DateTimePatterns_mzn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale mzn_IR.
 */
goog.i18n.DateTimePatterns_mzn_IR = goog.i18n.DateTimePatterns_mzn;


/**
 * Extended set of localized date/time patterns for locale naq.
 */
goog.i18n.DateTimePatterns_naq = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale naq_NA.
 */
goog.i18n.DateTimePatterns_naq_NA = goog.i18n.DateTimePatterns_naq;


/**
 * Extended set of localized date/time patterns for locale nb_NO.
 */
goog.i18n.DateTimePatterns_nb_NO = goog.i18n.DateTimePatterns_nb;


/**
 * Extended set of localized date/time patterns for locale nb_SJ.
 */
goog.i18n.DateTimePatterns_nb_SJ = goog.i18n.DateTimePatterns_nb;


/**
 * Extended set of localized date/time patterns for locale nd.
 */
goog.i18n.DateTimePatterns_nd = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nd_ZW.
 */
goog.i18n.DateTimePatterns_nd_ZW = goog.i18n.DateTimePatterns_nd;


/**
 * Extended set of localized date/time patterns for locale nds.
 */
goog.i18n.DateTimePatterns_nds = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nds_DE.
 */
goog.i18n.DateTimePatterns_nds_DE = goog.i18n.DateTimePatterns_nds;


/**
 * Extended set of localized date/time patterns for locale nds_NL.
 */
goog.i18n.DateTimePatterns_nds_NL = goog.i18n.DateTimePatterns_nds;


/**
 * Extended set of localized date/time patterns for locale ne_IN.
 */
goog.i18n.DateTimePatterns_ne_IN = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ne_NP.
 */
goog.i18n.DateTimePatterns_ne_NP = goog.i18n.DateTimePatterns_ne;


/**
 * Extended set of localized date/time patterns for locale nl_AW.
 */
goog.i18n.DateTimePatterns_nl_AW = goog.i18n.DateTimePatterns_nl;


/**
 * Extended set of localized date/time patterns for locale nl_BE.
 */
goog.i18n.DateTimePatterns_nl_BE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nl_BQ.
 */
goog.i18n.DateTimePatterns_nl_BQ = goog.i18n.DateTimePatterns_nl;


/**
 * Extended set of localized date/time patterns for locale nl_CW.
 */
goog.i18n.DateTimePatterns_nl_CW = goog.i18n.DateTimePatterns_nl;


/**
 * Extended set of localized date/time patterns for locale nl_NL.
 */
goog.i18n.DateTimePatterns_nl_NL = goog.i18n.DateTimePatterns_nl;


/**
 * Extended set of localized date/time patterns for locale nl_SR.
 */
goog.i18n.DateTimePatterns_nl_SR = goog.i18n.DateTimePatterns_nl;


/**
 * Extended set of localized date/time patterns for locale nl_SX.
 */
goog.i18n.DateTimePatterns_nl_SX = goog.i18n.DateTimePatterns_nl;


/**
 * Extended set of localized date/time patterns for locale nmg.
 */
goog.i18n.DateTimePatterns_nmg = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nmg_CM.
 */
goog.i18n.DateTimePatterns_nmg_CM = goog.i18n.DateTimePatterns_nmg;


/**
 * Extended set of localized date/time patterns for locale nn.
 */
goog.i18n.DateTimePatterns_nn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d. MMM y',
  DAY_ABBR: 'd.',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nn_NO.
 */
goog.i18n.DateTimePatterns_nn_NO = goog.i18n.DateTimePatterns_nn;


/**
 * Extended set of localized date/time patterns for locale nnh.
 */
goog.i18n.DateTimePatterns_nnh = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: '\'lyɛ\'̌ʼ d \'na\' MMMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE , \'lyɛ\'̌ʼ d \'na\' MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nnh_CM.
 */
goog.i18n.DateTimePatterns_nnh_CM = goog.i18n.DateTimePatterns_nnh;


/**
 * Extended set of localized date/time patterns for locale nus.
 */
goog.i18n.DateTimePatterns_nus = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE، d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nus_SS.
 */
goog.i18n.DateTimePatterns_nus_SS = goog.i18n.DateTimePatterns_nus;


/**
 * Extended set of localized date/time patterns for locale nyn.
 */
goog.i18n.DateTimePatterns_nyn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale nyn_UG.
 */
goog.i18n.DateTimePatterns_nyn_UG = goog.i18n.DateTimePatterns_nyn;


/**
 * Extended set of localized date/time patterns for locale om.
 */
goog.i18n.DateTimePatterns_om = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale om_ET.
 */
goog.i18n.DateTimePatterns_om_ET = goog.i18n.DateTimePatterns_om;


/**
 * Extended set of localized date/time patterns for locale om_KE.
 */
goog.i18n.DateTimePatterns_om_KE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale or_IN.
 */
goog.i18n.DateTimePatterns_or_IN = goog.i18n.DateTimePatterns_or;


/**
 * Extended set of localized date/time patterns for locale os.
 */
goog.i18n.DateTimePatterns_os = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y \'аз\'',
  WEEKDAY_MONTH_DAY_MEDIUM: 'ccc, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale os_GE.
 */
goog.i18n.DateTimePatterns_os_GE = goog.i18n.DateTimePatterns_os;


/**
 * Extended set of localized date/time patterns for locale os_RU.
 */
goog.i18n.DateTimePatterns_os_RU = goog.i18n.DateTimePatterns_os;


/**
 * Extended set of localized date/time patterns for locale pa_Arab.
 */
goog.i18n.DateTimePatterns_pa_Arab = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pa_Arab_PK.
 */
goog.i18n.DateTimePatterns_pa_Arab_PK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pa_Guru.
 */
goog.i18n.DateTimePatterns_pa_Guru = goog.i18n.DateTimePatterns_pa;


/**
 * Extended set of localized date/time patterns for locale pa_Guru_IN.
 */
goog.i18n.DateTimePatterns_pa_Guru_IN = goog.i18n.DateTimePatterns_pa;


/**
 * Extended set of localized date/time patterns for locale pl_PL.
 */
goog.i18n.DateTimePatterns_pl_PL = goog.i18n.DateTimePatterns_pl;


/**
 * Extended set of localized date/time patterns for locale ps.
 */
goog.i18n.DateTimePatterns_ps = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ps_AF.
 */
goog.i18n.DateTimePatterns_ps_AF = goog.i18n.DateTimePatterns_ps;


/**
 * Extended set of localized date/time patterns for locale ps_PK.
 */
goog.i18n.DateTimePatterns_ps_PK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_AO.
 */
goog.i18n.DateTimePatterns_pt_AO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_CH.
 */
goog.i18n.DateTimePatterns_pt_CH = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_CV.
 */
goog.i18n.DateTimePatterns_pt_CV = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_GQ.
 */
goog.i18n.DateTimePatterns_pt_GQ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_GW.
 */
goog.i18n.DateTimePatterns_pt_GW = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_LU.
 */
goog.i18n.DateTimePatterns_pt_LU = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_MO.
 */
goog.i18n.DateTimePatterns_pt_MO = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_MZ.
 */
goog.i18n.DateTimePatterns_pt_MZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_ST.
 */
goog.i18n.DateTimePatterns_pt_ST = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale pt_TL.
 */
goog.i18n.DateTimePatterns_pt_TL = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MM/y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd/MM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd \'de\' MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd/MM/y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d/MM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d/MM/y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd/MM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale qu.
 */
goog.i18n.DateTimePatterns_qu = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale qu_BO.
 */
goog.i18n.DateTimePatterns_qu_BO = goog.i18n.DateTimePatterns_qu;


/**
 * Extended set of localized date/time patterns for locale qu_EC.
 */
goog.i18n.DateTimePatterns_qu_EC = goog.i18n.DateTimePatterns_qu;


/**
 * Extended set of localized date/time patterns for locale qu_PE.
 */
goog.i18n.DateTimePatterns_qu_PE = goog.i18n.DateTimePatterns_qu;


/**
 * Extended set of localized date/time patterns for locale rm.
 */
goog.i18n.DateTimePatterns_rm = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'd. MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale rm_CH.
 */
goog.i18n.DateTimePatterns_rm_CH = goog.i18n.DateTimePatterns_rm;


/**
 * Extended set of localized date/time patterns for locale rn.
 */
goog.i18n.DateTimePatterns_rn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale rn_BI.
 */
goog.i18n.DateTimePatterns_rn_BI = goog.i18n.DateTimePatterns_rn;


/**
 * Extended set of localized date/time patterns for locale ro_MD.
 */
goog.i18n.DateTimePatterns_ro_MD = goog.i18n.DateTimePatterns_ro;


/**
 * Extended set of localized date/time patterns for locale ro_RO.
 */
goog.i18n.DateTimePatterns_ro_RO = goog.i18n.DateTimePatterns_ro;


/**
 * Extended set of localized date/time patterns for locale rof.
 */
goog.i18n.DateTimePatterns_rof = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale rof_TZ.
 */
goog.i18n.DateTimePatterns_rof_TZ = goog.i18n.DateTimePatterns_rof;


/**
 * Extended set of localized date/time patterns for locale ru_BY.
 */
goog.i18n.DateTimePatterns_ru_BY = goog.i18n.DateTimePatterns_ru;


/**
 * Extended set of localized date/time patterns for locale ru_KG.
 */
goog.i18n.DateTimePatterns_ru_KG = goog.i18n.DateTimePatterns_ru;


/**
 * Extended set of localized date/time patterns for locale ru_KZ.
 */
goog.i18n.DateTimePatterns_ru_KZ = goog.i18n.DateTimePatterns_ru;


/**
 * Extended set of localized date/time patterns for locale ru_MD.
 */
goog.i18n.DateTimePatterns_ru_MD = goog.i18n.DateTimePatterns_ru;


/**
 * Extended set of localized date/time patterns for locale ru_RU.
 */
goog.i18n.DateTimePatterns_ru_RU = goog.i18n.DateTimePatterns_ru;


/**
 * Extended set of localized date/time patterns for locale ru_UA.
 */
goog.i18n.DateTimePatterns_ru_UA = goog.i18n.DateTimePatterns_ru;


/**
 * Extended set of localized date/time patterns for locale rw.
 */
goog.i18n.DateTimePatterns_rw = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale rw_RW.
 */
goog.i18n.DateTimePatterns_rw_RW = goog.i18n.DateTimePatterns_rw;


/**
 * Extended set of localized date/time patterns for locale rwk.
 */
goog.i18n.DateTimePatterns_rwk = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale rwk_TZ.
 */
goog.i18n.DateTimePatterns_rwk_TZ = goog.i18n.DateTimePatterns_rwk;


/**
 * Extended set of localized date/time patterns for locale sah.
 */
goog.i18n.DateTimePatterns_sah = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y \'с\'. G',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sah_RU.
 */
goog.i18n.DateTimePatterns_sah_RU = goog.i18n.DateTimePatterns_sah;


/**
 * Extended set of localized date/time patterns for locale saq.
 */
goog.i18n.DateTimePatterns_saq = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale saq_KE.
 */
goog.i18n.DateTimePatterns_saq_KE = goog.i18n.DateTimePatterns_saq;


/**
 * Extended set of localized date/time patterns for locale sbp.
 */
goog.i18n.DateTimePatterns_sbp = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sbp_TZ.
 */
goog.i18n.DateTimePatterns_sbp_TZ = goog.i18n.DateTimePatterns_sbp;


/**
 * Extended set of localized date/time patterns for locale sd.
 */
goog.i18n.DateTimePatterns_sd = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sd_PK.
 */
goog.i18n.DateTimePatterns_sd_PK = goog.i18n.DateTimePatterns_sd;


/**
 * Extended set of localized date/time patterns for locale se.
 */
goog.i18n.DateTimePatterns_se = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale se_FI.
 */
goog.i18n.DateTimePatterns_se_FI = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale se_NO.
 */
goog.i18n.DateTimePatterns_se_NO = goog.i18n.DateTimePatterns_se;


/**
 * Extended set of localized date/time patterns for locale se_SE.
 */
goog.i18n.DateTimePatterns_se_SE = goog.i18n.DateTimePatterns_se;


/**
 * Extended set of localized date/time patterns for locale seh.
 */
goog.i18n.DateTimePatterns_seh = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd \'de\' MMM \'de\' y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d \'de\' MMM \'de\' y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale seh_MZ.
 */
goog.i18n.DateTimePatterns_seh_MZ = goog.i18n.DateTimePatterns_seh;


/**
 * Extended set of localized date/time patterns for locale ses.
 */
goog.i18n.DateTimePatterns_ses = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ses_ML.
 */
goog.i18n.DateTimePatterns_ses_ML = goog.i18n.DateTimePatterns_ses;


/**
 * Extended set of localized date/time patterns for locale sg.
 */
goog.i18n.DateTimePatterns_sg = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sg_CF.
 */
goog.i18n.DateTimePatterns_sg_CF = goog.i18n.DateTimePatterns_sg;


/**
 * Extended set of localized date/time patterns for locale shi.
 */
goog.i18n.DateTimePatterns_shi = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale shi_Latn.
 */
goog.i18n.DateTimePatterns_shi_Latn = goog.i18n.DateTimePatterns_shi;


/**
 * Extended set of localized date/time patterns for locale shi_Latn_MA.
 */
goog.i18n.DateTimePatterns_shi_Latn_MA = goog.i18n.DateTimePatterns_shi;


/**
 * Extended set of localized date/time patterns for locale shi_Tfng.
 */
goog.i18n.DateTimePatterns_shi_Tfng = goog.i18n.DateTimePatterns_shi;


/**
 * Extended set of localized date/time patterns for locale shi_Tfng_MA.
 */
goog.i18n.DateTimePatterns_shi_Tfng_MA = goog.i18n.DateTimePatterns_shi;


/**
 * Extended set of localized date/time patterns for locale si_LK.
 */
goog.i18n.DateTimePatterns_si_LK = goog.i18n.DateTimePatterns_si;


/**
 * Extended set of localized date/time patterns for locale sk_SK.
 */
goog.i18n.DateTimePatterns_sk_SK = goog.i18n.DateTimePatterns_sk;


/**
 * Extended set of localized date/time patterns for locale sl_SI.
 */
goog.i18n.DateTimePatterns_sl_SI = goog.i18n.DateTimePatterns_sl;


/**
 * Extended set of localized date/time patterns for locale smn.
 */
goog.i18n.DateTimePatterns_smn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL y',
  YEAR_MONTH_SHORT: 'LL.y',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  MONTH_DAY_SHORT: 'd.M.',
  MONTH_DAY_MEDIUM: 'MMMM d.',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d. y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d.',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'ccc, MMM d. y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d. \'tme\' H.mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale smn_FI.
 */
goog.i18n.DateTimePatterns_smn_FI = goog.i18n.DateTimePatterns_smn;


/**
 * Extended set of localized date/time patterns for locale sn.
 */
goog.i18n.DateTimePatterns_sn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sn_ZW.
 */
goog.i18n.DateTimePatterns_sn_ZW = goog.i18n.DateTimePatterns_sn;


/**
 * Extended set of localized date/time patterns for locale so.
 */
goog.i18n.DateTimePatterns_so = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale so_DJ.
 */
goog.i18n.DateTimePatterns_so_DJ = goog.i18n.DateTimePatterns_so;


/**
 * Extended set of localized date/time patterns for locale so_ET.
 */
goog.i18n.DateTimePatterns_so_ET = goog.i18n.DateTimePatterns_so;


/**
 * Extended set of localized date/time patterns for locale so_KE.
 */
goog.i18n.DateTimePatterns_so_KE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale so_SO.
 */
goog.i18n.DateTimePatterns_so_SO = goog.i18n.DateTimePatterns_so;


/**
 * Extended set of localized date/time patterns for locale sq_AL.
 */
goog.i18n.DateTimePatterns_sq_AL = goog.i18n.DateTimePatterns_sq;


/**
 * Extended set of localized date/time patterns for locale sq_MK.
 */
goog.i18n.DateTimePatterns_sq_MK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm, zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sq_XK.
 */
goog.i18n.DateTimePatterns_sq_XK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd.M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm, zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl.
 */
goog.i18n.DateTimePatterns_sr_Cyrl = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl_BA.
 */
goog.i18n.DateTimePatterns_sr_Cyrl_BA = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl_ME.
 */
goog.i18n.DateTimePatterns_sr_Cyrl_ME = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl_RS.
 */
goog.i18n.DateTimePatterns_sr_Cyrl_RS = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl_XK.
 */
goog.i18n.DateTimePatterns_sr_Cyrl_XK = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Latn_BA.
 */
goog.i18n.DateTimePatterns_sr_Latn_BA = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Latn_ME.
 */
goog.i18n.DateTimePatterns_sr_Latn_ME = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Latn_RS.
 */
goog.i18n.DateTimePatterns_sr_Latn_RS = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sr_Latn_XK.
 */
goog.i18n.DateTimePatterns_sr_Latn_XK = goog.i18n.DateTimePatterns_sr;


/**
 * Extended set of localized date/time patterns for locale sv_AX.
 */
goog.i18n.DateTimePatterns_sv_AX = goog.i18n.DateTimePatterns_sv;


/**
 * Extended set of localized date/time patterns for locale sv_FI.
 */
goog.i18n.DateTimePatterns_sv_FI = goog.i18n.DateTimePatterns_sv;


/**
 * Extended set of localized date/time patterns for locale sv_SE.
 */
goog.i18n.DateTimePatterns_sv_SE = goog.i18n.DateTimePatterns_sv;


/**
 * Extended set of localized date/time patterns for locale sw_CD.
 */
goog.i18n.DateTimePatterns_sw_CD = goog.i18n.DateTimePatterns_sw;


/**
 * Extended set of localized date/time patterns for locale sw_KE.
 */
goog.i18n.DateTimePatterns_sw_KE = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale sw_TZ.
 */
goog.i18n.DateTimePatterns_sw_TZ = goog.i18n.DateTimePatterns_sw;


/**
 * Extended set of localized date/time patterns for locale sw_UG.
 */
goog.i18n.DateTimePatterns_sw_UG = goog.i18n.DateTimePatterns_sw;


/**
 * Extended set of localized date/time patterns for locale ta_IN.
 */
goog.i18n.DateTimePatterns_ta_IN = goog.i18n.DateTimePatterns_ta;


/**
 * Extended set of localized date/time patterns for locale ta_LK.
 */
goog.i18n.DateTimePatterns_ta_LK = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ta_MY.
 */
goog.i18n.DateTimePatterns_ta_MY = goog.i18n.DateTimePatterns_ta;


/**
 * Extended set of localized date/time patterns for locale ta_SG.
 */
goog.i18n.DateTimePatterns_ta_SG = goog.i18n.DateTimePatterns_ta;


/**
 * Extended set of localized date/time patterns for locale te_IN.
 */
goog.i18n.DateTimePatterns_te_IN = goog.i18n.DateTimePatterns_te;


/**
 * Extended set of localized date/time patterns for locale teo.
 */
goog.i18n.DateTimePatterns_teo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale teo_KE.
 */
goog.i18n.DateTimePatterns_teo_KE = goog.i18n.DateTimePatterns_teo;


/**
 * Extended set of localized date/time patterns for locale teo_UG.
 */
goog.i18n.DateTimePatterns_teo_UG = goog.i18n.DateTimePatterns_teo;


/**
 * Extended set of localized date/time patterns for locale tg.
 */
goog.i18n.DateTimePatterns_tg = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale tg_TJ.
 */
goog.i18n.DateTimePatterns_tg_TJ = goog.i18n.DateTimePatterns_tg;


/**
 * Extended set of localized date/time patterns for locale th_TH.
 */
goog.i18n.DateTimePatterns_th_TH = goog.i18n.DateTimePatterns_th;


/**
 * Extended set of localized date/time patterns for locale ti.
 */
goog.i18n.DateTimePatterns_ti = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ti_ER.
 */
goog.i18n.DateTimePatterns_ti_ER = goog.i18n.DateTimePatterns_ti;


/**
 * Extended set of localized date/time patterns for locale ti_ET.
 */
goog.i18n.DateTimePatterns_ti_ET = goog.i18n.DateTimePatterns_ti;


/**
 * Extended set of localized date/time patterns for locale tk.
 */
goog.i18n.DateTimePatterns_tk = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'd MMM y EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale tk_TM.
 */
goog.i18n.DateTimePatterns_tk_TM = goog.i18n.DateTimePatterns_tk;


/**
 * Extended set of localized date/time patterns for locale to.
 */
goog.i18n.DateTimePatterns_to = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale to_TO.
 */
goog.i18n.DateTimePatterns_to_TO = goog.i18n.DateTimePatterns_to;


/**
 * Extended set of localized date/time patterns for locale tr_CY.
 */
goog.i18n.DateTimePatterns_tr_CY = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMMM EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'd MMM y EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM a h:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale tr_TR.
 */
goog.i18n.DateTimePatterns_tr_TR = goog.i18n.DateTimePatterns_tr;


/**
 * Extended set of localized date/time patterns for locale tt.
 */
goog.i18n.DateTimePatterns_tt = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y \'ел\'',
  YEAR_MONTH_ABBR: 'MMM, y \'ел\'',
  YEAR_MONTH_FULL: 'MMMM, y \'ел\'',
  YEAR_MONTH_SHORT: 'MM.y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd.MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y \'ел\'',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM, y \'ел\'',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale tt_RU.
 */
goog.i18n.DateTimePatterns_tt_RU = goog.i18n.DateTimePatterns_tt;


/**
 * Extended set of localized date/time patterns for locale twq.
 */
goog.i18n.DateTimePatterns_twq = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale twq_NE.
 */
goog.i18n.DateTimePatterns_twq_NE = goog.i18n.DateTimePatterns_twq;


/**
 * Extended set of localized date/time patterns for locale tzm.
 */
goog.i18n.DateTimePatterns_tzm = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale tzm_MA.
 */
goog.i18n.DateTimePatterns_tzm_MA = goog.i18n.DateTimePatterns_tzm;


/**
 * Extended set of localized date/time patterns for locale ug.
 */
goog.i18n.DateTimePatterns_ug = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd-MMM',
  MONTH_DAY_FULL: 'dd-MMMM',
  MONTH_DAY_SHORT: 'd-M',
  MONTH_DAY_MEDIUM: 'd-MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'y d-MMM',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd-MMM، EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y d-MMM، EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd-MMM، h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale ug_CN.
 */
goog.i18n.DateTimePatterns_ug_CN = goog.i18n.DateTimePatterns_ug;


/**
 * Extended set of localized date/time patterns for locale uk_UA.
 */
goog.i18n.DateTimePatterns_uk_UA = goog.i18n.DateTimePatterns_uk;


/**
 * Extended set of localized date/time patterns for locale ur_IN.
 */
goog.i18n.DateTimePatterns_ur_IN = goog.i18n.DateTimePatterns_ur;


/**
 * Extended set of localized date/time patterns for locale ur_PK.
 */
goog.i18n.DateTimePatterns_ur_PK = goog.i18n.DateTimePatterns_ur;


/**
 * Extended set of localized date/time patterns for locale uz_Arab.
 */
goog.i18n.DateTimePatterns_uz_Arab = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale uz_Arab_AF.
 */
goog.i18n.DateTimePatterns_uz_Arab_AF = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale uz_Cyrl.
 */
goog.i18n.DateTimePatterns_uz_Cyrl = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM, y',
  YEAR_MONTH_FULL: 'MMMM, y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d-MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale uz_Cyrl_UZ.
 */
goog.i18n.DateTimePatterns_uz_Cyrl_UZ = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM, y',
  YEAR_MONTH_FULL: 'MMMM, y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd/MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM, y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d-MMM, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm (zzzz)'
};


/**
 * Extended set of localized date/time patterns for locale uz_Latn.
 */
goog.i18n.DateTimePatterns_uz_Latn = goog.i18n.DateTimePatterns_uz;


/**
 * Extended set of localized date/time patterns for locale uz_Latn_UZ.
 */
goog.i18n.DateTimePatterns_uz_Latn_UZ = goog.i18n.DateTimePatterns_uz;


/**
 * Extended set of localized date/time patterns for locale vai.
 */
goog.i18n.DateTimePatterns_vai = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale vai_Latn.
 */
goog.i18n.DateTimePatterns_vai_Latn = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale vai_Latn_LR.
 */
goog.i18n.DateTimePatterns_vai_Latn_LR = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'MMM d y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d h:mm a zzzz'
};


/**
 * Extended set of localized date/time patterns for locale vai_Vaii.
 */
goog.i18n.DateTimePatterns_vai_Vaii = goog.i18n.DateTimePatterns_vai;


/**
 * Extended set of localized date/time patterns for locale vai_Vaii_LR.
 */
goog.i18n.DateTimePatterns_vai_Vaii_LR = goog.i18n.DateTimePatterns_vai;


/**
 * Extended set of localized date/time patterns for locale vi_VN.
 */
goog.i18n.DateTimePatterns_vi_VN = goog.i18n.DateTimePatterns_vi;


/**
 * Extended set of localized date/time patterns for locale vun.
 */
goog.i18n.DateTimePatterns_vun = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale vun_TZ.
 */
goog.i18n.DateTimePatterns_vun_TZ = goog.i18n.DateTimePatterns_vun;


/**
 * Extended set of localized date/time patterns for locale wae.
 */
goog.i18n.DateTimePatterns_wae = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd. MMM',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd. MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d. MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d. MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd. MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale wae_CH.
 */
goog.i18n.DateTimePatterns_wae_CH = goog.i18n.DateTimePatterns_wae;


/**
 * Extended set of localized date/time patterns for locale wo.
 */
goog.i18n.DateTimePatterns_wo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'y G',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM-y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'dd-MM',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM - HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale wo_SN.
 */
goog.i18n.DateTimePatterns_wo_SN = goog.i18n.DateTimePatterns_wo;


/**
 * Extended set of localized date/time patterns for locale xh.
 */
goog.i18n.DateTimePatterns_xh = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'y-MM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y MMM d, EEE',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale xh_ZA.
 */
goog.i18n.DateTimePatterns_xh_ZA = goog.i18n.DateTimePatterns_xh;


/**
 * Extended set of localized date/time patterns for locale xog.
 */
goog.i18n.DateTimePatterns_xog = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE, MMM d',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, MMM d, y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale xog_UG.
 */
goog.i18n.DateTimePatterns_xog_UG = goog.i18n.DateTimePatterns_xog;


/**
 * Extended set of localized date/time patterns for locale yav.
 */
goog.i18n.DateTimePatterns_yav = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale yav_CM.
 */
goog.i18n.DateTimePatterns_yav_CM = goog.i18n.DateTimePatterns_yav;


/**
 * Extended set of localized date/time patterns for locale yi.
 */
goog.i18n.DateTimePatterns_yi = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'MM-dd',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'dטן MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'MMM d, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, dטן MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'MMM d, HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale yi_001.
 */
goog.i18n.DateTimePatterns_yi_001 = goog.i18n.DateTimePatterns_yi;


/**
 * Extended set of localized date/time patterns for locale yo.
 */
goog.i18n.DateTimePatterns_yo = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'd MMMM',
  MONTH_DAY_YEAR_MEDIUM: 'd MMM y',
  WEEKDAY_MONTH_DAY_MEDIUM: 'd MMM, EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE, d MMM , y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale yo_BJ.
 */
goog.i18n.DateTimePatterns_yo_BJ = goog.i18n.DateTimePatterns_yo;


/**
 * Extended set of localized date/time patterns for locale yo_NG.
 */
goog.i18n.DateTimePatterns_yo_NG = goog.i18n.DateTimePatterns_yo;


/**
 * Extended set of localized date/time patterns for locale yue.
 */
goog.i18n.DateTimePatterns_yue = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y/MM',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日 EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日 EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 ah:mm [zzzz]'
};


/**
 * Extended set of localized date/time patterns for locale yue_Hans.
 */
goog.i18n.DateTimePatterns_yue_Hans = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y年M月',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 zzzz ah:mm'
};


/**
 * Extended set of localized date/time patterns for locale yue_Hans_CN.
 */
goog.i18n.DateTimePatterns_yue_Hans_CN = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y年M月',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 zzzz ah:mm'
};


/**
 * Extended set of localized date/time patterns for locale yue_Hant.
 */
goog.i18n.DateTimePatterns_yue_Hant = goog.i18n.DateTimePatterns_yue;


/**
 * Extended set of localized date/time patterns for locale yue_Hant_HK.
 */
goog.i18n.DateTimePatterns_yue_Hant_HK = goog.i18n.DateTimePatterns_yue;


/**
 * Extended set of localized date/time patterns for locale zgh.
 */
goog.i18n.DateTimePatterns_zgh = {
  YEAR_FULL: 'y',
  YEAR_FULL_WITH_ERA: 'G y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'y MMMM',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'MMMM dd',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'MMMM d',
  MONTH_DAY_YEAR_MEDIUM: 'y MMM d',
  WEEKDAY_MONTH_DAY_MEDIUM: 'EEE d MMM',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'EEE d MMM y',
  DAY_ABBR: 'd',
  MONTH_DAY_TIME_ZONE_SHORT: 'd MMM HH:mm zzzz'
};


/**
 * Extended set of localized date/time patterns for locale zgh_MA.
 */
goog.i18n.DateTimePatterns_zgh_MA = goog.i18n.DateTimePatterns_zgh;


/**
 * Extended set of localized date/time patterns for locale zh_Hans.
 */
goog.i18n.DateTimePatterns_zh_Hans = goog.i18n.DateTimePatterns_zh;


/**
 * Extended set of localized date/time patterns for locale zh_Hans_CN.
 */
goog.i18n.DateTimePatterns_zh_Hans_CN = goog.i18n.DateTimePatterns_zh;


/**
 * Extended set of localized date/time patterns for locale zh_Hans_HK.
 */
goog.i18n.DateTimePatterns_zh_Hans_HK = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月d日',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 zzzz ah:mm'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hans_MO.
 */
goog.i18n.DateTimePatterns_zh_Hans_MO = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y年M月',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月d日',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 zzzz ah:mm'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hans_SG.
 */
goog.i18n.DateTimePatterns_zh_Hans_SG = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y年M月',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月d日',
  MONTH_DAY_SHORT: 'M-d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 zzzz ah:mm'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant.
 */
goog.i18n.DateTimePatterns_zh_Hant = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y/MM',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日 EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日 EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 ah:mm [zzzz]'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant_HK.
 */
goog.i18n.DateTimePatterns_zh_Hant_HK = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 ah:mm [zzzz]'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant_MO.
 */
goog.i18n.DateTimePatterns_zh_Hant_MO = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'MM/y',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'd/M',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 ah:mm [zzzz]'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant_TW.
 */
goog.i18n.DateTimePatterns_zh_Hant_TW = {
  YEAR_FULL: 'y年',
  YEAR_FULL_WITH_ERA: 'Gy年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'y年M月',
  YEAR_MONTH_SHORT: 'y/MM',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  MONTH_DAY_SHORT: 'M/d',
  MONTH_DAY_MEDIUM: 'M月d日',
  MONTH_DAY_YEAR_MEDIUM: 'y年M月d日',
  WEEKDAY_MONTH_DAY_MEDIUM: 'M月d日 EEE',
  WEEKDAY_MONTH_DAY_YEAR_MEDIUM: 'y年M月d日 EEE',
  DAY_ABBR: 'd日',
  MONTH_DAY_TIME_ZONE_SHORT: 'M月d日 ah:mm [zzzz]'
};


/**
 * Extended set of localized date/time patterns for locale zu_ZA.
 */
goog.i18n.DateTimePatterns_zu_ZA = goog.i18n.DateTimePatterns_zu;


/**
 * Select date/time pattern by locale.
 */
switch (goog.LOCALE) {
  case 'af_NA':
  case 'af-NA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_af_NA;
    break;
  case 'af_ZA':
  case 'af-ZA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_af_ZA;
    break;
  case 'agq':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_agq;
    break;
  case 'agq_CM':
  case 'agq-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_agq_CM;
    break;
  case 'ak':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ak;
    break;
  case 'ak_GH':
  case 'ak-GH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ak_GH;
    break;
  case 'am_ET':
  case 'am-ET':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_am_ET;
    break;
  case 'ar_001':
  case 'ar-001':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_001;
    break;
  case 'ar_AE':
  case 'ar-AE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_AE;
    break;
  case 'ar_BH':
  case 'ar-BH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_BH;
    break;
  case 'ar_DJ':
  case 'ar-DJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_DJ;
    break;
  case 'ar_EH':
  case 'ar-EH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_EH;
    break;
  case 'ar_ER':
  case 'ar-ER':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_ER;
    break;
  case 'ar_IL':
  case 'ar-IL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_IL;
    break;
  case 'ar_IQ':
  case 'ar-IQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_IQ;
    break;
  case 'ar_JO':
  case 'ar-JO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_JO;
    break;
  case 'ar_KM':
  case 'ar-KM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_KM;
    break;
  case 'ar_KW':
  case 'ar-KW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_KW;
    break;
  case 'ar_LB':
  case 'ar-LB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_LB;
    break;
  case 'ar_LY':
  case 'ar-LY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_LY;
    break;
  case 'ar_MA':
  case 'ar-MA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_MA;
    break;
  case 'ar_MR':
  case 'ar-MR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_MR;
    break;
  case 'ar_OM':
  case 'ar-OM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_OM;
    break;
  case 'ar_PS':
  case 'ar-PS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_PS;
    break;
  case 'ar_QA':
  case 'ar-QA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_QA;
    break;
  case 'ar_SA':
  case 'ar-SA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SA;
    break;
  case 'ar_SD':
  case 'ar-SD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SD;
    break;
  case 'ar_SO':
  case 'ar-SO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SO;
    break;
  case 'ar_SS':
  case 'ar-SS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SS;
    break;
  case 'ar_SY':
  case 'ar-SY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SY;
    break;
  case 'ar_TD':
  case 'ar-TD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_TD;
    break;
  case 'ar_TN':
  case 'ar-TN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_TN;
    break;
  case 'ar_XB':
  case 'ar-XB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_XB;
    break;
  case 'ar_YE':
  case 'ar-YE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_YE;
    break;
  case 'as':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_as;
    break;
  case 'as_IN':
  case 'as-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_as_IN;
    break;
  case 'asa':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_asa;
    break;
  case 'asa_TZ':
  case 'asa-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_asa_TZ;
    break;
  case 'ast':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ast;
    break;
  case 'ast_ES':
  case 'ast-ES':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ast_ES;
    break;
  case 'az_Cyrl':
  case 'az-Cyrl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Cyrl;
    break;
  case 'az_Cyrl_AZ':
  case 'az-Cyrl-AZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Cyrl_AZ;
    break;
  case 'az_Latn':
  case 'az-Latn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Latn;
    break;
  case 'az_Latn_AZ':
  case 'az-Latn-AZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Latn_AZ;
    break;
  case 'bas':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bas;
    break;
  case 'bas_CM':
  case 'bas-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bas_CM;
    break;
  case 'be_BY':
  case 'be-BY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_be_BY;
    break;
  case 'bem':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bem;
    break;
  case 'bem_ZM':
  case 'bem-ZM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bem_ZM;
    break;
  case 'bez':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bez;
    break;
  case 'bez_TZ':
  case 'bez-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bez_TZ;
    break;
  case 'bg_BG':
  case 'bg-BG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bg_BG;
    break;
  case 'bm':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bm;
    break;
  case 'bm_ML':
  case 'bm-ML':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bm_ML;
    break;
  case 'bn_BD':
  case 'bn-BD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bn_BD;
    break;
  case 'bn_IN':
  case 'bn-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bn_IN;
    break;
  case 'bo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bo;
    break;
  case 'bo_CN':
  case 'bo-CN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bo_CN;
    break;
  case 'bo_IN':
  case 'bo-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bo_IN;
    break;
  case 'br_FR':
  case 'br-FR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_br_FR;
    break;
  case 'brx':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_brx;
    break;
  case 'brx_IN':
  case 'brx-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_brx_IN;
    break;
  case 'bs_Cyrl':
  case 'bs-Cyrl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bs_Cyrl;
    break;
  case 'bs_Cyrl_BA':
  case 'bs-Cyrl-BA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bs_Cyrl_BA;
    break;
  case 'bs_Latn':
  case 'bs-Latn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bs_Latn;
    break;
  case 'bs_Latn_BA':
  case 'bs-Latn-BA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bs_Latn_BA;
    break;
  case 'ca_AD':
  case 'ca-AD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ca_AD;
    break;
  case 'ca_ES':
  case 'ca-ES':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ca_ES;
    break;
  case 'ca_FR':
  case 'ca-FR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ca_FR;
    break;
  case 'ca_IT':
  case 'ca-IT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ca_IT;
    break;
  case 'ccp':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ccp;
    break;
  case 'ccp_BD':
  case 'ccp-BD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ccp_BD;
    break;
  case 'ccp_IN':
  case 'ccp-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ccp_IN;
    break;
  case 'ce':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ce;
    break;
  case 'ce_RU':
  case 'ce-RU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ce_RU;
    break;
  case 'ceb':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ceb;
    break;
  case 'ceb_PH':
  case 'ceb-PH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ceb_PH;
    break;
  case 'cgg':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cgg;
    break;
  case 'cgg_UG':
  case 'cgg-UG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cgg_UG;
    break;
  case 'chr_US':
  case 'chr-US':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_chr_US;
    break;
  case 'ckb':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ckb;
    break;
  case 'ckb_IQ':
  case 'ckb-IQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ckb_IQ;
    break;
  case 'ckb_IR':
  case 'ckb-IR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ckb_IR;
    break;
  case 'cs_CZ':
  case 'cs-CZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cs_CZ;
    break;
  case 'cy_GB':
  case 'cy-GB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cy_GB;
    break;
  case 'da_DK':
  case 'da-DK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_da_DK;
    break;
  case 'da_GL':
  case 'da-GL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_da_GL;
    break;
  case 'dav':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dav;
    break;
  case 'dav_KE':
  case 'dav-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dav_KE;
    break;
  case 'de_BE':
  case 'de-BE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_BE;
    break;
  case 'de_DE':
  case 'de-DE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_DE;
    break;
  case 'de_IT':
  case 'de-IT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_IT;
    break;
  case 'de_LI':
  case 'de-LI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_LI;
    break;
  case 'de_LU':
  case 'de-LU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_LU;
    break;
  case 'dje':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dje;
    break;
  case 'dje_NE':
  case 'dje-NE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dje_NE;
    break;
  case 'dsb':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dsb;
    break;
  case 'dsb_DE':
  case 'dsb-DE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dsb_DE;
    break;
  case 'dua':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dua;
    break;
  case 'dua_CM':
  case 'dua-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dua_CM;
    break;
  case 'dyo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dyo;
    break;
  case 'dyo_SN':
  case 'dyo-SN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dyo_SN;
    break;
  case 'dz':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dz;
    break;
  case 'dz_BT':
  case 'dz-BT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dz_BT;
    break;
  case 'ebu':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ebu;
    break;
  case 'ebu_KE':
  case 'ebu-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ebu_KE;
    break;
  case 'ee':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ee;
    break;
  case 'ee_GH':
  case 'ee-GH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ee_GH;
    break;
  case 'ee_TG':
  case 'ee-TG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ee_TG;
    break;
  case 'el_CY':
  case 'el-CY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_el_CY;
    break;
  case 'el_GR':
  case 'el-GR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_el_GR;
    break;
  case 'en_001':
  case 'en-001':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_001;
    break;
  case 'en_150':
  case 'en-150':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_150;
    break;
  case 'en_AE':
  case 'en-AE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_AE;
    break;
  case 'en_AG':
  case 'en-AG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_AG;
    break;
  case 'en_AI':
  case 'en-AI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_AI;
    break;
  case 'en_AS':
  case 'en-AS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_AS;
    break;
  case 'en_AT':
  case 'en-AT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_AT;
    break;
  case 'en_BB':
  case 'en-BB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BB;
    break;
  case 'en_BE':
  case 'en-BE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BE;
    break;
  case 'en_BI':
  case 'en-BI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BI;
    break;
  case 'en_BM':
  case 'en-BM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BM;
    break;
  case 'en_BS':
  case 'en-BS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BS;
    break;
  case 'en_BW':
  case 'en-BW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BW;
    break;
  case 'en_BZ':
  case 'en-BZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BZ;
    break;
  case 'en_CC':
  case 'en-CC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CC;
    break;
  case 'en_CH':
  case 'en-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CH;
    break;
  case 'en_CK':
  case 'en-CK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CK;
    break;
  case 'en_CM':
  case 'en-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CM;
    break;
  case 'en_CX':
  case 'en-CX':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CX;
    break;
  case 'en_CY':
  case 'en-CY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CY;
    break;
  case 'en_DE':
  case 'en-DE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_DE;
    break;
  case 'en_DG':
  case 'en-DG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_DG;
    break;
  case 'en_DK':
  case 'en-DK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_DK;
    break;
  case 'en_DM':
  case 'en-DM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_DM;
    break;
  case 'en_ER':
  case 'en-ER':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_ER;
    break;
  case 'en_FI':
  case 'en-FI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_FI;
    break;
  case 'en_FJ':
  case 'en-FJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_FJ;
    break;
  case 'en_FK':
  case 'en-FK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_FK;
    break;
  case 'en_FM':
  case 'en-FM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_FM;
    break;
  case 'en_GD':
  case 'en-GD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GD;
    break;
  case 'en_GG':
  case 'en-GG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GG;
    break;
  case 'en_GH':
  case 'en-GH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GH;
    break;
  case 'en_GI':
  case 'en-GI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GI;
    break;
  case 'en_GM':
  case 'en-GM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GM;
    break;
  case 'en_GU':
  case 'en-GU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GU;
    break;
  case 'en_GY':
  case 'en-GY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_GY;
    break;
  case 'en_HK':
  case 'en-HK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_HK;
    break;
  case 'en_IL':
  case 'en-IL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_IL;
    break;
  case 'en_IM':
  case 'en-IM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_IM;
    break;
  case 'en_IO':
  case 'en-IO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_IO;
    break;
  case 'en_JE':
  case 'en-JE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_JE;
    break;
  case 'en_JM':
  case 'en-JM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_JM;
    break;
  case 'en_KE':
  case 'en-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_KE;
    break;
  case 'en_KI':
  case 'en-KI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_KI;
    break;
  case 'en_KN':
  case 'en-KN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_KN;
    break;
  case 'en_KY':
  case 'en-KY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_KY;
    break;
  case 'en_LC':
  case 'en-LC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_LC;
    break;
  case 'en_LR':
  case 'en-LR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_LR;
    break;
  case 'en_LS':
  case 'en-LS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_LS;
    break;
  case 'en_MG':
  case 'en-MG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MG;
    break;
  case 'en_MH':
  case 'en-MH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MH;
    break;
  case 'en_MO':
  case 'en-MO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MO;
    break;
  case 'en_MP':
  case 'en-MP':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MP;
    break;
  case 'en_MS':
  case 'en-MS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MS;
    break;
  case 'en_MT':
  case 'en-MT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MT;
    break;
  case 'en_MU':
  case 'en-MU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MU;
    break;
  case 'en_MW':
  case 'en-MW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MW;
    break;
  case 'en_MY':
  case 'en-MY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MY;
    break;
  case 'en_NA':
  case 'en-NA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NA;
    break;
  case 'en_NF':
  case 'en-NF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NF;
    break;
  case 'en_NG':
  case 'en-NG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NG;
    break;
  case 'en_NL':
  case 'en-NL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NL;
    break;
  case 'en_NR':
  case 'en-NR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NR;
    break;
  case 'en_NU':
  case 'en-NU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NU;
    break;
  case 'en_NZ':
  case 'en-NZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NZ;
    break;
  case 'en_PG':
  case 'en-PG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PG;
    break;
  case 'en_PH':
  case 'en-PH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PH;
    break;
  case 'en_PK':
  case 'en-PK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PK;
    break;
  case 'en_PN':
  case 'en-PN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PN;
    break;
  case 'en_PR':
  case 'en-PR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PR;
    break;
  case 'en_PW':
  case 'en-PW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PW;
    break;
  case 'en_RW':
  case 'en-RW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_RW;
    break;
  case 'en_SB':
  case 'en-SB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SB;
    break;
  case 'en_SC':
  case 'en-SC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SC;
    break;
  case 'en_SD':
  case 'en-SD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SD;
    break;
  case 'en_SE':
  case 'en-SE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SE;
    break;
  case 'en_SH':
  case 'en-SH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SH;
    break;
  case 'en_SI':
  case 'en-SI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SI;
    break;
  case 'en_SL':
  case 'en-SL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SL;
    break;
  case 'en_SS':
  case 'en-SS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SS;
    break;
  case 'en_SX':
  case 'en-SX':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SX;
    break;
  case 'en_SZ':
  case 'en-SZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_SZ;
    break;
  case 'en_TC':
  case 'en-TC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_TC;
    break;
  case 'en_TK':
  case 'en-TK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_TK;
    break;
  case 'en_TO':
  case 'en-TO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_TO;
    break;
  case 'en_TT':
  case 'en-TT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_TT;
    break;
  case 'en_TV':
  case 'en-TV':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_TV;
    break;
  case 'en_TZ':
  case 'en-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_TZ;
    break;
  case 'en_UG':
  case 'en-UG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_UG;
    break;
  case 'en_UM':
  case 'en-UM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_UM;
    break;
  case 'en_US_POSIX':
  case 'en-US-POSIX':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_US_POSIX;
    break;
  case 'en_VC':
  case 'en-VC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_VC;
    break;
  case 'en_VG':
  case 'en-VG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_VG;
    break;
  case 'en_VI':
  case 'en-VI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_VI;
    break;
  case 'en_VU':
  case 'en-VU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_VU;
    break;
  case 'en_WS':
  case 'en-WS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_WS;
    break;
  case 'en_XA':
  case 'en-XA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_XA;
    break;
  case 'en_ZM':
  case 'en-ZM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_ZM;
    break;
  case 'en_ZW':
  case 'en-ZW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_ZW;
    break;
  case 'eo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_eo;
    break;
  case 'eo_001':
  case 'eo-001':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_eo_001;
    break;
  case 'es_AR':
  case 'es-AR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_AR;
    break;
  case 'es_BO':
  case 'es-BO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_BO;
    break;
  case 'es_BR':
  case 'es-BR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_BR;
    break;
  case 'es_BZ':
  case 'es-BZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_BZ;
    break;
  case 'es_CL':
  case 'es-CL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_CL;
    break;
  case 'es_CO':
  case 'es-CO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_CO;
    break;
  case 'es_CR':
  case 'es-CR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_CR;
    break;
  case 'es_CU':
  case 'es-CU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_CU;
    break;
  case 'es_DO':
  case 'es-DO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_DO;
    break;
  case 'es_EA':
  case 'es-EA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_EA;
    break;
  case 'es_EC':
  case 'es-EC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_EC;
    break;
  case 'es_GQ':
  case 'es-GQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_GQ;
    break;
  case 'es_GT':
  case 'es-GT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_GT;
    break;
  case 'es_HN':
  case 'es-HN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_HN;
    break;
  case 'es_IC':
  case 'es-IC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_IC;
    break;
  case 'es_NI':
  case 'es-NI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_NI;
    break;
  case 'es_PA':
  case 'es-PA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PA;
    break;
  case 'es_PE':
  case 'es-PE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PE;
    break;
  case 'es_PH':
  case 'es-PH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PH;
    break;
  case 'es_PR':
  case 'es-PR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PR;
    break;
  case 'es_PY':
  case 'es-PY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PY;
    break;
  case 'es_SV':
  case 'es-SV':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_SV;
    break;
  case 'es_UY':
  case 'es-UY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_UY;
    break;
  case 'es_VE':
  case 'es-VE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_VE;
    break;
  case 'et_EE':
  case 'et-EE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_et_EE;
    break;
  case 'eu_ES':
  case 'eu-ES':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_eu_ES;
    break;
  case 'ewo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ewo;
    break;
  case 'ewo_CM':
  case 'ewo-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ewo_CM;
    break;
  case 'fa_AF':
  case 'fa-AF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fa_AF;
    break;
  case 'fa_IR':
  case 'fa-IR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fa_IR;
    break;
  case 'ff':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff;
    break;
  case 'ff_Latn':
  case 'ff-Latn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn;
    break;
  case 'ff_Latn_BF':
  case 'ff-Latn-BF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_BF;
    break;
  case 'ff_Latn_CM':
  case 'ff-Latn-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_CM;
    break;
  case 'ff_Latn_GH':
  case 'ff-Latn-GH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_GH;
    break;
  case 'ff_Latn_GM':
  case 'ff-Latn-GM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_GM;
    break;
  case 'ff_Latn_GN':
  case 'ff-Latn-GN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_GN;
    break;
  case 'ff_Latn_GW':
  case 'ff-Latn-GW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_GW;
    break;
  case 'ff_Latn_LR':
  case 'ff-Latn-LR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_LR;
    break;
  case 'ff_Latn_MR':
  case 'ff-Latn-MR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_MR;
    break;
  case 'ff_Latn_NE':
  case 'ff-Latn-NE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_NE;
    break;
  case 'ff_Latn_NG':
  case 'ff-Latn-NG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_NG;
    break;
  case 'ff_Latn_SL':
  case 'ff-Latn-SL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_SL;
    break;
  case 'ff_Latn_SN':
  case 'ff-Latn-SN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_Latn_SN;
    break;
  case 'fi_FI':
  case 'fi-FI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fi_FI;
    break;
  case 'fil_PH':
  case 'fil-PH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fil_PH;
    break;
  case 'fo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fo;
    break;
  case 'fo_DK':
  case 'fo-DK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fo_DK;
    break;
  case 'fo_FO':
  case 'fo-FO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fo_FO;
    break;
  case 'fr_BE':
  case 'fr-BE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_BE;
    break;
  case 'fr_BF':
  case 'fr-BF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_BF;
    break;
  case 'fr_BI':
  case 'fr-BI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_BI;
    break;
  case 'fr_BJ':
  case 'fr-BJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_BJ;
    break;
  case 'fr_BL':
  case 'fr-BL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_BL;
    break;
  case 'fr_CD':
  case 'fr-CD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CD;
    break;
  case 'fr_CF':
  case 'fr-CF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CF;
    break;
  case 'fr_CG':
  case 'fr-CG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CG;
    break;
  case 'fr_CH':
  case 'fr-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CH;
    break;
  case 'fr_CI':
  case 'fr-CI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CI;
    break;
  case 'fr_CM':
  case 'fr-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CM;
    break;
  case 'fr_DJ':
  case 'fr-DJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_DJ;
    break;
  case 'fr_DZ':
  case 'fr-DZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_DZ;
    break;
  case 'fr_FR':
  case 'fr-FR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_FR;
    break;
  case 'fr_GA':
  case 'fr-GA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_GA;
    break;
  case 'fr_GF':
  case 'fr-GF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_GF;
    break;
  case 'fr_GN':
  case 'fr-GN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_GN;
    break;
  case 'fr_GP':
  case 'fr-GP':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_GP;
    break;
  case 'fr_GQ':
  case 'fr-GQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_GQ;
    break;
  case 'fr_HT':
  case 'fr-HT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_HT;
    break;
  case 'fr_KM':
  case 'fr-KM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_KM;
    break;
  case 'fr_LU':
  case 'fr-LU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_LU;
    break;
  case 'fr_MA':
  case 'fr-MA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MA;
    break;
  case 'fr_MC':
  case 'fr-MC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MC;
    break;
  case 'fr_MF':
  case 'fr-MF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MF;
    break;
  case 'fr_MG':
  case 'fr-MG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MG;
    break;
  case 'fr_ML':
  case 'fr-ML':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_ML;
    break;
  case 'fr_MQ':
  case 'fr-MQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MQ;
    break;
  case 'fr_MR':
  case 'fr-MR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MR;
    break;
  case 'fr_MU':
  case 'fr-MU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MU;
    break;
  case 'fr_NC':
  case 'fr-NC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_NC;
    break;
  case 'fr_NE':
  case 'fr-NE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_NE;
    break;
  case 'fr_PF':
  case 'fr-PF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_PF;
    break;
  case 'fr_PM':
  case 'fr-PM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_PM;
    break;
  case 'fr_RE':
  case 'fr-RE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_RE;
    break;
  case 'fr_RW':
  case 'fr-RW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_RW;
    break;
  case 'fr_SC':
  case 'fr-SC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_SC;
    break;
  case 'fr_SN':
  case 'fr-SN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_SN;
    break;
  case 'fr_SY':
  case 'fr-SY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_SY;
    break;
  case 'fr_TD':
  case 'fr-TD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_TD;
    break;
  case 'fr_TG':
  case 'fr-TG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_TG;
    break;
  case 'fr_TN':
  case 'fr-TN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_TN;
    break;
  case 'fr_VU':
  case 'fr-VU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_VU;
    break;
  case 'fr_WF':
  case 'fr-WF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_WF;
    break;
  case 'fr_YT':
  case 'fr-YT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_YT;
    break;
  case 'fur':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fur;
    break;
  case 'fur_IT':
  case 'fur-IT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fur_IT;
    break;
  case 'fy':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fy;
    break;
  case 'fy_NL':
  case 'fy-NL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fy_NL;
    break;
  case 'ga_IE':
  case 'ga-IE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ga_IE;
    break;
  case 'gd':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gd;
    break;
  case 'gd_GB':
  case 'gd-GB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gd_GB;
    break;
  case 'gl_ES':
  case 'gl-ES':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gl_ES;
    break;
  case 'gsw_CH':
  case 'gsw-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gsw_CH;
    break;
  case 'gsw_FR':
  case 'gsw-FR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gsw_FR;
    break;
  case 'gsw_LI':
  case 'gsw-LI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gsw_LI;
    break;
  case 'gu_IN':
  case 'gu-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gu_IN;
    break;
  case 'guz':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_guz;
    break;
  case 'guz_KE':
  case 'guz-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_guz_KE;
    break;
  case 'gv':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gv;
    break;
  case 'gv_IM':
  case 'gv-IM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gv_IM;
    break;
  case 'ha':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha;
    break;
  case 'ha_GH':
  case 'ha-GH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha_GH;
    break;
  case 'ha_NE':
  case 'ha-NE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha_NE;
    break;
  case 'ha_NG':
  case 'ha-NG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha_NG;
    break;
  case 'haw_US':
  case 'haw-US':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_haw_US;
    break;
  case 'he_IL':
  case 'he-IL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_he_IL;
    break;
  case 'hi_IN':
  case 'hi-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hi_IN;
    break;
  case 'hr_BA':
  case 'hr-BA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hr_BA;
    break;
  case 'hr_HR':
  case 'hr-HR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hr_HR;
    break;
  case 'hsb':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hsb;
    break;
  case 'hsb_DE':
  case 'hsb-DE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hsb_DE;
    break;
  case 'hu_HU':
  case 'hu-HU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hu_HU;
    break;
  case 'hy_AM':
  case 'hy-AM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hy_AM;
    break;
  case 'ia':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ia;
    break;
  case 'ia_001':
  case 'ia-001':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ia_001;
    break;
  case 'id_ID':
  case 'id-ID':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_id_ID;
    break;
  case 'ig':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ig;
    break;
  case 'ig_NG':
  case 'ig-NG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ig_NG;
    break;
  case 'ii':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ii;
    break;
  case 'ii_CN':
  case 'ii-CN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ii_CN;
    break;
  case 'is_IS':
  case 'is-IS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_is_IS;
    break;
  case 'it_CH':
  case 'it-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_it_CH;
    break;
  case 'it_IT':
  case 'it-IT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_it_IT;
    break;
  case 'it_SM':
  case 'it-SM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_it_SM;
    break;
  case 'it_VA':
  case 'it-VA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_it_VA;
    break;
  case 'ja_JP':
  case 'ja-JP':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ja_JP;
    break;
  case 'jgo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jgo;
    break;
  case 'jgo_CM':
  case 'jgo-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jgo_CM;
    break;
  case 'jmc':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jmc;
    break;
  case 'jmc_TZ':
  case 'jmc-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jmc_TZ;
    break;
  case 'jv':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jv;
    break;
  case 'jv_ID':
  case 'jv-ID':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jv_ID;
    break;
  case 'ka_GE':
  case 'ka-GE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ka_GE;
    break;
  case 'kab':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kab;
    break;
  case 'kab_DZ':
  case 'kab-DZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kab_DZ;
    break;
  case 'kam':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kam;
    break;
  case 'kam_KE':
  case 'kam-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kam_KE;
    break;
  case 'kde':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kde;
    break;
  case 'kde_TZ':
  case 'kde-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kde_TZ;
    break;
  case 'kea':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kea;
    break;
  case 'kea_CV':
  case 'kea-CV':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kea_CV;
    break;
  case 'khq':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_khq;
    break;
  case 'khq_ML':
  case 'khq-ML':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_khq_ML;
    break;
  case 'ki':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ki;
    break;
  case 'ki_KE':
  case 'ki-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ki_KE;
    break;
  case 'kk_KZ':
  case 'kk-KZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kk_KZ;
    break;
  case 'kkj':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kkj;
    break;
  case 'kkj_CM':
  case 'kkj-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kkj_CM;
    break;
  case 'kl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kl;
    break;
  case 'kl_GL':
  case 'kl-GL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kl_GL;
    break;
  case 'kln':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kln;
    break;
  case 'kln_KE':
  case 'kln-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kln_KE;
    break;
  case 'km_KH':
  case 'km-KH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_km_KH;
    break;
  case 'kn_IN':
  case 'kn-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kn_IN;
    break;
  case 'ko_KP':
  case 'ko-KP':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ko_KP;
    break;
  case 'ko_KR':
  case 'ko-KR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ko_KR;
    break;
  case 'kok':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kok;
    break;
  case 'kok_IN':
  case 'kok-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kok_IN;
    break;
  case 'ks':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ks;
    break;
  case 'ks_IN':
  case 'ks-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ks_IN;
    break;
  case 'ksb':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ksb;
    break;
  case 'ksb_TZ':
  case 'ksb-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ksb_TZ;
    break;
  case 'ksf':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ksf;
    break;
  case 'ksf_CM':
  case 'ksf-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ksf_CM;
    break;
  case 'ksh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ksh;
    break;
  case 'ksh_DE':
  case 'ksh-DE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ksh_DE;
    break;
  case 'ku':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ku;
    break;
  case 'ku_TR':
  case 'ku-TR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ku_TR;
    break;
  case 'kw':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kw;
    break;
  case 'kw_GB':
  case 'kw-GB':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kw_GB;
    break;
  case 'ky_KG':
  case 'ky-KG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ky_KG;
    break;
  case 'lag':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lag;
    break;
  case 'lag_TZ':
  case 'lag-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lag_TZ;
    break;
  case 'lb':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lb;
    break;
  case 'lb_LU':
  case 'lb-LU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lb_LU;
    break;
  case 'lg':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lg;
    break;
  case 'lg_UG':
  case 'lg-UG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lg_UG;
    break;
  case 'lkt':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lkt;
    break;
  case 'lkt_US':
  case 'lkt-US':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lkt_US;
    break;
  case 'ln_AO':
  case 'ln-AO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ln_AO;
    break;
  case 'ln_CD':
  case 'ln-CD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ln_CD;
    break;
  case 'ln_CF':
  case 'ln-CF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ln_CF;
    break;
  case 'ln_CG':
  case 'ln-CG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ln_CG;
    break;
  case 'lo_LA':
  case 'lo-LA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lo_LA;
    break;
  case 'lrc':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lrc;
    break;
  case 'lrc_IQ':
  case 'lrc-IQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lrc_IQ;
    break;
  case 'lrc_IR':
  case 'lrc-IR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lrc_IR;
    break;
  case 'lt_LT':
  case 'lt-LT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lt_LT;
    break;
  case 'lu':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lu;
    break;
  case 'lu_CD':
  case 'lu-CD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lu_CD;
    break;
  case 'luo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luo;
    break;
  case 'luo_KE':
  case 'luo-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luo_KE;
    break;
  case 'luy':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luy;
    break;
  case 'luy_KE':
  case 'luy-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luy_KE;
    break;
  case 'lv_LV':
  case 'lv-LV':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lv_LV;
    break;
  case 'mas':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mas;
    break;
  case 'mas_KE':
  case 'mas-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mas_KE;
    break;
  case 'mas_TZ':
  case 'mas-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mas_TZ;
    break;
  case 'mer':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mer;
    break;
  case 'mer_KE':
  case 'mer-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mer_KE;
    break;
  case 'mfe':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mfe;
    break;
  case 'mfe_MU':
  case 'mfe-MU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mfe_MU;
    break;
  case 'mg':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mg;
    break;
  case 'mg_MG':
  case 'mg-MG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mg_MG;
    break;
  case 'mgh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mgh;
    break;
  case 'mgh_MZ':
  case 'mgh-MZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mgh_MZ;
    break;
  case 'mgo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mgo;
    break;
  case 'mgo_CM':
  case 'mgo-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mgo_CM;
    break;
  case 'mi':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mi;
    break;
  case 'mi_NZ':
  case 'mi-NZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mi_NZ;
    break;
  case 'mk_MK':
  case 'mk-MK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mk_MK;
    break;
  case 'ml_IN':
  case 'ml-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ml_IN;
    break;
  case 'mn_MN':
  case 'mn-MN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mn_MN;
    break;
  case 'mr_IN':
  case 'mr-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mr_IN;
    break;
  case 'ms_BN':
  case 'ms-BN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ms_BN;
    break;
  case 'ms_MY':
  case 'ms-MY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ms_MY;
    break;
  case 'ms_SG':
  case 'ms-SG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ms_SG;
    break;
  case 'mt_MT':
  case 'mt-MT':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mt_MT;
    break;
  case 'mua':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mua;
    break;
  case 'mua_CM':
  case 'mua-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mua_CM;
    break;
  case 'my_MM':
  case 'my-MM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_my_MM;
    break;
  case 'mzn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mzn;
    break;
  case 'mzn_IR':
  case 'mzn-IR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mzn_IR;
    break;
  case 'naq':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_naq;
    break;
  case 'naq_NA':
  case 'naq-NA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_naq_NA;
    break;
  case 'nb_NO':
  case 'nb-NO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nb_NO;
    break;
  case 'nb_SJ':
  case 'nb-SJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nb_SJ;
    break;
  case 'nd':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nd;
    break;
  case 'nd_ZW':
  case 'nd-ZW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nd_ZW;
    break;
  case 'nds':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nds;
    break;
  case 'nds_DE':
  case 'nds-DE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nds_DE;
    break;
  case 'nds_NL':
  case 'nds-NL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nds_NL;
    break;
  case 'ne_IN':
  case 'ne-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ne_IN;
    break;
  case 'ne_NP':
  case 'ne-NP':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ne_NP;
    break;
  case 'nl_AW':
  case 'nl-AW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_AW;
    break;
  case 'nl_BE':
  case 'nl-BE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_BE;
    break;
  case 'nl_BQ':
  case 'nl-BQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_BQ;
    break;
  case 'nl_CW':
  case 'nl-CW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_CW;
    break;
  case 'nl_NL':
  case 'nl-NL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_NL;
    break;
  case 'nl_SR':
  case 'nl-SR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_SR;
    break;
  case 'nl_SX':
  case 'nl-SX':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_SX;
    break;
  case 'nmg':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nmg;
    break;
  case 'nmg_CM':
  case 'nmg-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nmg_CM;
    break;
  case 'nn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nn;
    break;
  case 'nn_NO':
  case 'nn-NO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nn_NO;
    break;
  case 'nnh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nnh;
    break;
  case 'nnh_CM':
  case 'nnh-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nnh_CM;
    break;
  case 'nus':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nus;
    break;
  case 'nus_SS':
  case 'nus-SS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nus_SS;
    break;
  case 'nyn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nyn;
    break;
  case 'nyn_UG':
  case 'nyn-UG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nyn_UG;
    break;
  case 'om':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_om;
    break;
  case 'om_ET':
  case 'om-ET':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_om_ET;
    break;
  case 'om_KE':
  case 'om-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_om_KE;
    break;
  case 'or_IN':
  case 'or-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_or_IN;
    break;
  case 'os':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_os;
    break;
  case 'os_GE':
  case 'os-GE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_os_GE;
    break;
  case 'os_RU':
  case 'os-RU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_os_RU;
    break;
  case 'pa_Arab':
  case 'pa-Arab':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Arab;
    break;
  case 'pa_Arab_PK':
  case 'pa-Arab-PK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Arab_PK;
    break;
  case 'pa_Guru':
  case 'pa-Guru':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Guru;
    break;
  case 'pa_Guru_IN':
  case 'pa-Guru-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Guru_IN;
    break;
  case 'pl_PL':
  case 'pl-PL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pl_PL;
    break;
  case 'ps':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ps;
    break;
  case 'ps_AF':
  case 'ps-AF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ps_AF;
    break;
  case 'ps_PK':
  case 'ps-PK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ps_PK;
    break;
  case 'pt_AO':
  case 'pt-AO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_AO;
    break;
  case 'pt_CH':
  case 'pt-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_CH;
    break;
  case 'pt_CV':
  case 'pt-CV':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_CV;
    break;
  case 'pt_GQ':
  case 'pt-GQ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_GQ;
    break;
  case 'pt_GW':
  case 'pt-GW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_GW;
    break;
  case 'pt_LU':
  case 'pt-LU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_LU;
    break;
  case 'pt_MO':
  case 'pt-MO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_MO;
    break;
  case 'pt_MZ':
  case 'pt-MZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_MZ;
    break;
  case 'pt_ST':
  case 'pt-ST':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_ST;
    break;
  case 'pt_TL':
  case 'pt-TL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_TL;
    break;
  case 'qu':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_qu;
    break;
  case 'qu_BO':
  case 'qu-BO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_qu_BO;
    break;
  case 'qu_EC':
  case 'qu-EC':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_qu_EC;
    break;
  case 'qu_PE':
  case 'qu-PE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_qu_PE;
    break;
  case 'rm':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rm;
    break;
  case 'rm_CH':
  case 'rm-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rm_CH;
    break;
  case 'rn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rn;
    break;
  case 'rn_BI':
  case 'rn-BI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rn_BI;
    break;
  case 'ro_MD':
  case 'ro-MD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ro_MD;
    break;
  case 'ro_RO':
  case 'ro-RO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ro_RO;
    break;
  case 'rof':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rof;
    break;
  case 'rof_TZ':
  case 'rof-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rof_TZ;
    break;
  case 'ru_BY':
  case 'ru-BY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_BY;
    break;
  case 'ru_KG':
  case 'ru-KG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_KG;
    break;
  case 'ru_KZ':
  case 'ru-KZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_KZ;
    break;
  case 'ru_MD':
  case 'ru-MD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_MD;
    break;
  case 'ru_RU':
  case 'ru-RU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_RU;
    break;
  case 'ru_UA':
  case 'ru-UA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_UA;
    break;
  case 'rw':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rw;
    break;
  case 'rw_RW':
  case 'rw-RW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rw_RW;
    break;
  case 'rwk':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rwk;
    break;
  case 'rwk_TZ':
  case 'rwk-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rwk_TZ;
    break;
  case 'sah':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sah;
    break;
  case 'sah_RU':
  case 'sah-RU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sah_RU;
    break;
  case 'saq':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_saq;
    break;
  case 'saq_KE':
  case 'saq-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_saq_KE;
    break;
  case 'sbp':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sbp;
    break;
  case 'sbp_TZ':
  case 'sbp-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sbp_TZ;
    break;
  case 'sd':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sd;
    break;
  case 'sd_PK':
  case 'sd-PK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sd_PK;
    break;
  case 'se':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_se;
    break;
  case 'se_FI':
  case 'se-FI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_se_FI;
    break;
  case 'se_NO':
  case 'se-NO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_se_NO;
    break;
  case 'se_SE':
  case 'se-SE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_se_SE;
    break;
  case 'seh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_seh;
    break;
  case 'seh_MZ':
  case 'seh-MZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_seh_MZ;
    break;
  case 'ses':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ses;
    break;
  case 'ses_ML':
  case 'ses-ML':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ses_ML;
    break;
  case 'sg':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sg;
    break;
  case 'sg_CF':
  case 'sg-CF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sg_CF;
    break;
  case 'shi':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi;
    break;
  case 'shi_Latn':
  case 'shi-Latn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Latn;
    break;
  case 'shi_Latn_MA':
  case 'shi-Latn-MA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Latn_MA;
    break;
  case 'shi_Tfng':
  case 'shi-Tfng':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Tfng;
    break;
  case 'shi_Tfng_MA':
  case 'shi-Tfng-MA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Tfng_MA;
    break;
  case 'si_LK':
  case 'si-LK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_si_LK;
    break;
  case 'sk_SK':
  case 'sk-SK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sk_SK;
    break;
  case 'sl_SI':
  case 'sl-SI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sl_SI;
    break;
  case 'smn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_smn;
    break;
  case 'smn_FI':
  case 'smn-FI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_smn_FI;
    break;
  case 'sn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sn;
    break;
  case 'sn_ZW':
  case 'sn-ZW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sn_ZW;
    break;
  case 'so':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so;
    break;
  case 'so_DJ':
  case 'so-DJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_DJ;
    break;
  case 'so_ET':
  case 'so-ET':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_ET;
    break;
  case 'so_KE':
  case 'so-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_KE;
    break;
  case 'so_SO':
  case 'so-SO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_SO;
    break;
  case 'sq_AL':
  case 'sq-AL':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sq_AL;
    break;
  case 'sq_MK':
  case 'sq-MK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sq_MK;
    break;
  case 'sq_XK':
  case 'sq-XK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sq_XK;
    break;
  case 'sr_Cyrl':
  case 'sr-Cyrl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl;
    break;
  case 'sr_Cyrl_BA':
  case 'sr-Cyrl-BA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl_BA;
    break;
  case 'sr_Cyrl_ME':
  case 'sr-Cyrl-ME':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl_ME;
    break;
  case 'sr_Cyrl_RS':
  case 'sr-Cyrl-RS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl_RS;
    break;
  case 'sr_Cyrl_XK':
  case 'sr-Cyrl-XK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl_XK;
    break;
  case 'sr_Latn_BA':
  case 'sr-Latn-BA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn_BA;
    break;
  case 'sr_Latn_ME':
  case 'sr-Latn-ME':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn_ME;
    break;
  case 'sr_Latn_RS':
  case 'sr-Latn-RS':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn_RS;
    break;
  case 'sr_Latn_XK':
  case 'sr-Latn-XK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn_XK;
    break;
  case 'sv_AX':
  case 'sv-AX':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sv_AX;
    break;
  case 'sv_FI':
  case 'sv-FI':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sv_FI;
    break;
  case 'sv_SE':
  case 'sv-SE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sv_SE;
    break;
  case 'sw_CD':
  case 'sw-CD':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sw_CD;
    break;
  case 'sw_KE':
  case 'sw-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sw_KE;
    break;
  case 'sw_TZ':
  case 'sw-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sw_TZ;
    break;
  case 'sw_UG':
  case 'sw-UG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sw_UG;
    break;
  case 'ta_IN':
  case 'ta-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ta_IN;
    break;
  case 'ta_LK':
  case 'ta-LK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ta_LK;
    break;
  case 'ta_MY':
  case 'ta-MY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ta_MY;
    break;
  case 'ta_SG':
  case 'ta-SG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ta_SG;
    break;
  case 'te_IN':
  case 'te-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_te_IN;
    break;
  case 'teo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_teo;
    break;
  case 'teo_KE':
  case 'teo-KE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_teo_KE;
    break;
  case 'teo_UG':
  case 'teo-UG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_teo_UG;
    break;
  case 'tg':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tg;
    break;
  case 'tg_TJ':
  case 'tg-TJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tg_TJ;
    break;
  case 'th_TH':
  case 'th-TH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_th_TH;
    break;
  case 'ti':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ti;
    break;
  case 'ti_ER':
  case 'ti-ER':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ti_ER;
    break;
  case 'ti_ET':
  case 'ti-ET':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ti_ET;
    break;
  case 'tk':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tk;
    break;
  case 'tk_TM':
  case 'tk-TM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tk_TM;
    break;
  case 'to':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_to;
    break;
  case 'to_TO':
  case 'to-TO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_to_TO;
    break;
  case 'tr_CY':
  case 'tr-CY':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tr_CY;
    break;
  case 'tr_TR':
  case 'tr-TR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tr_TR;
    break;
  case 'tt':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tt;
    break;
  case 'tt_RU':
  case 'tt-RU':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tt_RU;
    break;
  case 'twq':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_twq;
    break;
  case 'twq_NE':
  case 'twq-NE':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_twq_NE;
    break;
  case 'tzm':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tzm;
    break;
  case 'tzm_MA':
  case 'tzm-MA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tzm_MA;
    break;
  case 'ug':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ug;
    break;
  case 'ug_CN':
  case 'ug-CN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ug_CN;
    break;
  case 'uk_UA':
  case 'uk-UA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uk_UA;
    break;
  case 'ur_IN':
  case 'ur-IN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ur_IN;
    break;
  case 'ur_PK':
  case 'ur-PK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ur_PK;
    break;
  case 'uz_Arab':
  case 'uz-Arab':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Arab;
    break;
  case 'uz_Arab_AF':
  case 'uz-Arab-AF':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Arab_AF;
    break;
  case 'uz_Cyrl':
  case 'uz-Cyrl':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Cyrl;
    break;
  case 'uz_Cyrl_UZ':
  case 'uz-Cyrl-UZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Cyrl_UZ;
    break;
  case 'uz_Latn':
  case 'uz-Latn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Latn;
    break;
  case 'uz_Latn_UZ':
  case 'uz-Latn-UZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Latn_UZ;
    break;
  case 'vai':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vai;
    break;
  case 'vai_Latn':
  case 'vai-Latn':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vai_Latn;
    break;
  case 'vai_Latn_LR':
  case 'vai-Latn-LR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vai_Latn_LR;
    break;
  case 'vai_Vaii':
  case 'vai-Vaii':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vai_Vaii;
    break;
  case 'vai_Vaii_LR':
  case 'vai-Vaii-LR':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vai_Vaii_LR;
    break;
  case 'vi_VN':
  case 'vi-VN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vi_VN;
    break;
  case 'vun':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vun;
    break;
  case 'vun_TZ':
  case 'vun-TZ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vun_TZ;
    break;
  case 'wae':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_wae;
    break;
  case 'wae_CH':
  case 'wae-CH':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_wae_CH;
    break;
  case 'wo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_wo;
    break;
  case 'wo_SN':
  case 'wo-SN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_wo_SN;
    break;
  case 'xh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_xh;
    break;
  case 'xh_ZA':
  case 'xh-ZA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_xh_ZA;
    break;
  case 'xog':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_xog;
    break;
  case 'xog_UG':
  case 'xog-UG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_xog_UG;
    break;
  case 'yav':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yav;
    break;
  case 'yav_CM':
  case 'yav-CM':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yav_CM;
    break;
  case 'yi':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yi;
    break;
  case 'yi_001':
  case 'yi-001':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yi_001;
    break;
  case 'yo':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yo;
    break;
  case 'yo_BJ':
  case 'yo-BJ':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yo_BJ;
    break;
  case 'yo_NG':
  case 'yo-NG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yo_NG;
    break;
  case 'yue':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yue;
    break;
  case 'yue_Hans':
  case 'yue-Hans':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yue_Hans;
    break;
  case 'yue_Hans_CN':
  case 'yue-Hans-CN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yue_Hans_CN;
    break;
  case 'yue_Hant':
  case 'yue-Hant':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yue_Hant;
    break;
  case 'yue_Hant_HK':
  case 'yue-Hant-HK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yue_Hant_HK;
    break;
  case 'zgh':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zgh;
    break;
  case 'zgh_MA':
  case 'zgh-MA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zgh_MA;
    break;
  case 'zh_Hans':
  case 'zh-Hans':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans;
    break;
  case 'zh_Hans_CN':
  case 'zh-Hans-CN':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_CN;
    break;
  case 'zh_Hans_HK':
  case 'zh-Hans-HK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_HK;
    break;
  case 'zh_Hans_MO':
  case 'zh-Hans-MO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_MO;
    break;
  case 'zh_Hans_SG':
  case 'zh-Hans-SG':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_SG;
    break;
  case 'zh_Hant':
  case 'zh-Hant':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant;
    break;
  case 'zh_Hant_HK':
  case 'zh-Hant-HK':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant_HK;
    break;
  case 'zh_Hant_MO':
  case 'zh-Hant-MO':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant_MO;
    break;
  case 'zh_Hant_TW':
  case 'zh-Hant-TW':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant_TW;
    break;
  case 'zu_ZA':
  case 'zu-ZA':
    goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zu_ZA;
    break;
}
