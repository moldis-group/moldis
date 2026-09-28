(base) raghunathanramakrishnan@Raghunathans-Mac-mini moldis % ls -l db/dfist-bnpah/*
-rw-r--r--  1 raghunathanramakrishnan  staff  4262 Sep 28 12:28 db/dfist-bnpah/data_content_check.sh

db/dfist-bnpah/level-1:
total 0
drwxr-xr-x  3 raghunathanramakrishnan  staff   96 Sep 28 12:01 SCS-PBE-QIDH_VDZ_30797
drwxr-xr-x  5 raghunathanramakrishnan  staff  160 Sep 28 12:03 XYZ_TPSSh

db/dfist-bnpah/level-2:
total 136
-rw-r--r--  1 raghunathanramakrishnan  staff  66806 Sep 28 12:04 LCC2_VDZ_2032.csv

db/dfist-bnpah/level-3:
total 0
drwxr-xr-x  5 raghunathanramakrishnan  staff  160 Sep 28 12:06 OPT_wB97XD3_def2TZVP_119

db/dfist-bnpah/level-4:
total 0
drwxr-xr-x  3 raghunathanramakrishnan  staff  96 Sep 28 12:07 LADC2_AVDZ_72
drwxr-xr-x  3 raghunathanramakrishnan  staff  96 Sep 28 12:07 LCC2_AVDZ_72



(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % pwd
/Users/raghunathanramakrishnan/repos/moldis/db/dfist-bnpah

(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % ls -l level-1 
total 0
drwxr-xr-x  3 raghunathanramakrishnan  staff   96 Sep 28 12:01 SCS-PBE-QIDH_VDZ_30797
drwxr-xr-x  5 raghunathanramakrishnan  staff  160 Sep 28 12:03 XYZ_TPSSh

(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % head level-1/SCS-PBE-QIDH_VDZ_30797/SCS-PBE-QIDH_VDZ_30797.csv 
Mol_Index,PAH,S1,T1,STG
BNPAH_00001,1,4.44,3.486,0.954
BNPAH_00002,1,4.086,2.383,1.703
BNPAH_00003,1,4.468,3.568,0.9
BNPAH_00004,1,2.562,2.159,0.403
BNPAH_00005,1,2.543,1.747,0.796
BNPAH_00006,1,3.063,2.448,0.615
BNPAH_00007,1,2.318,1.814,0.504
BNPAH_00008,1,3.958,2.695,1.263
BNPAH_00009,1,3.675,2.438,1.237
(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % 
(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % ls -l level-1/XYZ_TPSSh/xyz/* | head
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00001.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00002.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00003.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00004.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00005.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00006.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00007.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00008.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00009.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff   879 Sep 28 12:03 level-1/XYZ_TPSSh/xyz/BNPAH_00010.xyz

(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % ls -l level-2/*
-rw-r--r--  1 raghunathanramakrishnan  staff  66806 Sep 28 12:04 level-2/LCC2_VDZ_2032.csv

(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % head level-2/LCC2_VDZ_2032.csv 
Mol_Index,PAH,S1,T1,STG
BNPAH_16952,55,1.31,1.319,-0.009
BNPAH_16546,54,1.416,1.436,-0.02
BNPAH_13758,50,0.99,1.003,-0.013
BNPAH_15347,52,0.752,0.751,0.001
BNPAH_02078,15,1.351,1.368,-0.017
BNPAH_15035,52,1.243,1.2,0.043
BNPAH_16772,54,0.817,0.829,-0.012
BNPAH_15397,52,0.891,0.907,-0.016
BNPAH_15060,52,1.064,1.102,-0.038


(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % ls -l level-3/OPT_wB97XD3_def2TZVP_119/* | head

level-3/OPT_wB97XD3_def2TZVP_119/xyz:
total 952
-rw-r--r--  1 raghunathanramakrishnan  staff  1965 Sep 28 12:06 BNPAH_00311.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff  1965 Sep 28 12:06 BNPAH_00334.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff  2715 Sep 28 12:06 BNPAH_01968.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff  2715 Sep 28 12:06 BNPAH_02011.xyz
-rw-r--r--  1 raghunathanramakrishnan  staff  2715 Sep 28 12:06 BNPAH_02055.xyz

(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % ls level-4/*
level-4/LADC2_AVDZ_72:
LADC2_AVDZ_72.csv

level-4/LCC2_AVDZ_72:
LCC2_AVDZ_72.csv

(base) raghunathanramakrishnan@Raghunathans-Mac-mini dfist-bnpah % head level-4/*/*
==> level-4/LADC2_AVDZ_72/LADC2_AVDZ_72.csv <==
Mol_Index,PAH,S1,T1,STG
BNPAH_00311,6,1.79,1.87,-0.08
BNPAH_00334,6,1.833,1.914,-0.081
BNPAH_01968,15,1.483,1.475,0.008
BNPAH_02055,15,0.932,0.945,-0.013
BNPAH_02361,17,1.313,1.33,-0.017
BNPAH_02432,17,1.259,1.264,-0.005
BNPAH_02892,19,1.76,1.751,0.009
BNPAH_03717,21,1.223,1.276,-0.053
BNPAH_03755,21,1.834,1.896,-0.062

==> level-4/LCC2_AVDZ_72/LCC2_AVDZ_72.csv <==
Mol_Index,PAH,S1,f01,T1,STG
BNPAH_00311,6,1.844,0.00469255,1.912,-0.068
BNPAH_00334,6,1.914,0.01151361,1.983,-0.069
BNPAH_01968,15,1.56,0.00681963,1.554,0.006
BNPAH_02055,15,1.04,0.00463425,1.051,-0.011
BNPAH_02361,17,1.419,0.01602093,1.44,-0.021
BNPAH_02432,17,1.363,0.01724492,1.372,-0.009
BNPAH_02892,19,1.815,0.01071584,1.815,0.0
BNPAH_03717,21,1.27,0.00047079,1.316,-0.046
BNPAH_03755,21,1.89,0.00986462,1.942,-0.052
