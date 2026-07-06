// R=red C=cyan G=green M=magenta Y=yellow H=hotpink  '.'=empty
const CHAR_COLORS = {
  R: 'red', C: 'cyan', G: 'green',
  M: 'magenta', Y: 'yellow', H: 'hotpink',
};

// Each row must be exactly 10 chars wide. '.' = empty cell.
const LEVELS = [
  [ // 1 — solid stripes
    'RRRRRRRRRR',
    'CCCCCCCCCC',
    'GGGGGGGGGG',
  ],
  [ // 2 — checkerboard
    'R.R.R.R.R.',
    '.C.C.C.C.C',
    'R.R.R.R.R.',
    '.C.C.C.C.C',
  ],
  [ // 3 — diamond / rhombus
    '....RR....',
    '...RRRR...',
    '..RRRRRR..',
    '.RRRRRRRR.',
    'RRRRRRRRRR',
    '.RRRRRRRR.',
    '..RRRRRR..',
    '...RRRR...',
    '....RR....',
  ],
  [ // 4 — alternating colors
    'RRRRRRRRRRR'.slice(0,10),
    'YYYYYYYYYY',
    'CCCCCCCCCC',
    'MMMMMMMMMM',
    'GGGGGGGGGG',
  ],
  [ // 5 — cross / plus shape
    '....RR....',
    '....RR....',
    'RRRRRRRRRR',
    'RRRRRRRRRR',
    '....RR....',
    '....RR....',
  ],
  [ // 6 — zigzag rows
    'CCC.......',
    '...CCC....',
    '......CCC.',
    '.......CCC',
    '......GGG.',
    '...GGG....',
    'GGG.......',
  ],
  [ // 7 — border frame
    'MMMMMMMMMM',
    'M........M',
    'M........M',
    'M........M',
    'MMMMMMMMMM',
  ],
  [ // 8 — double pyramid
    'Y........Y',
    'YY......YY',
    'YYY....YYY',
    'YYYY..YYYY',
    'YYYYYYYYYY',
  ],
  [ // 9 — dense multi-color
    'RRRRRRRRRR',
    'YYYYYYYYYY',
    'CCCCCCCCCC',
    'MMMMMMMMMM',
    'GGGGGGGGGG',
    'HHHHHHHHHH',
  ],
  [ // 10 — final boss: full grid all colors
    'RRRRRRRRRR',
    'HHHHHHHHHH',
    'MMMMMMMMMM',
    'YYYYYYYYYY',
    'CCCCCCCCCC',
    'GGGGGGGGGG',
    'RRRRRRRRRR',
    'HHHHHHHHHH',
  ],
];
