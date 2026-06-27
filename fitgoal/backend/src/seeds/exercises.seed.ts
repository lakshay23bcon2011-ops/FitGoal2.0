import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Exercise } from '../models/Exercise';

dotenv.config();

const exercises = [
  // ================= STRENGTH COMPOUND (16 exercises) =================
  {
    name: "Barbell Back Squat",
    category: "strength",
    muscleGroups: ["quads", "glutes", "hamstrings", "lower_back"],
    equipment: ["barbell", "squat_rack"],
    met: 6.0,
    difficulty: "intermediate",
    instructions: [
      "Place barbell on upper traps and stand with feet shoulder-width apart.",
      "Brace core, push hips back, and bend knees to lower down until thighs are parallel to ground.",
      "Drive through heels to return to standing position."
    ],
    isCompound: true
  },
  {
    name: "Conventional Deadlift",
    category: "strength",
    muscleGroups: ["hamstrings", "glutes", "lower_back", "traps", "forearms"],
    equipment: ["barbell"],
    met: 6.0,
    difficulty: "intermediate",
    instructions: [
      "Stand with mid-foot under barbell, feet hip-width apart.",
      "Bend over and grab bar with shoulder-width grip, keeping back flat.",
      "Drive legs down and pull hips forward to pull bar vertically until standing locked out."
    ],
    isCompound: true
  },
  {
    name: "Flat Barbell Bench Press",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["barbell", "bench"],
    met: 6.0,
    difficulty: "beginner",
    instructions: [
      "Lie flat on bench, eyes under bar. Grip bar slightly wider than shoulder-width.",
      "Unrack bar and lower it slowly to mid-chest level.",
      "Push bar straight up dynamically until elbows lock."
    ],
    isCompound: true
  },
  {
    name: "Overhead Press (OHP)",
    category: "strength",
    muscleGroups: ["shoulders", "triceps", "core"],
    equipment: ["barbell"],
    met: 6.0,
    difficulty: "intermediate",
    instructions: [
      "Clean barbell to shoulders, stand tall with braced core.",
      "Press bar vertically overhead by pulling head back slightly as bar passes face.",
      "Lock out bar overhead and lower back down to shoulders."
    ],
    isCompound: true
  },
  {
    name: "Barbell Row",
    category: "strength",
    muscleGroups: ["lats", "rhomboids", "rear_delts", "biceps"],
    equipment: ["barbell"],
    met: 6.0,
    difficulty: "intermediate",
    instructions: [
      "Hinge hips forward with soft knees, holding bar with overhand grip.",
      "Pull bar to lower sternum/belly button, squeezing shoulder blades together.",
      "Lower bar under control."
    ],
    isCompound: true
  },
  {
    name: "Weighted Pull-Up",
    category: "strength",
    muscleGroups: ["lats", "biceps", "upper_back"],
    equipment: ["pullup_bar", "dip_belt"],
    met: 6.0,
    difficulty: "advanced",
    instructions: [
      "Hang from bar with overhand wider-than-shoulder-width grip, weight attached to belt.",
      "Pull chest to bar by driving elbows down.",
      "Lower under control to dead hang."
    ],
    isCompound: true
  },
  {
    name: "Weighted Dip",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["dip_station", "dip_belt"],
    met: 6.0,
    difficulty: "advanced",
    instructions: [
      "Support weight on parallel bars, elbows locked, weight around waist.",
      "Lower body by bending elbows until upper arms are parallel to floor.",
      "Press back up to starting position."
    ],
    isCompound: true
  },
  {
    name: "Incline Dumbbell Bench Press",
    category: "strength",
    muscleGroups: ["upper_chest", "shoulders", "triceps"],
    equipment: ["dumbbells", "incline_bench"],
    met: 6.0,
    difficulty: "beginner",
    instructions: [
      "Lie on 30-45 degree incline bench holding dumbbells at shoulders.",
      "Press dumbbells up until arms are fully extended.",
      "Lower dumbbells back to upper chest under control."
    ],
    isCompound: true
  },
  {
    name: "Romanian Deadlift (RDL)",
    category: "strength",
    muscleGroups: ["hamstrings", "glutes", "lower_back"],
    equipment: ["barbell", "dumbbells"],
    met: 5.5,
    difficulty: "intermediate",
    instructions: [
      "Stand holding barbell at hips. Push hips back, sliding bar down thighs.",
      "Keep knees slightly bent and back flat, lowering bar until tension is felt in hamstrings.",
      "Drive hips forward to return to standing."
    ],
    isCompound: true
  },
  {
    name: "Front Squat",
    category: "strength",
    muscleGroups: ["quads", "upper_back", "core"],
    equipment: ["barbell", "squat_rack"],
    met: 6.0,
    difficulty: "advanced",
    instructions: [
      "Rest barbell on front of shoulders using clean grip or cross-arm rack.",
      "Squat deep keeping torso upright and elbows high.",
      "Drive back up to starting position."
    ],
    isCompound: true
  },
  {
    name: "Lat Pulldown (Wide Grip)",
    category: "strength",
    muscleGroups: ["lats", "upper_back", "biceps"],
    equipment: ["cable_machine"],
    met: 5.0,
    difficulty: "beginner",
    instructions: [
      "Sit at pulldown station, grip bar wide.",
      "Pull bar down to upper chest, retracting shoulder blades.",
      "Return slowly to starting position."
    ],
    isCompound: true
  },
  {
    name: "Push Press",
    category: "strength",
    muscleGroups: ["shoulders", "quads", "triceps"],
    equipment: ["barbell", "dumbbells"],
    met: 6.5,
    difficulty: "intermediate",
    instructions: [
      "Start with bar on shoulders. Dip knees slightly (10% squat).",
      "Drive legs up explosively to push bar overhead.",
      "Lock out overhead and return bar to shoulders."
    ],
    isCompound: true
  },
  {
    name: "Leg Press",
    category: "strength",
    muscleGroups: ["quads", "glutes"],
    equipment: ["leg_press_machine"],
    met: 5.5,
    difficulty: "beginner",
    instructions: [
      "Sit on machine, place feet shoulder-width apart on platform.",
      "Lower platform until knees are at 90 degrees.",
      "Push platform away, avoiding knee lockout."
    ],
    isCompound: true
  },
  {
    name: "Dumbbell Walking Lunges",
    category: "strength",
    muscleGroups: ["quads", "glutes", "hamstrings"],
    equipment: ["dumbbells"],
    met: 6.0,
    difficulty: "beginner",
    instructions: [
      "Stand holding dumbbells. Step forward, lowering rear knee close to floor.",
      "Push off front foot to take next step forward.",
      "Keep torso upright throughout walk."
    ],
    isCompound: true
  },
  {
    name: "Weighted Chin-Up",
    category: "strength",
    muscleGroups: ["lats", "biceps", "core"],
    equipment: ["pullup_bar", "dip_belt"],
    met: 6.0,
    difficulty: "advanced",
    instructions: [
      "Hang from bar with underhand shoulder-width grip.",
      "Pull chin above bar by driving elbows down.",
      "Lower under control."
    ],
    isCompound: true
  },
  {
    name: "Clean and Jerk",
    category: "strength",
    muscleGroups: ["quads", "hamstrings", "shoulders", "traps", "calves"],
    equipment: ["barbell"],
    met: 8.5,
    difficulty: "advanced",
    instructions: [
      "Pull bar from floor, catching it on shoulders in front squat position (clean).",
      "Drive bar dynamically overhead, splitting feet (jerk).",
      "Bring feet together and lock out bar overhead."
    ],
    isCompound: true
  },

  // ================= STRENGTH ISOLATION (21 exercises) =================
  {
    name: "Dumbbell Bicep Curl",
    category: "strength",
    muscleGroups: ["biceps"],
    equipment: ["dumbbells"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Stand holding dumbbells, palms forward.",
      "Curl weights up keeping elbows fixed to sides.",
      "Lower back down slowly."
    ],
    isCompound: false
  },
  {
    name: "Tricep Overhead Extension",
    category: "strength",
    muscleGroups: ["triceps"],
    equipment: ["dumbbell"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Hold dumbbell overhead with both hands.",
      "Bend elbows to lower weight behind head.",
      "Extend elbows to push weight back overhead."
    ],
    isCompound: false
  },
  {
    name: "Dumbbell Lateral Raise",
    category: "strength",
    muscleGroups: ["shoulders"],
    equipment: ["dumbbells"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Stand holding dumbbells at sides, palms facing in.",
      "Raise arms out to sides until parallel to floor.",
      "Lower under control."
    ],
    isCompound: false
  },
  {
    name: "Lying Leg Curl",
    category: "strength",
    muscleGroups: ["hamstrings"],
    equipment: ["leg_curl_machine"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Lie face down on machine, pad behind ankles.",
      "Curl legs up towards glutes, squeezing hamstrings.",
      "Lower under control."
    ],
    isCompound: false
  },
  {
    name: "Standing Calf Raise",
    category: "strength",
    muscleGroups: ["calves"],
    equipment: ["calf_raise_machine", "barbell"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Place balls of feet on block, shoulders under pads.",
      "Lower heels below block level.",
      "Raise heels as high as possible, squeezing calves."
    ],
    isCompound: false
  },
  {
    name: "Preacher Curl",
    category: "strength",
    muscleGroups: ["biceps"],
    equipment: ["ez_bar", "preacher_bench"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Sit at preacher bench, arms resting on pad.",
      "Curl bar up, keeping elbows fixed on pad.",
      "Lower bar fully under control."
    ],
    isCompound: false
  },
  {
    name: "Hammer Curl",
    category: "strength",
    muscleGroups: ["biceps", "forearms"],
    equipment: ["dumbbells"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Stand holding dumbbells with neutral grip (palms facing each other).",
      "Curl dumbbells up.",
      "Lower under control."
    ],
    isCompound: false
  },
  {
    name: "Lying Tricep Extension (Skullcrusher)",
    category: "strength",
    muscleGroups: ["triceps"],
    equipment: ["ez_bar", "bench"],
    met: 3.5,
    difficulty: "intermediate",
    instructions: [
      "Lie on bench holding EZ bar straight up.",
      "Bend elbows to lower bar to forehead.",
      "Extend elbows to push bar back up."
    ],
    isCompound: false
  },
  {
    name: "Tricep Pushdown",
    category: "strength",
    muscleGroups: ["triceps"],
    equipment: ["cable_machine"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Grip cable attachment at chest height, elbows tucked.",
      "Push bar down until arms are fully extended.",
      "Return slowly to starting position."
    ],
    isCompound: false
  },
  {
    name: "Dumbbell Rear Delt Fly",
    category: "strength",
    muscleGroups: ["rear_delts", "upper_back"],
    equipment: ["dumbbells"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Bend at hips, chest down. Hold dumbbells down, elbows soft.",
      "Raise weights out to sides, squeezing shoulder blades.",
      "Lower under control."
    ],
    isCompound: false
  },
  {
    name: "Pec Deck Fly",
    category: "strength",
    muscleGroups: ["chest"],
    equipment: ["pec_deck_machine"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Sit in machine, arms resting on pads/handles.",
      "Squeeze hands/elbows together in front of chest.",
      "Return slowly to open stretch."
    ],
    isCompound: false
  },
  {
    name: "Leg Extension",
    category: "strength",
    muscleGroups: ["quads"],
    equipment: ["leg_extension_machine"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Sit in machine, pad on shins.",
      "Extend legs until straight, squeezing quads.",
      "Lower weights slowly."
    ],
    isCompound: false
  },
  {
    name: "Cable Crossover (Fly)",
    category: "strength",
    muscleGroups: ["chest"],
    equipment: ["cable_machine"],
    met: 3.5,
    difficulty: "intermediate",
    instructions: [
      "Hold high pulleys, step forward slightly.",
      "Bring hands together in front of waist in sweeping arc.",
      "Return slowly to wide stretch."
    ],
    isCompound: false
  },
  {
    name: "Dumbbell Shrugs",
    category: "strength",
    muscleGroups: ["traps"],
    equipment: ["dumbbells"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Hold dumbbells at sides.",
      "Shrug shoulders straight up as high as possible.",
      "Lower under control."
    ],
    isCompound: false
  },
  {
    name: "Face Pulls",
    category: "strength",
    muscleGroups: ["rear_delts", "rotator_cuff", "upper_back"],
    equipment: ["cable_machine"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Hold rope on high pulley. Pull rope towards face.",
      "Flare elbows and pull hands past ears.",
      "Return slowly."
    ],
    isCompound: false
  },
  {
    name: "Barbell Wrist Curls",
    category: "strength",
    muscleGroups: ["forearms"],
    equipment: ["barbell", "bench"],
    met: 3.0,
    difficulty: "beginner",
    instructions: [
      "Rest forearms on bench, holding bar palms up.",
      "Curl wrists upward, squeezing forearms.",
      "Lower wrists slowly."
    ],
    isCompound: false
  },
  {
    name: "Cable Glute Kickback",
    category: "strength",
    muscleGroups: ["glutes"],
    equipment: ["cable_machine"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Attach ankle cuff to low cable. Kick leg backwards.",
      "Squeeze glutes at top of movement.",
      "Return foot to front slowly."
    ],
    isCompound: false
  },
  {
    name: "Cable Lateral Raise",
    category: "strength",
    muscleGroups: ["shoulders"],
    equipment: ["cable_machine"],
    met: 3.5,
    difficulty: "intermediate",
    instructions: [
      "Hold low cable behind back.",
      "Raise arm sideways until shoulder height.",
      "Lower slowly."
    ],
    isCompound: false
  },
  {
    name: "Incline Dumbbell Bicep Curl",
    category: "strength",
    muscleGroups: ["biceps"],
    equipment: ["dumbbells", "incline_bench"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Sit on incline bench holding dumbbells down.",
      "Curl weights up, keeping elbows pointed down.",
      "Lower slowly."
    ],
    isCompound: false
  },
  {
    name: "Decline Cable Pressdown",
    category: "strength",
    muscleGroups: ["triceps"],
    equipment: ["cable_machine"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Push cable down keeping elbows tight.",
      "Fully lock out triceps.",
      "Return under control."
    ],
    isCompound: false
  },
  {
    name: "Hip Adduction (Machine)",
    category: "strength",
    muscleGroups: ["inner_thighs"],
    equipment: ["adductor_machine"],
    met: 3.0,
    difficulty: "beginner",
    instructions: [
      "Sit in machine, pads inside knees.",
      "Squeeze thighs together.",
      "Return to open position slowly."
    ],
    isCompound: false
  },

  // ================= CARDIO (16 exercises) =================
  {
    name: "Running (Jogging)",
    category: "cardio",
    muscleGroups: ["quads", "glutes", "hamstrings", "calves"],
    equipment: ["none"],
    met: 8.0,
    difficulty: "beginner",
    instructions: [
      "Maintain comfortable jog at ~8km/h.",
      "Land mid-foot, stand tall, and breathe rhythmically."
    ],
    isCompound: true
  },
  {
    name: "Running (Sprint)",
    category: "cardio",
    muscleGroups: ["quads", "glutes", "calves", "hamstrings"],
    equipment: ["none"],
    met: 12.0,
    difficulty: "advanced",
    instructions: [
      "Run at maximum intensity.",
      "Pump arms and drive knees high."
    ],
    isCompound: true
  },
  {
    name: "Cycling (Outdoor)",
    category: "cardio",
    muscleGroups: ["quads", "hamstrings", "calves"],
    equipment: ["bicycle"],
    met: 7.5,
    difficulty: "beginner",
    instructions: [
      "Pedal outdoor road bike at moderate speed (~18-22 km/h).",
      "Maintain active pedaling cadence."
    ],
    isCompound: true
  },
  {
    name: "Cycling (Stationary/Spin)",
    category: "cardio",
    muscleGroups: ["quads", "hamstrings", "calves"],
    equipment: ["stationary_bike"],
    met: 7.0,
    difficulty: "beginner",
    instructions: [
      "Pedal indoor stationary bike.",
      "Vary resistance levels."
    ],
    isCompound: true
  },
  {
    name: "Jump Rope (Single Under)",
    category: "cardio",
    muscleGroups: ["calves", "shoulders", "forearms"],
    equipment: ["jump_rope"],
    met: 10.0,
    difficulty: "beginner",
    instructions: [
      "Jump rope continuously with two feet landing together.",
      "Rotate rope from wrists, not shoulders."
    ],
    isCompound: true
  },
  {
    name: "Rowing Machine (Moderate)",
    category: "cardio",
    muscleGroups: ["lats", "legs", "upper_back", "core"],
    equipment: ["rower"],
    met: 7.0,
    difficulty: "beginner",
    instructions: [
      "Drive legs first, then lean back slightly, then pull handle to chest.",
      "Return arms, lean forward, then bend knees."
    ],
    isCompound: true
  },
  {
    name: "Swimming (Freestyle)",
    category: "cardio",
    muscleGroups: ["shoulders", "lats", "chest", "core", "legs"],
    equipment: ["pool"],
    met: 8.0,
    difficulty: "intermediate",
    instructions: [
      "Swim continuous laps freestyle at moderate pace."
    ],
    isCompound: true
  },
  {
    name: "Stairmaster (Stair Climbing)",
    category: "cardio",
    muscleGroups: ["glutes", "quads", "calves"],
    equipment: ["stair_climber"],
    met: 9.0,
    difficulty: "beginner",
    instructions: [
      "Climb steps at steady pace, keeping spine upright.",
      "Press through whole foot to protect knees."
    ],
    isCompound: true
  },
  {
    name: "Walking (Brisk)",
    category: "cardio",
    muscleGroups: ["quads", "hamstrings", "calves"],
    equipment: ["none"],
    met: 4.5,
    difficulty: "beginner",
    instructions: [
      "Walk briskly at ~5.5-6.0 km/h."
    ],
    isCompound: true
  },
  {
    name: "Mountain Hiking",
    category: "cardio",
    muscleGroups: ["legs", "glutes", "lower_back"],
    equipment: ["none"],
    met: 6.5,
    difficulty: "intermediate",
    instructions: [
      "Walk uphill on natural trails with moderate gear."
    ],
    isCompound: true
  },
  {
    name: "Elliptical Trainer",
    category: "cardio",
    muscleGroups: ["quads", "glutes", "chest", "lats"],
    equipment: ["elliptical"],
    met: 5.0,
    difficulty: "beginner",
    instructions: [
      "Pedal smooth stride, pulling/pushing handles for full-body load."
    ],
    isCompound: true
  },
  {
    name: "Dance Fitness (Zumba)",
    category: "cardio",
    muscleGroups: ["legs", "core", "shoulders"],
    equipment: ["none"],
    met: 6.0,
    difficulty: "beginner",
    instructions: [
      "Follow rhythmic choreography."
    ],
    isCompound: true
  },
  {
    name: "Shadow Boxing",
    category: "cardio",
    muscleGroups: ["shoulders", "arms", "core", "legs"],
    equipment: ["none"],
    met: 5.5,
    difficulty: "beginner",
    instructions: [
      "Throw continuous punches, blocks, and footwork in mirror."
    ],
    isCompound: true
  },
  {
    name: "Punching Bag Session",
    category: "cardio",
    muscleGroups: ["shoulders", "chest", "arms", "core"],
    equipment: ["heavy_bag", "boxing_gloves"],
    met: 7.5,
    difficulty: "intermediate",
    instructions: [
      "Throw combos on heavy bag, moving constantly."
    ],
    isCompound: true
  },
  {
    name: "Cardio Aerobics",
    category: "cardio",
    muscleGroups: ["legs", "calves", "core"],
    equipment: ["none"],
    met: 6.5,
    difficulty: "beginner",
    instructions: [
      "Perform high-energy callisthenic moves to music."
    ],
    isCompound: true
  },
  {
    name: "Treadmill Walk (Incline)",
    category: "cardio",
    muscleGroups: ["glutes", "hamstrings", "calves"],
    equipment: ["treadmill"],
    met: 6.0,
    difficulty: "beginner",
    instructions: [
      "Walk at 5km/h with incline set to 10-12%."
    ],
    isCompound: true
  },

  // ================= HIIT (15 exercises) =================
  {
    name: "Burpee",
    category: "hiit",
    muscleGroups: ["full_body", "chest", "quads", "core"],
    equipment: ["none"],
    met: 10.0,
    difficulty: "intermediate",
    instructions: [
      "Drop to push-up position, touch chest to floor.",
      "Jump feet back in, stand up, and jump explosively with hands overhead."
    ],
    isCompound: true
  },
  {
    name: "Plyometric Box Jump",
    category: "hiit",
    muscleGroups: ["quads", "glutes", "calves"],
    equipment: ["plyo_box"],
    met: 9.0,
    difficulty: "intermediate",
    instructions: [
      "Stand before box, squat slightly.",
      "Jump onto box, landing softly in partial squat.",
      "Step down carefully."
    ],
    isCompound: true
  },
  {
    name: "Mountain Climber",
    category: "hiit",
    muscleGroups: ["core", "shoulders", "quads"],
    equipment: ["none"],
    met: 8.0,
    difficulty: "beginner",
    instructions: [
      "Start in push-up plank. Drive knee to chest.",
      "Alternate knees rapidly while maintaining straight spine."
    ],
    isCompound: true
  },
  {
    name: "Kettlebell Swing",
    category: "hiit",
    muscleGroups: ["glutes", "hamstrings", "lower_back", "shoulders"],
    equipment: ["kettlebell"],
    met: 9.0,
    difficulty: "intermediate",
    instructions: [
      "Hinge hips back holding kettlebell. Snap hips forward explosively.",
      "Let kettlebell swing to shoulder height using hip momentum, not arms."
    ],
    isCompound: true
  },
  {
    name: "Battle Ropes",
    category: "hiit",
    muscleGroups: ["shoulders", "arms", "back", "core"],
    equipment: ["battle_ropes"],
    met: 8.0,
    difficulty: "beginner",
    instructions: [
      "Hold rope ends, squat slightly. Wave ropes up and down rapidly to create waves."
    ],
    isCompound: true
  },
  {
    name: "Jumping Jacks",
    category: "hiit",
    muscleGroups: ["calves", "shoulders"],
    equipment: ["none"],
    met: 8.0,
    difficulty: "beginner",
    instructions: [
      "Jump feet out while bringing hands overhead, then jump back to start."
    ],
    isCompound: true
  },
  {
    name: "Dumbbell Thruster",
    category: "hiit",
    muscleGroups: ["quads", "shoulders", "triceps", "glutes"],
    equipment: ["dumbbells"],
    met: 9.5,
    difficulty: "intermediate",
    instructions: [
      "Squat low holding dumbbells at shoulders.",
      "Stand up explosively, pressing weights overhead in one motion."
    ],
    isCompound: true
  },
  {
    name: "Prowler Sled Push",
    category: "hiit",
    muscleGroups: ["quads", "glutes", "calves", "core"],
    equipment: ["prowler_sled"],
    met: 10.0,
    difficulty: "intermediate",
    instructions: [
      "Lean into sled, pushing handles low. Sprint forward driving heels down."
    ],
    isCompound: true
  },
  {
    name: "Tire Flips",
    category: "hiit",
    muscleGroups: ["legs", "back", "shoulders", "biceps"],
    equipment: ["heavy_tire"],
    met: 10.0,
    difficulty: "advanced",
    instructions: [
      "Squat deep under tire. Drive forward and lift tire up.",
      "Push tire over in one continuous explosive motion."
    ],
    isCompound: true
  },
  {
    name: "Plank Jacks",
    category: "hiit",
    muscleGroups: ["core", "shoulders"],
    equipment: ["none"],
    met: 7.5,
    difficulty: "beginner",
    instructions: [
      "Start in pushup position. Jump feet wide, then jump feet back together."
    ],
    isCompound: true
  },
  {
    name: "Tuck Jump",
    category: "hiit",
    muscleGroups: ["quads", "glutes", "core"],
    equipment: ["none"],
    met: 10.0,
    difficulty: "advanced",
    instructions: [
      "Jump straight up as high as possible, bringing knees to chest in air.",
      "Land softly."
    ],
    isCompound: true
  },
  {
    name: "Russian Twists (Weighted)",
    category: "hiit",
    muscleGroups: ["core", "abs", "obliques"],
    equipment: ["weight_plate", "dumbbell"],
    met: 6.0,
    difficulty: "beginner",
    instructions: [
      "Sit on floor, knees bent, feet elevated slightly.",
      "Twist torso left and right, touching weight to ground."
    ],
    isCompound: true
  },
  {
    name: "High Knees (Sprint-in-place)",
    category: "hiit",
    muscleGroups: ["quads", "calves", "core"],
    equipment: ["none"],
    met: 9.0,
    difficulty: "beginner",
    instructions: [
      "Run in place, driving knees to waist height rapidly."
    ],
    isCompound: true
  },
  {
    name: "Kettlebell Clean & Press",
    category: "hiit",
    muscleGroups: ["shoulders", "hamstrings", "glutes", "back"],
    equipment: ["kettlebell"],
    met: 9.0,
    difficulty: "intermediate",
    instructions: [
      "Clean kettlebell to rack position, then press it overhead.",
      "Return to hang position."
    ],
    isCompound: true
  },
  {
    name: "Bear Crawls",
    category: "hiit",
    muscleGroups: ["shoulders", "core", "quads", "chest"],
    equipment: ["none"],
    met: 8.0,
    difficulty: "intermediate",
    instructions: [
      "Walk on hands and toes, knees hovering just above ground, back flat."
    ],
    isCompound: true
  },

  // ================= YOGA (11 exercises) =================
  {
    name: "Sun Salutation (Surya Namaskar Hatha)",
    category: "yoga",
    muscleGroups: ["full_body", "shoulders", "spine", "hamstrings"],
    equipment: ["yoga_mat"],
    met: 4.0,
    difficulty: "beginner",
    instructions: [
      "Cycle through the 12 classic postures slowly, focusing on breath."
    ],
    isCompound: true
  },
  {
    name: "Warrior I Pose (Virabhadrasana I)",
    category: "yoga",
    muscleGroups: ["quads", "shoulders", "hip_flexors"],
    equipment: ["yoga_mat"],
    met: 2.5,
    difficulty: "beginner",
    instructions: [
      "Lunge forward with front knee at 90 degrees, rear foot turned 45 degrees.",
      "Reach arms overhead and look up, stretching chest."
    ],
    isCompound: true
  },
  {
    name: "Warrior II Pose (Virabhadrasana II)",
    category: "yoga",
    muscleGroups: ["quads", "shoulders", "hips"],
    equipment: ["yoga_mat"],
    met: 2.5,
    difficulty: "beginner",
    instructions: [
      "Step feet wide, front knee bent 90 degrees. Extend arms to sides.",
      "Gaze over front hand, holding spine straight."
    ],
    isCompound: true
  },
  {
    name: "Downward Facing Dog (Adho Mukha Svanasana)",
    category: "yoga",
    muscleGroups: ["shoulders", "hamstrings", "calves", "spine"],
    equipment: ["yoga_mat"],
    met: 3.0,
    difficulty: "beginner",
    instructions: [
      "Form inverted 'V' with body, hips high.",
      "Press hands down and drive heels towards floor."
    ],
    isCompound: true
  },
  {
    name: "Cobra Pose (Bhujangasana)",
    category: "yoga",
    muscleGroups: ["lower_back", "spine", "chest"],
    equipment: ["yoga_mat"],
    met: 2.0,
    difficulty: "beginner",
    instructions: [
      "Lie face down, place hands under shoulders.",
      "Lift chest forward and upward using back muscles, elbows slightly bent."
    ],
    isCompound: false
  },
  {
    name: "Tree Pose (Vrikshasana)",
    category: "yoga",
    muscleGroups: ["calves", "ankles", "core"],
    equipment: ["yoga_mat"],
    met: 2.0,
    difficulty: "beginner",
    instructions: [
      "Stand on one leg, place other foot on inner thigh or calf.",
      "Bring hands to prayer position at chest or reach overhead."
    ],
    isCompound: false
  },
  {
    name: "Child's Pose (Balasana)",
    category: "yoga",
    muscleGroups: ["lower_back", "hips", "shoulders"],
    equipment: ["yoga_mat"],
    met: 1.5,
    difficulty: "beginner",
    instructions: [
      "Kneel on floor, sit on heels, and fold forward resting forehead on mat.",
      "Extend arms forward."
    ],
    isCompound: false
  },
  {
    name: "Triangle Pose (Trikonasana)",
    category: "yoga",
    muscleGroups: ["obliques", "hamstrings", "chest"],
    equipment: ["yoga_mat"],
    met: 2.5,
    difficulty: "beginner",
    instructions: [
      "Stand wide. Turn front foot out, reach forward, and hinge down sideways.",
      "Extend top arm straight up."
    ],
    isCompound: true
  },
  {
    name: "Bridge Pose (Setu Bandhasana)",
    category: "yoga",
    muscleGroups: ["glutes", "hamstrings", "lower_back"],
    equipment: ["yoga_mat"],
    met: 2.5,
    difficulty: "beginner",
    instructions: [
      "Lie on back, knees bent, feet flat.",
      "Lift hips up towards ceiling, clasping hands under back."
    ],
    isCompound: true
  },
  {
    name: "Corpse Pose (Savasana)",
    category: "yoga",
    muscleGroups: ["none"],
    equipment: ["yoga_mat"],
    met: 1.0,
    difficulty: "beginner",
    instructions: [
      "Lie flat on back, limbs relaxed, breathing naturally.",
      "Meditate silently."
    ],
    isCompound: false
  },
  {
    name: "Crow Pose (Bakasana)",
    category: "yoga",
    muscleGroups: ["wrists", "shoulders", "core"],
    equipment: ["yoga_mat"],
    met: 3.5,
    difficulty: "advanced",
    instructions: [
      "Squat down. Place hands flat, place knees on back of upper arms.",
      "Shift weight forward and lift feet off ground, balancing on hands."
    ],
    isCompound: true
  },

  // ================= INDIAN SPORTS (10 exercises) =================
  {
    name: "Surya Namaskar (Traditional Fast)",
    category: "yoga",
    muscleGroups: ["full_body", "shoulders", "legs", "core"],
    equipment: ["none"],
    met: 5.5,
    difficulty: "intermediate",
    instructions: [
      "Perform the 12 sun salutation postures at a fast, cardio-like pace."
    ],
    isCompound: true
  },
  {
    name: "Mallakhamb (Pole/Rope)",
    category: "sports",
    muscleGroups: ["core", "shoulders", "forearms", "back", "legs"],
    equipment: ["wooden_pole"],
    met: 7.5,
    difficulty: "advanced",
    instructions: [
      "Perform gymnastics, grips, and balances on a vertical wooden pole."
    ],
    isCompound: true
  },
  {
    name: "Kabaddi (Match play)",
    category: "sports",
    muscleGroups: ["quads", "glutes", "core", "calves"],
    equipment: ["none"],
    met: 8.0,
    difficulty: "intermediate",
    instructions: [
      "Participate in Kabaddi match tags, running, raiding, and tackling."
    ],
    isCompound: true
  },
  {
    name: "Kho-Kho (Match play)",
    category: "sports",
    muscleGroups: ["quads", "calves", "glutes", "core"],
    equipment: ["none"],
    met: 7.5,
    difficulty: "intermediate",
    instructions: [
      "Participate in chase-and-sit team sport requiring quick sprints and turns."
    ],
    isCompound: true
  },
  {
    name: "Kushti (Traditional Mud Wrestling)",
    category: "sports",
    muscleGroups: ["full_body", "core", "shoulders", "neck", "forearms"],
    equipment: ["wrestling_pit"],
    met: 9.0,
    difficulty: "advanced",
    instructions: [
      "Wrestle on clay soil using traditional lockups, pins, and throws."
    ],
    isCompound: true
  },
  {
    name: "Gilli-Danda",
    category: "sports",
    muscleGroups: ["shoulders", "forearms", "legs"],
    equipment: ["wooden_sticks"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Strike smaller danda stick with larger stick, sprinting to base."
    ],
    isCompound: false
  },
  {
    name: "Lagori (Seven Stones)",
    category: "sports",
    muscleGroups: ["arms", "shoulders", "legs", "core"],
    equipment: ["stones", "ball"],
    met: 5.0,
    difficulty: "beginner",
    instructions: [
      "Throw ball to hit stones, sprint to stack them before being tagged."
    ],
    isCompound: true
  },
  {
    name: "Kalaripayattu (Traditional Martial Art)",
    category: "sports",
    muscleGroups: ["legs", "hips", "shoulders", "spine", "core"],
    equipment: ["wooden_sword", "shield"],
    met: 8.0,
    difficulty: "advanced",
    instructions: [
      "Perform high kicks, strikes, leaps, and stances of Kerala martial arts."
    ],
    isCompound: true
  },
  {
    name: "Vallam Kali (Snake Boat Racing)",
    category: "sports",
    muscleGroups: ["lats", "shoulders", "biceps", "core"],
    equipment: ["oar", "boat"],
    met: 9.0,
    difficulty: "advanced",
    instructions: [
      "Paddle snake boat in rhythm with high-stroke counts."
    ],
    isCompound: true
  },
  {
    name: "Kushti Gada Training (Indian Club)",
    category: "sports",
    muscleGroups: ["shoulders", "forearms", "rotator_cuff", "core"],
    equipment: ["gada_club"],
    met: 6.5,
    difficulty: "intermediate",
    instructions: [
      "Swing heavy Gada club behind back and around neck in circular patterns."
    ],
    isCompound: true
  },

  // ================= BODYWEIGHT (11 exercises) =================
  {
    name: "Standard Push-Up",
    category: "strength",
    muscleGroups: ["chest", "shoulders", "triceps", "core"],
    equipment: ["none"],
    met: 4.0,
    difficulty: "beginner",
    instructions: [
      "Start in high plank, hands slightly wider than shoulder-width.",
      "Lower body until chest touches floor.",
      "Push back up to starting position."
    ],
    isCompound: true
  },
  {
    name: "Diamond Push-Up",
    category: "strength",
    muscleGroups: ["triceps", "inner_chest", "shoulders"],
    equipment: ["none"],
    met: 4.5,
    difficulty: "intermediate",
    instructions: [
      "Form diamond shape with index fingers and thumbs on floor under chest.",
      "Lower chest to hands, then push straight up."
    ],
    isCompound: true
  },
  {
    name: "Bodyweight Squat",
    category: "strength",
    muscleGroups: ["quads", "glutes", "calves"],
    equipment: ["none"],
    met: 4.0,
    difficulty: "beginner",
    instructions: [
      "Stand shoulder-width. Lower hips down to parallel.",
      "Drive back to standing."
    ],
    isCompound: true
  },
  {
    name: "Elbow Plank",
    category: "flexibility", // categorized as flexibility/stability
    muscleGroups: ["core", "shoulders"],
    equipment: ["none"],
    met: 2.5,
    difficulty: "beginner",
    instructions: [
      "Rest on forearms and toes, keeping body in straight line.",
      "Contract abs and hold."
    ],
    isCompound: false
  },
  {
    name: "Side Plank",
    category: "flexibility",
    muscleGroups: ["obliques", "shoulders"],
    equipment: ["none"],
    met: 2.5,
    difficulty: "beginner",
    instructions: [
      "Rest on one elbow sideways, legs stacked.",
      "Lift hips off ground, holding straight line."
    ],
    isCompound: false
  },
  {
    name: "Bench Dips",
    category: "strength",
    muscleGroups: ["triceps", "chest"],
    equipment: ["bench"],
    met: 3.8,
    difficulty: "beginner",
    instructions: [
      "Place hands on edge of bench, feet extended forward.",
      "Lower hips by bending elbows, then press straight up."
    ],
    isCompound: true
  },
  {
    name: "L-Sit Hold",
    category: "strength",
    muscleGroups: ["core", "abs", "hip_flexors", "shoulders"],
    equipment: ["parallettes", "dip_bars"],
    met: 5.0,
    difficulty: "advanced",
    instructions: [
      "Support weight on bars. Lift legs straight out parallel to ground (forming 'L').",
      "Hold position."
    ],
    isCompound: true
  },
  {
    name: "Handstand Push-Up (Wall Supported)",
    category: "strength",
    muscleGroups: ["shoulders", "triceps", "core"],
    equipment: ["wall"],
    met: 7.0,
    difficulty: "advanced",
    instructions: [
      "Kick up into handstand against wall.",
      "Lower head slowly to ground by bending elbows.",
      "Press back up to lock out."
    ],
    isCompound: true
  },
  {
    name: "Hanging Leg Raise",
    category: "strength",
    muscleGroups: ["core", "abs", "grip"],
    equipment: ["pullup_bar"],
    met: 4.0,
    difficulty: "intermediate",
    instructions: [
      "Hang from pullup bar. Raise legs straight out to 90 degrees.",
      "Lower legs back down slowly, avoiding swinging."
    ],
    isCompound: true
  },
  {
    name: "Bicycle Crunches",
    category: "strength",
    muscleGroups: ["core", "abs", "obliques"],
    equipment: ["none"],
    met: 4.0,
    difficulty: "beginner",
    instructions: [
      "Lie on back, hands behind head. Bring elbow to opposite knee.",
      "Alternate sides rapidly in pedaling motion."
    ],
    isCompound: true
  },
  {
    name: "Bodyweight Pull-Up (Regular)",
    category: "strength",
    muscleGroups: ["lats", "upper_back", "biceps"],
    equipment: ["pullup_bar"],
    met: 4.5,
    difficulty: "intermediate",
    instructions: [
      "Hang from bar with overhand grip.",
      "Pull chest to bar.",
      "Lower slowly to dead hang."
    ],
    isCompound: true
  },
  {
    name: "Hindu Push-Up (Dand)",
    category: "strength",
    muscleGroups: ["chest", "shoulders", "triceps", "core", "spine"],
    equipment: ["none"],
    met: 5.0,
    difficulty: "intermediate",
    instructions: [
      "Start in downward dog position with hips high.",
      "Swoop chest down toward floor between hands, bending elbows.",
      "Arch back up into upward dog position, then push hips back to start."
    ],
    isCompound: true
  },
  {
    name: "Hindu Squat (Baithak)",
    category: "strength",
    muscleGroups: ["quads", "glutes", "calves"],
    equipment: ["none"],
    met: 5.0,
    difficulty: "beginner",
    instructions: [
      "Stand with feet shoulder-width apart, arms at sides.",
      "Lower into squat while lifting heels slightly and sweeping arms back.",
      "Drive back up while swinging arms forward and returning heels flat."
    ],
    isCompound: true
  },
  {
    name: "Incline Dumbbell Fly",
    category: "strength",
    muscleGroups: ["chest", "shoulders"],
    equipment: ["dumbbells", "incline_bench"],
    met: 3.5,
    difficulty: "beginner",
    instructions: [
      "Lie on incline bench holding dumbbells overhead, palms facing in.",
      "Lower weights out to sides in wide arc, keeping elbows slightly bent.",
      "Squeeze chest to pull weights back to starting position."
    ],
    isCompound: false
  },
  {
    name: "Barbell Hip Thrust",
    category: "strength",
    muscleGroups: ["glutes", "hamstrings", "core"],
    equipment: ["barbell", "bench"],
    met: 6.0,
    difficulty: "intermediate",
    instructions: [
      "Sit on floor with upper back against bench, barbell resting across hips.",
      "Drive through heels and squeeze glutes to lift hips until thighs are parallel to ground.",
      "Lower hips back down under control."
    ],
    isCompound: true
  },
  {
    name: "Kettlebell Goblet Squat",
    category: "strength",
    muscleGroups: ["quads", "glutes", "core", "hamstrings"],
    equipment: ["kettlebell"],
    met: 5.5,
    difficulty: "beginner",
    instructions: [
      "Hold kettlebell by horns close to chest.",
      "Squat down keeping torso upright and elbows inside knees.",
      "Drive through heels to return to standing."
    ],
    isCompound: true
  },
  {
    name: "Arnold Press",
    category: "strength",
    muscleGroups: ["shoulders", "triceps"],
    equipment: ["dumbbells"],
    met: 4.0,
    difficulty: "intermediate",
    instructions: [
      "Sit or stand holding dumbbells at collarbone level, palms facing you.",
      "Press dumbbells overhead while rotating wrists so palms face forward at top.",
      "Reverse rotation while lowering back to start."
    ],
    isCompound: true
  },
  {
    name: "Dumbbell Pullover",
    category: "strength",
    muscleGroups: ["chest", "lats", "triceps"],
    equipment: ["dumbbell", "bench"],
    met: 4.0,
    difficulty: "intermediate",
    instructions: [
      "Lie perpendicular on bench, shoulders supported, holding dumbbell overhead with both hands.",
      "Lower dumbbell backward behind head, keeping arms straight and core tight.",
      "Pull weight back over chest using chest and lats."
    ],
    isCompound: true
  },
  {
    name: "Close-Grip Bench Press",
    category: "strength",
    muscleGroups: ["triceps", "chest", "shoulders"],
    equipment: ["barbell", "bench"],
    met: 5.5,
    difficulty: "intermediate",
    instructions: [
      "Lie on flat bench. Grip bar with hands shoulder-width or slightly narrower.",
      "Lower bar slowly to lower chest, keeping elbows close to body.",
      "Press bar straight up, emphasizing triceps lockout."
    ],
    isCompound: true
  },
  {
    name: "HIIT Sprint Intervals",
    category: "hiit",
    muscleGroups: ["quads", "hamstrings", "calves", "glutes"],
    equipment: ["none"],
    met: 11.5,
    difficulty: "advanced",
    instructions: [
      "Sprint at maximum effort for 30 seconds.",
      "Walk or jog slowly for 60 seconds to recover.",
      "Repeat for desired rounds."
    ],
    isCompound: true
  },
  {
    name: "Assault Bike Sprint",
    category: "hiit",
    muscleGroups: ["quads", "glutes", "shoulders", "arms"],
    equipment: ["stationary_bike"],
    met: 12.0,
    difficulty: "advanced",
    instructions: [
      "Pedal and push handles at maximum intensity.",
      "Maintain high speed for short intervals (e.g., 20 seconds on, 40 off)."
    ],
    isCompound: true
  },
  {
    name: "Pigeon Pose (Kapotasana)",
    category: "yoga",
    muscleGroups: ["hips", "glutes", "lower_back"],
    equipment: ["yoga_mat"],
    met: 2.0,
    difficulty: "intermediate",
    instructions: [
      "Bring one knee forward and place it behind wrist, extending other leg straight back.",
      "Keep hips square and fold torso forward over front leg if comfortable."
    ],
    isCompound: false
  },
  {
    name: "Camel Pose (Ustrasana)",
    category: "yoga",
    muscleGroups: ["spine", "chest", "shoulders", "quads"],
    equipment: ["yoga_mat"],
    met: 2.5,
    difficulty: "intermediate",
    instructions: [
      "Kneel with knees hip-width apart. Place hands on lower back, fingers pointing down.",
      "Arch spine back, reaching hands to heels while pushing hips forward."
    ],
    isCompound: true
  },
  {
    name: "Warrior III Pose (Virabhadrasana III)",
    category: "yoga",
    muscleGroups: ["hamstrings", "glutes", "core", "ankles"],
    equipment: ["yoga_mat"],
    met: 3.0,
    difficulty: "intermediate",
    instructions: [
      "Stand on one leg. Tilt torso forward while extending other leg straight back.",
      "Reach arms forward, forming horizontal line from hands to heel."
    ],
    isCompound: true
  },
  {
    name: "Mudgar Swinging (Karla)",
    category: "sports",
    muscleGroups: ["shoulders", "wrists", "forearms", "core"],
    equipment: ["mudgar_clubs"],
    met: 6.0,
    difficulty: "intermediate",
    instructions: [
      "Hold heavy wooden Mudgar club. Swing it around shoulder and head in circular patterns.",
      "Maintain active core and wrist stability."
    ],
    isCompound: true
  },
  {
    name: "Dangal Baithak (Akhara Squats)",
    category: "sports",
    muscleGroups: ["quads", "glutes", "calves"],
    equipment: ["none"],
    met: 5.5,
    difficulty: "intermediate",
    instructions: [
      "Perform deep squats in Akhara style, focusing on fast tempo and high repetitions.",
      "Keep torso erect and heels grounded."
    ],
    isCompound: true
  },
  {
    name: "Gada 360 Swing",
    category: "sports",
    muscleGroups: ["shoulders", "core", "grip", "back"],
    equipment: ["gada_club"],
    met: 7.0,
    difficulty: "advanced",
    instructions: [
      "Hold Gada club with both hands. Swing it over shoulder, letting it circle behind back.",
      "Pull it forward over opposite shoulder using core and shoulder strength."
    ],
    isCompound: true
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitgoal';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Exercises seeding...');

    // Clear collection
    await Exercise.deleteMany({});
    console.log('Cleared existing Exercise documents.');

    // Insert seeds
    const created = await Exercise.create(exercises);
    console.log(`Successfully seeded ${created.length} exercises.`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Seeding Exercises failed:', error);
    process.exit(1);
  }
};

seedDB();
