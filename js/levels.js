console.log('beginning of file levels.js');

var GAME_LEVELS = [
  `                                                    
................................................................................
................................................................................
.................................................................#####..........
...................................................................o............
................................................................................
..............................................o..................#####..........
.................................................................+++++..........
......................................o............##......##....##+##..........
.............................................##..................##+##..........
.................................................................+++++..........
....................................####.........................##v##..........
............................................................................##..
.............................................................................#..
........................o....................................................#..
...........................................###...............................#..
............................................................................#...
..#..@............=............................................#####.......#...
..############..###############...####################.....#######+++#########..
.............#..#.............#...#..................#.....#....................
.............####.............#+++#..................#+++++#....................
..............................#+++#..................#+++++#....................
..............................#####..................#######....................
................................................................................
................................................................................
  `,
  `
................................................................................
................................................................................
.................................................................#####..........
...................................................................o............
................................................................................
..............................................o..................##v##..........
..................................................................#.#........#..
........................#.#...........o..#.........##......##...................
.........................v...................##.................................
..........................................................................#.....
....................................#vv#...........................v............
............................................................................##..
.....................##..............................................#......#..
..................##....o....................................................#..
...............#...........................###...................o......o.#..#..
..............##............................................................#...
..#..@........##..............................................=.......=.....#...
..############.....############+++###..###############.....#######...#########..
..............................#+++#..................#.....#....................
..............................#+++#..................#+++++#....................
..............................#+++#..................#+++++#....................
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
................................................................................
................................................................................
`
]

if (typeof module !== 'undefined' && module.exports && (typeof window === 'undefined' || window.exports != exports)) { module.exports = GAME_LEVELS }
if (typeof global !== 'undefined' && !global.GAME_LEVELS) { global.GAME_LEVELS = GAME_LEVELS }

console.log('end of file levels.js');