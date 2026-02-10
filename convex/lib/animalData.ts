export type LocomotionType =
  | "quadruped" // 4 legs: bear, fox, deer, wolf, cat, dog, horse
  | "biped-walking" // 2 legs upright: penguin, humanoid (NOT for normal animals)
  | "biped-hopping" // 2 legs hopping: rabbit, kangaroo, bird on ground
  | "flying" // wings: eagle, owl, bird in flight, bat
  | "swimming" // aquatic: fish, dolphin, whale
  | "serpentine" // no legs: snake, worm
  | "multi-leg"; // insects, spiders, crabs

export interface AnimalInfo {
  name: string;
  locomotion: LocomotionType;
  walkPhrase: string;
  runPhrase: string;
  idlePhrase: string;
  sitPhrase: string;
  sleepPhrase: string;
  jumpPhrase: string;
  flyPhrase?: string;
  swimPhrase?: string;
  deathPhrase: string;
  hitReactPhrase: string;
}

export const ANIMAL_DATABASE: Record<string, AnimalInfo> = {
  // Quadrupeds
  bear: {
    name: "bear",
    locomotion: "quadruped",
    walkPhrase:
      "walking on all four legs, natural quadruped gait, diagonal leg movement, body horizontal to ground",
    runPhrase: "running on all four legs, galloping gait, body stretching horizontally, four paws on ground",
    idlePhrase: "standing on all four legs, weight evenly distributed, body horizontal, four paws touching ground",
    sitPhrase: "sitting on haunches with rear on ground, front legs straight in front, body touching ground",
    sleepPhrase: "lying flat on the ground curled up on side, entire body resting on ground surface, eyes closed, head resting on paws, NOT standing",
    jumpPhrase: "leaping with all four legs extended, powerful jump, body horizontal",
    deathPhrase: "collapsing onto side, body on ground, legs giving out",
    hitReactPhrase: "flinching back on all four legs, startled reaction, body horizontal",
  },
  fox: {
    name: "fox",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, slinky feline-like gait, body horizontal to ground",
    runPhrase: "running on all four legs, tail streaming behind, body low and horizontal",
    idlePhrase: "standing alert on all four legs, ears perked, body horizontal, four paws on ground",
    sitPhrase: "sitting with haunches on ground, tail wrapped around paws, rear touching ground",
    sleepPhrase: "curled up in a ball lying on the ground, tail over nose, entire body resting on ground surface, NOT standing",
    jumpPhrase: "pouncing leap, front legs extended, body horizontal",
    deathPhrase: "falling onto side, body on ground, going limp",
    hitReactPhrase: "jumping back on all fours, fur bristling, body horizontal",
  },
  deer: {
    name: "deer",
    locomotion: "quadruped",
    walkPhrase: "walking gracefully on all four legs, elegant gait",
    runPhrase: "galloping on all four legs, bounding motion",
    idlePhrase: "standing alert on all four legs, head raised",
    sitPhrase: "lying down with legs folded underneath",
    sleepPhrase: "lying with legs tucked, head resting",
    jumpPhrase: "leaping over obstacle, all legs tucked",
    deathPhrase: "crumpling to ground, legs folding",
    hitReactPhrase: "startling back, legs stiffening",
  },
  wolf: {
    name: "wolf",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, prowling gait, body horizontal to ground",
    runPhrase: "running on all four legs, loping stride, body horizontal",
    idlePhrase: "standing on all four legs, alert posture, body horizontal, four paws on ground",
    sitPhrase: "sitting on haunches with rear on ground, front legs straight",
    sleepPhrase: "curled up lying on ground, tail over nose, entire body on ground surface, NOT standing",
    jumpPhrase: "lunging leap, powerful spring, body horizontal",
    deathPhrase: "collapsing onto side, body on ground, going still",
    hitReactPhrase: "snarling and stepping back on all fours, body horizontal",
  },
  cat: {
    name: "cat",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, silent feline gait, body horizontal to ground",
    runPhrase: "running on all four legs, body low and horizontal to ground",
    idlePhrase: "sitting or standing on all four legs, body horizontal, four paws on ground",
    sitPhrase: "sitting upright with rear on ground, tail wrapped around, body touching ground",
    sleepPhrase: "curled in ball lying on ground or stretched out flat, entire body on ground surface, NOT standing",
    jumpPhrase: "leaping gracefully, body arched",
    deathPhrase: "falling onto side, body on ground, relaxing",
    hitReactPhrase: "arching back, hissing, all four paws planted on ground",
  },
  dog: {
    name: "dog",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, happy trotting gait, body horizontal to ground",
    runPhrase: "running on all four legs, bounding stride, body horizontal",
    idlePhrase: "standing on all four legs, tail wagging, body horizontal, four paws on ground",
    sitPhrase: "sitting on haunches with rear on ground, front legs straight, touching ground",
    sleepPhrase: "lying on side on the ground or curled up, entire body resting on ground, NOT standing",
    jumpPhrase: "jumping up, front legs extended, body horizontal",
    deathPhrase: "falling onto side, body on ground, going limp",
    hitReactPhrase: "yelping and jumping back on all fours, body horizontal",
  },
  horse: {
    name: "horse",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, steady gait",
    runPhrase: "galloping on all four legs, mane flowing",
    idlePhrase: "standing on all four legs, one hoof resting",
    sitPhrase: "lying down with legs folded",
    sleepPhrase: "lying flat or standing with eyes closed",
    jumpPhrase: "jumping over obstacle, legs tucked",
    deathPhrase: "collapsing onto side, dramatic fall",
    hitReactPhrase: "rearing back on hind legs, startled",
  },
  elephant: {
    name: "elephant",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, heavy deliberate gait",
    runPhrase: "running on all four legs, thundering charge",
    idlePhrase: "standing on all four legs, trunk swaying",
    sitPhrase: "lying on side, legs extended",
    sleepPhrase: "lying on side or standing",
    jumpPhrase: "stomping heavily, elephants cannot jump",
    deathPhrase: "crashing to ground, massive collapse",
    hitReactPhrase: "trumpeting and stepping back heavily",
  },
  lion: {
    name: "lion",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, majestic stride, body horizontal to ground",
    runPhrase: "running on all four legs, powerful sprint, body horizontal",
    idlePhrase: "standing on all four legs, surveying, body horizontal, four paws on ground",
    sitPhrase: "sitting sphinx-like with body on ground, front legs extended forward, rear on ground",
    sleepPhrase: "lying flat on side on the ground, completely relaxed, entire body on ground surface, NOT standing",
    jumpPhrase: "pouncing leap, claws extended, body horizontal",
    deathPhrase: "falling onto side, body on ground, going limp",
    hitReactPhrase: "roaring and stepping back on all fours, mane bristling",
  },
  tiger: {
    name: "tiger",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, stalking gait",
    runPhrase: "running on all four legs, powerful sprint",
    idlePhrase: "standing alert on all four legs",
    sitPhrase: "sitting with front legs extended",
    sleepPhrase: "lying stretched out or curled",
    jumpPhrase: "pouncing with extended claws",
    deathPhrase: "collapsing onto side",
    hitReactPhrase: "snarling and recoiling on all fours",
  },
  cow: {
    name: "cow",
    locomotion: "quadruped",
    walkPhrase: "walking slowly on all four legs, lumbering gait",
    runPhrase: "trotting on all four legs",
    idlePhrase: "standing on all four legs, chewing",
    sitPhrase: "lying down with legs tucked",
    sleepPhrase: "lying on side or stomach",
    jumpPhrase: "hopping awkwardly on all fours",
    deathPhrase: "falling onto side",
    hitReactPhrase: "mooing and stepping back",
  },
  pig: {
    name: "pig",
    locomotion: "quadruped",
    walkPhrase: "trotting on all four legs, snout forward",
    runPhrase: "running on all four legs, ears flapping",
    idlePhrase: "standing on all four legs, sniffing",
    sitPhrase: "lying down, legs tucked",
    sleepPhrase: "lying on side, relaxed",
    jumpPhrase: "small hop on all fours",
    deathPhrase: "falling onto side",
    hitReactPhrase: "squealing and jumping back",
  },
  sheep: {
    name: "sheep",
    locomotion: "quadruped",
    walkPhrase: "walking on all four legs, woolly body swaying",
    runPhrase: "bounding on all four legs",
    idlePhrase: "standing on all four legs, grazing",
    sitPhrase: "lying with legs tucked under wool",
    sleepPhrase: "lying curled up",
    jumpPhrase: "leaping playfully",
    deathPhrase: "falling onto side",
    hitReactPhrase: "bleating and jumping back",
  },
  squirrel: {
    name: "squirrel",
    locomotion: "quadruped",
    walkPhrase: "scampering on all four legs, bushy tail up",
    runPhrase: "darting quickly on all four legs",
    idlePhrase: "sitting on haunches, front paws held up",
    sitPhrase: "sitting upright, tail curled",
    sleepPhrase: "curled in ball with tail wrapped",
    jumpPhrase: "leaping between surfaces",
    deathPhrase: "falling and going still",
    hitReactPhrase: "chittering and darting away",
  },
  mouse: {
    name: "mouse",
    locomotion: "quadruped",
    walkPhrase: "scurrying on all four tiny legs",
    runPhrase: "darting rapidly on all fours",
    idlePhrase: "sitting on haunches, whiskers twitching",
    sitPhrase: "sitting upright, grooming",
    sleepPhrase: "curled in tiny ball",
    jumpPhrase: "hopping quickly",
    deathPhrase: "falling onto side",
    hitReactPhrase: "squeaking and jumping away",
  },
  // Flying animals
  eagle: {
    name: "eagle",
    locomotion: "flying",
    walkPhrase: "hopping on two legs with wings folded",
    runPhrase: "hopping quickly, wings partially spread",
    idlePhrase: "perched, wings folded, standing on two legs",
    sitPhrase: "perched with chest lowered",
    sleepPhrase: "perched with head tucked under wing",
    jumpPhrase: "leaping to take off, wings spreading",
    flyPhrase: "soaring with wings fully extended, gliding",
    deathPhrase: "falling from perch, wings limp",
    hitReactPhrase: "flapping wings defensively, screeching",
  },
  owl: {
    name: "owl",
    locomotion: "flying",
    walkPhrase: "hopping awkwardly on two legs",
    runPhrase: "hopping with wings partially spread",
    idlePhrase: "perched upright, wings folded, large eyes forward",
    sitPhrase: "perched, eyes half closed",
    sleepPhrase: "perched with eyes closed",
    jumpPhrase: "launching from perch, wings opening",
    flyPhrase: "flying silently, wings spread wide",
    deathPhrase: "falling from perch",
    hitReactPhrase: "hooting and fluffing feathers",
  },
  bird: {
    name: "bird",
    locomotion: "flying",
    walkPhrase: "hopping on two small legs",
    runPhrase: "hopping rapidly, wings fluttering",
    idlePhrase: "perched or standing, wings folded",
    sitPhrase: "resting with chest on surface",
    sleepPhrase: "head tucked, feathers fluffed",
    jumpPhrase: "taking off, wings beating",
    flyPhrase: "flying with wings flapping",
    deathPhrase: "falling, wings spread",
    hitReactPhrase: "chirping and fluttering away",
  },
  crow: {
    name: "crow",
    locomotion: "flying",
    walkPhrase: "walking on two legs with hopping gait",
    runPhrase: "hopping quickly with wings tucked",
    idlePhrase: "perched, head tilting",
    sitPhrase: "perched with body relaxed",
    sleepPhrase: "perched with head tucked",
    jumpPhrase: "taking flight with strong wingbeats",
    flyPhrase: "flying with steady wingbeats",
    deathPhrase: "falling with wings spread",
    hitReactPhrase: "cawing and flapping wings",
  },
  bat: {
    name: "bat",
    locomotion: "flying",
    walkPhrase: "crawling awkwardly on wing joints and feet",
    runPhrase: "scrambling quickly on all fours",
    idlePhrase: "hanging upside down, wings wrapped",
    sitPhrase: "hanging with wings partially open",
    sleepPhrase: "hanging upside down, wrapped in wings",
    jumpPhrase: "dropping and spreading wings",
    flyPhrase: "flying with rapid wingbeats, echolocating",
    deathPhrase: "falling from perch, wings limp",
    hitReactPhrase: "screeching and fluttering away",
  },
  // Hopping biped
  rabbit: {
    name: "rabbit",
    locomotion: "biped-hopping",
    walkPhrase: "hopping slowly on back legs, front paws tucked",
    runPhrase: "bounding rapidly, ears back",
    idlePhrase: "sitting on haunches, ears upright",
    sitPhrase: "sitting on haunches, front paws on ground",
    sleepPhrase: "lying flat, stretched out or curled",
    jumpPhrase: "leaping high, back legs extended",
    deathPhrase: "falling onto side",
    hitReactPhrase: "thumping foot and jumping back",
  },
  kangaroo: {
    name: "kangaroo",
    locomotion: "biped-hopping",
    walkPhrase: "hopping on powerful back legs, tail for balance",
    runPhrase: "bounding rapidly on back legs",
    idlePhrase: "standing upright on back legs and tail",
    sitPhrase: "resting on tail and back legs",
    sleepPhrase: "lying on side",
    jumpPhrase: "leaping high, back legs tucked then extended",
    deathPhrase: "falling forward onto side",
    hitReactPhrase: "boxing stance, leaning back on tail",
  },
  frog: {
    name: "frog",
    locomotion: "biped-hopping",
    walkPhrase: "hopping on powerful back legs",
    runPhrase: "leaping rapidly from spot to spot",
    idlePhrase: "sitting with back legs tucked, throat pulsing",
    sitPhrase: "crouched low, legs ready to spring",
    sleepPhrase: "sitting still, eyes closed",
    jumpPhrase: "leaping high with legs extended",
    swimPhrase: "swimming with leg kicks",
    deathPhrase: "falling onto back",
    hitReactPhrase: "jumping away in panic",
  },
  // Walking biped
  penguin: {
    name: "penguin",
    locomotion: "biped-walking",
    walkPhrase: "waddling on two feet, flippers at sides",
    runPhrase: "waddling quickly or sliding on belly",
    idlePhrase: "standing upright on two feet",
    sitPhrase: "sitting with feet extended",
    sleepPhrase: "standing with head tucked, huddled",
    jumpPhrase: "hopping on two feet",
    swimPhrase: "swimming gracefully with flippers",
    deathPhrase: "falling forward onto belly",
    hitReactPhrase: "flapping flippers and stepping back",
  },
  chicken: {
    name: "chicken",
    locomotion: "biped-walking",
    walkPhrase: "walking on two legs, head bobbing",
    runPhrase: "running with wings slightly spread",
    idlePhrase: "standing on two legs, pecking",
    sitPhrase: "sitting in nest position",
    sleepPhrase: "perched with head tucked",
    jumpPhrase: "fluttering jump, wings flapping",
    flyPhrase: "fluttering short distance",
    deathPhrase: "falling onto side",
    hitReactPhrase: "squawking and flapping",
  },
  duck: {
    name: "duck",
    locomotion: "biped-walking",
    walkPhrase: "waddling on two webbed feet",
    runPhrase: "waddling quickly with wings out",
    idlePhrase: "standing, preening feathers",
    sitPhrase: "sitting with feet tucked",
    sleepPhrase: "floating or sitting with head tucked",
    jumpPhrase: "taking flight with wingbeats",
    flyPhrase: "flying with rapid wingbeats",
    swimPhrase: "paddling on water surface",
    deathPhrase: "falling onto side",
    hitReactPhrase: "quacking and flapping away",
  },
  // Serpentine
  snake: {
    name: "snake",
    locomotion: "serpentine",
    walkPhrase: "slithering with S-curve body motion, no legs",
    runPhrase: "slithering rapidly, body waves faster",
    idlePhrase: "coiled or stretched, tongue flicking",
    sitPhrase: "coiled in resting position",
    sleepPhrase: "coiled with head resting on body",
    jumpPhrase: "striking forward, body launching",
    deathPhrase: "body going limp, uncoiling",
    hitReactPhrase: "recoiling and hissing",
  },
  worm: {
    name: "worm",
    locomotion: "serpentine",
    walkPhrase: "inching forward with body contractions",
    runPhrase: "stretching and contracting rapidly",
    idlePhrase: "partially emerged, body still",
    sitPhrase: "curled in resting position",
    sleepPhrase: "curled underground",
    jumpPhrase: "stretching upward",
    deathPhrase: "body going limp",
    hitReactPhrase: "retracting quickly",
  },
  // Aquatic
  fish: {
    name: "fish",
    locomotion: "swimming",
    walkPhrase: "swimming with side-to-side tail motion",
    runPhrase: "swimming rapidly, tail beating fast",
    idlePhrase: "floating, fins moving slightly",
    sitPhrase: "resting at bottom",
    sleepPhrase: "floating still, minimal movement",
    jumpPhrase: "leaping out of water, body arched",
    swimPhrase: "swimming with undulating body motion",
    deathPhrase: "floating belly up",
    hitReactPhrase: "darting away quickly",
  },
  dolphin: {
    name: "dolphin",
    locomotion: "swimming",
    walkPhrase: "swimming with up-down tail motion",
    runPhrase: "swimming rapidly, tail beating fast",
    idlePhrase: "floating at surface",
    sitPhrase: "floating vertically",
    sleepPhrase: "floating with one eye open",
    jumpPhrase: "leaping out of water, arched body",
    swimPhrase: "swimming gracefully, up-down tail motion",
    deathPhrase: "floating motionless at surface",
    hitReactPhrase: "clicking and diving away",
  },
  shark: {
    name: "shark",
    locomotion: "swimming",
    walkPhrase: "swimming with side-to-side motion",
    runPhrase: "swimming rapidly, powerful tail strokes",
    idlePhrase: "cruising slowly, must keep moving",
    sitPhrase: "resting on ocean floor",
    sleepPhrase: "slow swimming or resting if reef shark",
    jumpPhrase: "breaching out of water",
    swimPhrase: "swimming with powerful tail motion",
    deathPhrase: "sinking slowly",
    hitReactPhrase: "thrashing and swimming away",
  },
  whale: {
    name: "whale",
    locomotion: "swimming",
    walkPhrase: "swimming with slow tail movements",
    runPhrase: "swimming faster, tail beating strongly",
    idlePhrase: "floating at surface, spouting",
    sitPhrase: "floating vertically, logging",
    sleepPhrase: "floating near surface, half brain sleeping",
    jumpPhrase: "breaching out of water, massive splash",
    swimPhrase: "gliding through water majestically",
    deathPhrase: "floating motionless",
    hitReactPhrase: "diving deep quickly",
  },
  octopus: {
    name: "octopus",
    locomotion: "swimming",
    walkPhrase: "crawling on tentacles across surface",
    runPhrase: "jet propelling through water",
    idlePhrase: "resting with tentacles spread",
    sitPhrase: "anchored to rock with tentacles",
    sleepPhrase: "hidden in den, color changing",
    jumpPhrase: "jet propelling upward",
    swimPhrase: "gliding with tentacles trailing",
    deathPhrase: "tentacles going limp",
    hitReactPhrase: "inking and jetting away",
  },
  // Multi-leg
  spider: {
    name: "spider",
    locomotion: "multi-leg",
    walkPhrase: "walking on eight legs, alternating pattern",
    runPhrase: "scurrying rapidly on eight legs",
    idlePhrase: "waiting still, legs poised",
    sitPhrase: "legs tucked in resting position",
    sleepPhrase: "still in web or hiding spot",
    jumpPhrase: "pouncing with all legs extended",
    deathPhrase: "curling legs inward",
    hitReactPhrase: "raising front legs defensively",
  },
  crab: {
    name: "crab",
    locomotion: "multi-leg",
    walkPhrase: "walking sideways on multiple legs",
    runPhrase: "scuttling sideways quickly",
    idlePhrase: "standing with claws raised",
    sitPhrase: "buried partially in sand",
    sleepPhrase: "hidden under rock, still",
    jumpPhrase: "hopping sideways",
    swimPhrase: "paddling with back legs",
    deathPhrase: "flipping onto back",
    hitReactPhrase: "snapping claws and backing away",
  },
  ant: {
    name: "ant",
    locomotion: "multi-leg",
    walkPhrase: "walking on six legs in line",
    runPhrase: "scurrying rapidly on six legs",
    idlePhrase: "standing, antennae moving",
    sitPhrase: "resting with legs tucked",
    sleepPhrase: "still in nest",
    jumpPhrase: "small hop forward",
    deathPhrase: "curling up, legs folding",
    hitReactPhrase: "running in opposite direction",
  },
  beetle: {
    name: "beetle",
    locomotion: "multi-leg",
    walkPhrase: "walking on six legs, shell gleaming",
    runPhrase: "scurrying on six legs",
    idlePhrase: "standing still, antennae waving",
    sitPhrase: "resting with legs tucked under",
    sleepPhrase: "still under leaf or bark",
    jumpPhrase: "short hop or taking flight",
    flyPhrase: "flying with wing covers open",
    deathPhrase: "flipping onto back, legs curling",
    hitReactPhrase: "playing dead or fleeing",
  },
};

export function getAnimalInfo(animalType: string): AnimalInfo | null {
  const normalized = animalType.toLowerCase().trim();
  // Check for exact match first
  if (ANIMAL_DATABASE[normalized]) {
    return ANIMAL_DATABASE[normalized];
  }
  // Check for partial matches (e.g., "brown bear" should match "bear")
  for (const [key, value] of Object.entries(ANIMAL_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return null;
}

export function getLocomotionPhrase(
  animalType: string,
  action: string
): string {
  const animal = getAnimalInfo(animalType);
  if (!animal) {
    // Generic fallback - assume quadruped for unknown animals
    const fallbacks: Record<string, string> = {
      idle: "standing still, natural pose",
      walk: "walking naturally",
      run: "running naturally",
      sit: "sitting down",
      sleep: "sleeping, lying down",
      "lie-down": "lying down, resting",
      jump: "jumping",
      fly: "flying through air",
      swim: "swimming through water",
      death: "falling, collapsing",
      "hit-react": "flinching, reacting to hit",
    };
    return fallbacks[action] || action;
  }

  switch (action) {
    case "idle":
      return animal.idlePhrase;
    case "walk":
      return animal.walkPhrase;
    case "run":
      return animal.runPhrase;
    case "sit":
      return animal.sitPhrase;
    case "sleep":
    case "lie-down":
      return animal.sleepPhrase;
    case "jump":
      return animal.jumpPhrase;
    case "fly":
      return animal.flyPhrase || animal.jumpPhrase;
    case "swim":
      return animal.swimPhrase || animal.walkPhrase;
    case "death":
      return animal.deathPhrase;
    case "hit-react":
      return animal.hitReactPhrase;
    default:
      return animal.idlePhrase;
  }
}

export function getAntiHumanoidPhrase(animalType: string): string {
  const animal = getAnimalInfo(animalType);
  if (!animal) {
    return "realistic animal anatomy, NOT anthropomorphic, NOT humanoid, NOT standing upright like a human, actual animal behavior, natural animal proportions";
  }

  const base =
    "realistic animal anatomy, NOT anthropomorphic, NOT humanoid, NOT standing on two legs like a human, actual animal behavior, natural animal proportions";

  switch (animal.locomotion) {
    case "quadruped":
      return `${base}, walking on all four legs, natural quadruped body, four-legged animal`;
    case "flying":
      return `${base}, bird anatomy with wings, feathered body, hopping on two small bird legs when on ground, NOT humanoid bird`;
    case "biped-hopping":
      return `${base}, hopping on powerful back legs like a real animal, NOT walking upright like human, animal body shape`;
    case "biped-walking":
      return `${base}, waddling on two feet like the actual animal, bird or penguin body shape, NOT humanoid`;
    case "serpentine":
      return `${base}, no legs at all, slithering snake or worm body, elongated body shape`;
    case "swimming":
      return `${base}, aquatic body shape, fins and tail, streamlined water creature body`;
    case "multi-leg":
      return `${base}, multiple legs (6 or 8), insect or arachnid body, segmented body`;
    default:
      return base;
  }
}

export function getLocomotionType(animalType: string): LocomotionType {
  const animal = getAnimalInfo(animalType);
  return animal?.locomotion || "quadruped";
}
