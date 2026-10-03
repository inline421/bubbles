/* ===========================================================================
   config.js — ALL content, as data. Adding an object is adding a row.
   =========================================================================== */
window.CONFIG = {

  /* ---- exit guard ---- */
  guardHoldMs: 3000,
  guardCornerSize: 110,

  /* ---- audio ---- */
  masterVolume: 0.36,
  maxVoices: 10,
  greeting: "Let's play!",
  /* How the app behaves when she taps faster than it can talk.
     "wait"      - the spoken NAME always finishes; only the animal noise
                   after it can be cut short by the next tap. (default)
     "interrupt" - the old behaviour: any new tap cuts in at once.
     tapGapMs    - quiet held after a word before the next one may start, so
                   two words never run into each other. */
  tapPolicy: "wait",
  tapGapMs: 180,

  speechRate: 0.82,
  speechPitch: 1.0,
  scale: [261.63,293.66,329.63,392.00,440.00,523.25,587.33,659.25,783.99,880.00,1046.50],

  /* ---- float engine ---- */
  objectCount: 7,
  objectSizeMin: 0.17,
  objectSizeMax: 0.27,
  driftSpeed: 0.013,
  respawnDelay: 260,
  objectSeparation: 1.05,
  trailWidth: 30,
  trailAlpha: 1,
  trailFadeSpeed: 0.011,

  bubbleColors: [
    { c1:"#7fd4f0", c2:"#3577c9", glow:"#4a9fe0", trail:"#8ddcf5" },
    { c1:"#ffc46b", c2:"#e0762c", glow:"#f0a244", trail:"#ffd08a" },
    { c1:"#a6e88a", c2:"#3f9c5a", glow:"#6cc46e", trail:"#b8f0a0" },
    { c1:"#f79ec4", c2:"#c8447f", glow:"#e86ba4", trail:"#ffb3d4" },
    { c1:"#c3aef5", c2:"#6f4fc4", glow:"#9678e0", trail:"#d4c2ff" },
    { c1:"#ffe97a", c2:"#d9a318", glow:"#f2ce4a", trail:"#fff0a0" },
    { c1:"#8ceede", c2:"#2f9d95", glow:"#54c4b8", trail:"#a4f5e8" }
  ],

  /* ---- themes: what floats, what it says, what it sounds like ----------
     `call` names a synthesised sound in audio.js. `say` is spoken aloud.  */
  themes: {
    bubbles: { counter:true, title:"Bubbles", hue:"#4a9fe0", glow:"#4a9fe0", objects:[
      { id:"bubble", name:"Bubble", call:null, trail:"#8ddcf5" }
    ]},
    animals: { title:"Animals", hue:"#e0a83c", glow:"#ffca6b",
      objectDir:"objects/animals/", objects:[
      { id:"cat",     name:"Cat",     f:"cat",     say:"Cat",     sound:"Meow meow", sfx:"cat", call:"meow",   trail:"#ffd08a" },
      { id:"dog",     name:"Dog",     f:"dog",     say:"Dog",     sound:"Woof woof", sfx:"dog", call:"woof",   trail:"#e8c79b" },
      { id:"cow",     name:"Cow",     f:"cow",     say:"Cow",     sound:"Moo", sfx:"cow", call:"moo",    trail:"#f4b6c4" },
      { id:"duck",    name:"Duck",    f:"duck",    say:"Duck",    sound:"Quack quack", sfx:"duck", call:"quack",  trail:"#ffe066" },
      { id:"frog",    name:"Frog",    f:"frog",    say:"Frog",    sound:"Ribbit ribbit", call:"ribbit", trail:"#b8f0a0" },
      { id:"bee",     name:"Bee",     f:"bee",     say:"Bee",     sound:"Buzz", sfx:"bee", call:"buzz",   trail:"#ffe97a" },
      { id:"sheep",   name:"Sheep",   f:"sheep",   say:"Sheep",   sound:"Baa", sfx:"sheep", call:"baa",    trail:"#ecebe8" },
      { id:"pig",     name:"Pig",     f:"pig",     say:"Pig",     sound:"Oink oink", sfx:"pig", call:"oink",   trail:"#f7b9cb" },
      { id:"horse",   name:"Horse",   f:"horse",   say:"Horse",   sound:"Neigh", sfx:"horse", call:"neigh",  trail:"#d8b08c" },
      { id:"chicken", name:"Chicken", f:"chicken", say:"Chicken", sound:"Cluck cluck", sfx:"chicken", call:"cluck",  trail:"#ffffff" },
      { id:"rabbit",  name:"Rabbit",  f:"rabbit",  say:"Rabbit", quiet:true, trail:"#e8d8c4" },
      { id:"mouse",   name:"Mouse",   f:"mouse",   say:"Mouse",   sound:"Squeak squeak", sfx:"mouse", call:"squeak", trail:"#d6d9dd" },
      { id:"bird",    name:"Bird",    f:"bird",    say:"Bird",    sound:"Tweet tweet", sfx:"parrot", call:"chirp",  trail:"#8ddcf5" },
      { id:"fox",     name:"Fox",     f:"fox",     say:"Fox", sound:"Yip yip", sfx:"fox",     call:"squeak", trail:"#ffb07a" }
    ]},
    balls: { title:"Balls", hue:"#3e8fd0", glow:"#7fc4f5",
      objectDir:"objects/balls/", objects:[
      { id:"soccer",     name:"Soccer ball", f:"soccer",     say:"Soccer ball", trail:"#ffffff" },
      { id:"basketball", name:"Basketball",  f:"basketball", say:"Basketball", trail:"#f0a244" },
      { id:"baseball",   name:"Baseball",    f:"baseball",   say:"Baseball",   trail:"#ffffff" },
      { id:"tennis",     name:"Tennis ball", f:"tennis",     say:"Tennis ball", trail:"#d4e64a" },
      { id:"football",   name:"Football",    f:"football",   say:"Football",   trail:"#c99a5a" },
      { id:"volleyball", name:"Volleyball",  f:"volleyball", say:"Volleyball",  trail:"#8ddcf5" },
      { id:"puck",       name:"Hockey puck", f:"puck",       say:"Hockey puck",   trail:"#9aa5b1" },
      { id:"golf",       name:"Golf ball",   f:"golf",       say:"Golf ball",   trail:"#ffffff" }
    ]},
    halloween: { title:"Halloween", hue:"#e0762c", glow:"#ffa44a",
      objectDir:"objects/halloween/", objects:[
      { id:"pumpkin", name:"Pumpkin", f:"pumpkin", say:"Pumpkin",  trail:"#ffa44a" },
      { id:"ghost",   name:"Ghost",   f:"ghost",   say:"Ghost",   sfx:"ghost",     trail:"#f2f4f8" },
      { id:"bat",     name:"Bat",     f:"bat",     say:"Bat",  trail:"#c3aef5" },
      { id:"spider",  name:"Spider",  f:"spider",  say:"Spider", trail:"#b8a8d8" },
      { id:"candy",   name:"Candy",   f:"candy",   say:"Candy", sound:"Yummy", trail:"#ffd84a" },
      { id:"moon",    name:"Moon",    f:"moon",    say:"Moon", trail:"#f7e9a8" },
      { id:"hat",     name:"Hat",     f:"hat",     say:"Hat",   trail:"#b8a8d8" },
      { id:"cat",     name:"Cat",     f:"cat",     say:"Cat",    trail:"#c9ccd2" }
    ]}
  },

  /* ---- body parts: positions on the bundled character illustration ----
     Measured against character.webp (896x1195) and expressed as percentages,
     x of the image width and y of its height, so they hold at any size.
     Radius is a percentage of the IMAGE WIDTH and the hotspot is forced
     square by CSS, so every target is a true circle whatever the container.

     Nose and mouth are only ~42 image-pixels apart, which is closer than a
     44pt target allows, so they necessarily overlap. The renderer draws the
     smallest target last, so the nose sits on top and both centres stay
     individually tappable — verified by test. */
  /* ---- body parts ----------------------------------------------------------
     Measured against the bundled illustration character.webp (896x1195) and
     expressed as percentages: x of the image WIDTH, y of the image HEIGHT.
     r is a percentage of the image WIDTH and CSS forces the hotspot square
     (aspect-ratio:1), so every target is a true circle at any size.

     ONE ear. The illustration deliberately shows her left ear in front of the
     hair and the other tucked behind it; a target over hair would glow on
     hair, which teaches the wrong thing. r floors at 4.4 because that is the
     smallest value that measured >=44pt on an iPad in landscape (4.2 came out
     at 43px - measured, not calculated).

     Nose and mouth circles still overlap at the edges - two 44pt targets do
     not fit between a toddler's nose and mouth - but after the final pass
     neither centre falls inside the other, so both are directly tappable.
     Targets render largest-first, so the smaller one always lands on top.
     Positions were checked against a rendered screenshot, not just arithmetic. */
  bodyParts: [
    { id:"hair",   name:"Hair",  x:46.0, y:8.5,  r:7.5, note:659.25 },
    { id:"ear",    name:"Ear",   x:29.5, y:27.5, r:5.6, note:392 },
    { id:"eye-l",  name:"Eye",   x:46.0, y:25.2, r:5.2, note:523.25 },
    { id:"eye-r",  name:"Eye",   x:65.5, y:25.0, r:5.2, note:523.25 },
    { id:"nose",   name:"Nose",  x:56.0, y:28.2, r:3.8, note:587.33 },
    { id:"mouth",  name:"Mouth", x:56.5, y:32.5, r:4.6, note:440 },
    { id:"arm-l",  name:"Arm",   x:26.0, y:47.0, r:7.5, note:698.46 },
    { id:"arm-r",  name:"Arm",   x:84.0, y:47.0, r:7.5, note:698.46 },
    { id:"hand-l", name:"Hand",  x:10.5, y:62.0, r:7.5, note:783.99 },
    { id:"hand-r", name:"Hand",  x:89.5, y:62.0, r:7.5, note:783.99 },
    { id:"tummy",  name:"Tummy", x:50.0, y:56.0, r:10.5, note:293.66 },
    { id:"leg-l",  name:"Leg",   x:39.5, y:79.5, r:8.0, note:329.63 },
    { id:"leg-r",  name:"Leg",   x:61.5, y:79.5, r:8.0, note:329.63 },
    { id:"foot-l", name:"Foot",  x:32.0, y:93.2, r:7.5, note:261 },
    { id:"foot-r", name:"Foot",  x:69.5, y:93.2, r:7.5, note:261 }
  ],

  /* The drawn fallback figure lives in a square 0-100 viewBox with its own
     geometry, so it needs its own hit areas. It is only reached if the
     bundled image fails to load. Both its ears are drawn, so it keeps two. */
  drawnParts: [
    { id:"hair",   name:"Hair",  x:50,   y:7,    r:6,   note:659.25 },
    { id:"ear-l",  name:"Ear",   x:22,   y:33,   r:5,   note:392 },
    { id:"ear-r",  name:"Ear",   x:78,   y:33,   r:5,   note:392 },
    { id:"eye-l",  name:"Eye",   x:41,   y:29.6, r:5.5, note:523.25 },
    { id:"eye-r",  name:"Eye",   x:59,   y:29.6, r:5.5, note:523.25 },
    { id:"nose",   name:"Nose",  x:50,   y:38.6, r:4.2, note:587.33 },
    { id:"mouth",  name:"Mouth", x:50,   y:48.5, r:4.6, note:440 },
    { id:"arm-l",  name:"Arm",   x:25,   y:61,   r:5,   note:698.46 },
    { id:"arm-r",  name:"Arm",   x:75,   y:61,   r:5,   note:698.46 },
    { id:"hand-l", name:"Hand",  x:14,   y:62,   r:6.5, note:783.99 },
    { id:"hand-r", name:"Hand",  x:86,   y:62,   r:6.5, note:783.99 },
    { id:"tummy",  name:"Tummy", x:50,   y:68,   r:8.5, note:293.66 },
    { id:"leg-l",  name:"Leg",   x:44,   y:83,   r:5,   note:329.63 },
    { id:"leg-r",  name:"Leg",   x:56,   y:83,   r:5,   note:329.63 },
    { id:"foot-l", name:"Foot",  x:41,   y:92,   r:5,   note:261 },
    { id:"foot-r", name:"Foot",  x:59,   y:92,   r:5,   note:261 }
  ],

  /* Bundled default character. A custom photo, once set, wins over it.
     WebP: a quarter the bytes of the equivalent JPEG for a flat illustration,
     supported since iPadOS 14, and if it ever fails to decode mode-body falls
     back to the drawn figure rather than showing nothing. */
  characterSrc: "character.webp",
  /* appended to the bundled image URL for the same reason every script URL
     carries one: a fresh index.html must never pair with a stale cached asset */
  assetVersion: "?v=3.24.0",
  characterAspect: 896/1195,


  /* ---- photos ---- */
  photoMaxEdge: 1600,
  characterMaxEdge: 1400,
  photoQuality: 0.86,
  photoMaxZoom: 4,

  /* ---- menu order ---- */
  /* ---- letters ----
     One word per letter, chosen to be a thing a fifteen-month-old has seen,
     and to start with the letter's COMMON sound - no "C is for city", no
     silent letters. `s` is the phonic sound, written the way the speech
     engine pronounces it rather than in IPA, which it would read aloud. */
  letters: [
    { l:"A", w:"Apple",     s:"ah" },   { l:"B", w:"Ball",    s:"buh" },
    { l:"C", w:"Cat",       s:"kuh" },  { l:"D", w:"Dog",     s:"duh" },
    { l:"E", w:"Egg",       s:"eh" },   { l:"F", w:"Fish",    s:"fff" },
    { l:"G", w:"Goat",      s:"guh" },  { l:"H", w:"Hat",     s:"huh" },
    { l:"I", w:"Igloo",     s:"ih" },   { l:"J", w:"Jam",     s:"juh" },
    { l:"K", w:"Kite",      s:"kuh" },  { l:"L", w:"Leaf",    s:"lll" },
    { l:"M", w:"Moon",      s:"mmm" },  { l:"N", w:"Nest",    s:"nnn" },
    { l:"O", w:"Otter",     s:"oh" },   { l:"P", w:"Pig",     s:"puh" },
    { l:"Q", w:"Queen",     s:"kwuh" }, { l:"R", w:"Rain",    s:"rrr" },
    { l:"S", w:"Sabrina",  s:"sss" },  { l:"T", w:"Tree",    s:"tuh" },
    { l:"U", w:"Umbrella",  s:"uh" },   { l:"V", w:"Van",     s:"vvv" },
    { l:"W", w:"Water",     s:"wuh" },  { l:"X", w:"Xylophone", s:"ks" },
    { l:"Y", w:"Yellow",    s:"yuh" },  { l:"Z", w:"Zebra",   s:"zzz" }
  ],

  /* ---- colours ----
     Named with the words a toddler hears at home, and each one far enough
     from its neighbours in hue that she can tell them apart before she can
     name them. Brown and grey are muted on purpose so they read as distinct
     from orange and white rather than as dim versions of them. */
  colours: [
    { n:"Red",    c:"#e03a3a" }, { n:"Orange", c:"#f08122" },
    { n:"Yellow", c:"#f2c53d" }, { n:"Green",  c:"#4bab5a" },
    { n:"Blue",   c:"#3d7fd6" }, { n:"Purple", c:"#8e5ad0" },
    { n:"Pink",   c:"#ee7bb0" }, { n:"Brown",  c:"#96603c" },
    { n:"Black",  c:"#2a2f36" }, { n:"White",  c:"#f4f6f8" },
    { n:"Grey",   c:"#9aa5b1" }
  ],

  /* ---- shapes ---- */
  shapes: [
    { n:"Circle"   }, { n:"Square" }, { n:"Triangle" }, { n:"Star" },
    { n:"Heart"    }, { n:"Diamond" }, { n:"Oval"    }, { n:"Rectangle" }
  ],

  /* ---- counting ---- */
  countTo: 10,
  numberWords: ["one","two","three","four","five","six","seven","eight","nine","ten"],

  /* ---- scenes ------------------------------------------------------------
     Each scene is a coded background plus cut-out stickers at known spots.
     x and y are the sticker's CENTRE as a percentage of the scene box, s is
     its width as a percentage of the scene width. Because the app places
     them, the tap target is the sticker itself - exact, never measured.

     Layout rule: things lower on screen read as nearer, so they are drawn
     larger and later. Nothing sits under the top corners, which belong to the
     exit gesture. */
  sceneDir: "scenes/",
  voiceDir: "voice/",
  sfxDir:   "sfx/",
  scenes: [
    { id:"farm", title:"Farm",
      sky:["#8fd3f0","#dff1fa"], ground:"#79c268", ground2:"#5da84f", groundTop:52,
      decor:[
        { k:"cloud", x:30, y:13, s:19, o:.9 }, { k:"cloud", x:64, y:9,  s:14, o:.75 },
        { k:"tree",  x:7,  y:39, s:18, z:2 },  { k:"tree",  x:95, y:41, s:15, z:2, flip:1 },
        { k:"fence", x:34, y:55, s:52, z:1, o:.92 },   /* behind the animals  */
        { k:"pond",  x:64, y:91, s:20, z:1 },          /* clear of the animals */
        { k:"bush",  x:56, y:56, s:11, z:2 }
      ],
      items:[
        { n:"Barn", sound:"Creeeak",    f:"barn",    x:20, y:38, s:20 },
        { n:"Tractor", f:"tractor", x:76, y:47, s:21, sound:"Brmm brmm", sfx:"tractor", call:"engine" },
        { n:"Cow",     f:"cow",     x:37, y:61, s:19, sound:"Moo", sfx:"cow", call:"moo" },
        { n:"Pig",     f:"pig",     x:63, y:62, s:17, sound:"Oink oink", sfx:"pig", call:"oink" },
        { n:"Sheep",   f:"sheep",   x:13, y:70, s:16, sound:"Baa", sfx:"sheep", call:"baa" },
        { n:"Horse",   f:"horse",   x:88, y:59, s:17, sound:"Neigh", sfx:"horse", call:"neigh" },
        { n:"Dog",     f:"dog",     x:27, y:81, s:14, sound:"Woof woof", sfx:"dog", call:"woof" },
        { n:"Duck",    f:"duck",    x:48, y:82, s:11, sound:"Quack quack", sfx:"duck", call:"quack" },
        { n:"Chicken", f:"chicken", x:20, y:52, s:11, sound:"Cluck cluck", sfx:"chicken", call:"cluck" }
      ]},

    { id:"ocean", title:"Ocean", sun:false,
      sky:["#2f86c4","#57b0dd"], ground:"#e8d9a8", ground2:"#d6c48e", groundTop:84,
      decor:[
        { k:"seaweed", x:8,  y:72, s:14, z:1 }, { k:"seaweed", x:92, y:74, s:12, z:1, flip:1 },
        { k:"coral",   x:36, y:88, s:13, z:3 }, { k:"coral",   x:62, y:89, s:11, z:3 },
        { k:"rock",    x:14, y:91, s:20, z:2 }, { k:"rock",    x:84, y:92, s:17, z:2 },
        { k:"seaweed", x:52, y:80, s:10, z:1, o:.75 }
      ],
      items:[
        { n:"Whale",    f:"whale",    x:26, y:30, s:30, sound:"Whoooo", sfx:"whale", call:"whalesong" },
        { n:"Dolphin",  f:"dolphin",  x:75, y:26, s:22, sound:"Eee eee", sfx:"dolphin", call:"click" },
        { n:"Fish", sound:"Blub blub blub", sfx:"fish",     f:"fish",     x:52, y:47, s:15, call:"splash" },
        { n:"Octopus", sound:"Squish squish", sfx:"water",  f:"octopus",  x:18, y:62, s:19, call:"splash" },
        { n:"Shark", sound:"Chomp chomp", sfx:"shark",    f:"shark",    x:78, y:56, s:24, call:"splash" },
        { n:"Turtle", sound:"Splish splash", sfx:"water-b",   f:"turtle",   x:47, y:70, s:20, call:"splash" },
        { n:"Crab", sound:"Click click click", sfx:"crab",     f:"crab",     x:22, y:87, s:15, call:"skitter" },
        { n:"Starfish", sound:"Twinkle twinkle", sfx:"water", f:"starfish", x:70, y:88, s:14, call:"twinkle" }
      ]},

    { id:"jungle", title:"Jungle",
      sky:["#bfe6a8","#e6f4d6"], ground:"#4f9e4a", ground2:"#3c7f3a", groundTop:54,
      decor:[
        { k:"palm",  x:88, y:40, s:24, z:2 },
        { k:"tree",  x:56, y:36, s:24, z:1 },          /* and the parrot in this one   */
        { k:"palm",  x:12, y:33, s:26, z:1, flip:1 },   /* the monkey sits in this one */
        { k:"pond",  x:74, y:64, s:30, z:1 },          /* the elephant drinks here     */
        { k:"bush",  x:26, y:60, s:14, z:3 },
        { k:"bush",  x:48, y:72, s:12, z:3 },
        { k:"bush",  x:90, y:88, s:15, z:4 }
      ],
      items:[
        { n:"Giraffe", sound:"Munch munch", sfx:"giraffe",  f:"giraffe",  x:30, y:50, s:14 },
        { n:"Elephant", f:"elephant", x:79, y:46, s:24, sound:"Toot toot", sfx:"elephant", call:"trumpet" },
        { n:"Lion",     f:"lion",     x:40, y:62, s:18, sound:"Roar", sfx:"lion", call:"roar" },
        { n:"Tiger",    f:"tiger",    x:63, y:66, s:17, sound:"Roar", sfx:"tiger", call:"roar" },
        { n:"Zebra",    f:"zebra",    x:13, y:72, s:14, sound:"Stampede", sfx:"zebra", call:"neigh" },
        { n:"Monkey",   f:"monkey",   x:15, y:47, s:12, sound:"Ooh ooh ah ah", sfx:"monkey", call:"squeak" },  /* up the left palm */
        { n:"Snake",    f:"snake",    x:34, y:83, s:16, sound:"Ssssss", sfx:"snake", call:"hiss" },
        { n:"Parrot",   f:"parrot",   x:58, y:43, s:10, sound:"Squawk", sfx:"parrot", call:"chirp" }   /* in the tree */
      ]},

    { id:"town", title:"Things That Go",
      sky:["#9fd8f2","#e2f2fa"], ground:"#8fb36b", ground2:"#7a9c5c", groundTop:56,
      decor:[
        { k:"cloud",  x:22, y:11, s:17, o:.9 }, { k:"cloud", x:72, y:8, s:13, o:.7 },
        { k:"sea",    x:50, y:38, s:104, z:1 },        /* water in the distance        */
        { k:"tracks", x:50, y:70, s:106, z:1 },        /* the train runs on these      */
        { k:"road",   x:50, y:89, s:106, z:1 },        /* and the cars down here       */
        { k:"bush",   x:9,  y:60, s:9,  z:2, o:.9 }, { k:"bush", x:91, y:60, s:8, z:2, o:.9 }
      ],
      items:[
        { n:"Plane",     f:"plane",     x:28, y:19, s:21, sound:"Whooosh", sfx:"plane", call:"whoosh" },
        { n:"Boat",      f:"boat",      x:78, y:34, s:16, sound:"Toot toot", sfx:"boat", call:"splash" },   /* on the water */
        { n:"Bus",       f:"bus",       x:24, y:55, s:22, sound:"Pssssst", sfx:"bus", call:"honk" },
        { n:"Fire truck",f:"firetruck", x:74, y:54, s:21, sound:"Wee ooo, wee ooo", sfx:"siren", call:"siren" },
        { n:"Train",     f:"train",     x:50, y:66, s:26, sound:"Choo choo", sfx:"train", call:"choochoo" }, /* on the rails */
        { n:"Car",       f:"car",       x:18, y:85, s:19, sound:"Beep beep", sfx:"car", call:"honk" },
        { n:"Bicycle",   f:"bike",      x:50, y:88, s:16, sound:"Ring ring", sfx:"bicycle", call:"ding" }
      ]}
  ],

  modes: [
    { id:"bubbles",   theme:"bubbles",   title:"Bubbles"   },
    { id:"animals",   theme:"animals",   title:"Animals"   },
    { id:"balls",     theme:"balls",     title:"Balls"     },
    { id:"halloween", theme:"halloween", title:"Halloween" },
    { id:"body",      title:"Me"        },
    { id:"letters",   title:"Letters"   },
    { id:"counting",  title:"Numbers"   },
    { id:"colours",   title:"Colours"   },
    { id:"shapes",    title:"Shapes"    },
    { id:"scene-farm",   scene:"farm",   title:"Farm"          },
    { id:"scene-ocean",  scene:"ocean",  title:"Ocean"         },
    { id:"scene-jungle", scene:"jungle", title:"Jungle"        },
    { id:"scene-town",   scene:"town",   title:"Things That Go" },
    { id:"photos",    title:"Photos"    }
  ]
};
