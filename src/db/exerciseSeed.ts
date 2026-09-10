import { generateId } from "../lib/id";
import type { Exercise } from "../types";
import { getDb } from "./database";

export const EXERCISE_CATEGORIES = [
  "Bryst",
  "Ryg",
  "Ben",
  "Skuldre",
  "Biceps",
  "Triceps",
  "Mave",
  "Baller",
  "Underarme",
  "Helkrop",
] as const;

const DEFAULT_EXERCISES: { name: string; category: string; description: string }[] = [
  // Bryst
  {
    name: "Flad bænkpres med vægtstang",
    category: "Bryst",
    description: "Klassisk pres på flad bænk — den tungeste basisøvelse for brystet.",
  },
  {
    name: "Skrå bænkpres med vægtstang",
    category: "Bryst",
    description: "Bænken hælder opad, så det øverste bryst tager mest af arbejdet.",
  },
  {
    name: "Flad bænkpres med håndvægte",
    category: "Bryst",
    description: "Som flad bænkpres, men hver arm arbejder for sig og får længere bevægebane.",
  },
  {
    name: "Skrå bænkpres med håndvægte",
    category: "Bryst",
    description: "Skrå pres med håndvægte — rammer øvre bryst og tillader dyb strækning.",
  },
  {
    name: "Dips (bryst-fokus)",
    category: "Bryst",
    description: "Sænk dig mellem to barrer med overkroppen læn frem, så brystet trækker læsset.",
  },
  {
    name: "Cable crossover",
    category: "Bryst",
    description: "Før kablerne sammen foran brystet i en bue — konstant træk hele vejen.",
  },
  {
    name: "Pec deck (fly-maskine)",
    category: "Bryst",
    description: "Siddende fly i maskine; isolerer brystet uden at skulle balancere vægten.",
  },
  {
    name: "Armstrækninger",
    category: "Bryst",
    description: "Push-ups med egen kropsvægt — bryst, triceps og en stabil kropskerne.",
  },
  {
    name: "Incline dumbbell fly",
    category: "Bryst",
    description: "Åbn armene ud til siden på skrå bænk og saml dem igen i en bue.",
  },
  {
    name: "Decline bænkpres",
    category: "Bryst",
    description: "Bænken hælder nedad, hvilket flytter arbejdet ned i det nedre bryst.",
  },
  // Ryg
  {
    name: "Dødløft",
    category: "Ryg",
    description: "Løft stangen fra gulvet med rank ryg — hele bagsiden arbejder på én gang.",
  },
  {
    name: "Kropshævninger",
    category: "Ryg",
    description: "Træk dig op til stangen med egen kropsvægt; bredde i ryggen og stærke lats.",
  },
  {
    name: "Lat pulldown",
    category: "Ryg",
    description: "Træk stangen ned mod brystet — samme mønster som kropshævninger, men justerbar vægt.",
  },
  {
    name: "Stående roning med vægtstang",
    category: "Ryg",
    description: "Bøj i hoften og ro stangen ind mod maven for tykkelse i midterryggen.",
  },
  {
    name: "Enarmet roning med håndvægt",
    category: "Ryg",
    description: "Én arm ad gangen med støtte på bænken; god til at rette skævheder op.",
  },
  {
    name: "Siddende cable-roning",
    category: "Ryg",
    description: "Træk håndtaget ind mod maven og klem skulderbladene sammen til sidst.",
  },
  {
    name: "T-bar roning",
    category: "Ryg",
    description: "Roning med stangen forankret i den ene ende — tillader tung vægt i midterryggen.",
  },
  {
    name: "Rygrejsning",
    category: "Ryg",
    description: "Rejs overkroppen fra bøjet stilling og styrk lænd og strækmuskler.",
  },
  {
    name: "Face pull",
    category: "Ryg",
    description: "Træk rebet mod ansigtet med albuerne højt — modvægt til alt pressearbejde.",
  },
  {
    name: "Rumænsk dødløft",
    category: "Ryg",
    description: "Sænk stangen langs benene med næsten strakte knæ; stræk i baglår og baller.",
  },
  // Ben
  {
    name: "Squat med vægtstang",
    category: "Ben",
    description: "Stangen på ryggen, sæt dig ned og rejs dig — den vigtigste benøvelse.",
  },
  {
    name: "Front squat",
    category: "Ben",
    description: "Stangen hviler foran på skuldrene, hvilket flytter arbejdet ud i forlårene.",
  },
  {
    name: "Benpres",
    category: "Ben",
    description: "Pres pladen væk i maskinen; tungt benarbejde uden belastning på ryggen.",
  },
  {
    name: "Udfald",
    category: "Ben",
    description: "Træd frem og sænk bagerste knæ — ét ben ad gangen, både styrke og balance.",
  },
  {
    name: "Goblet squat",
    category: "Ben",
    description: "Squat med en håndvægt eller kettlebell holdt ved brystet; god til at lære teknikken.",
  },
  {
    name: "Leg extension",
    category: "Ben",
    description: "Stræk knæene i maskinen og isolér forlårene helt.",
  },
  {
    name: "Liggende leg curl",
    category: "Ben",
    description: "Bøj knæene mod ballerne i maskinen — direkte arbejde for baglårene.",
  },
  {
    name: "Bulgarian split squat",
    category: "Ben",
    description: "Bagerste fod på en bænk; brutalt étbens-arbejde for lår og baller.",
  },
  {
    name: "Sumo squat",
    category: "Ben",
    description: "Bred stand med tæerne udad, hvilket trækker inderlår og baller mere med.",
  },
  {
    name: "Stående tåhæv",
    category: "Ben",
    description: "Hæv dig op på tæerne og sænk langsomt — direkte arbejde for lægmusklerne.",
  },
  // Skuldre
  {
    name: "Military press",
    category: "Skuldre",
    description: "Pres stangen over hovedet fra stående — grundøvelsen for stærke skuldre.",
  },
  {
    name: "Dumbbell shoulder press",
    category: "Skuldre",
    description: "Pres over hovedet med håndvægte, så hver skulder arbejder frit.",
  },
  {
    name: "Sidelateral rejsning",
    category: "Skuldre",
    description: "Løft armene ud til siden til skulderhøjde; bredden i skulderen.",
  },
  {
    name: "Front raise",
    category: "Skuldre",
    description: "Løft vægten lige frem til skulderhøjde og ram forreste skulderhoved.",
  },
  {
    name: "Rear delt fly",
    category: "Skuldre",
    description: "Foroverbøjet fly ud til siden — bagerste skulder og øvre ryg.",
  },
  {
    name: "Arnold press",
    category: "Skuldre",
    description: "Pres over hovedet med en drejning i håndleddet, så hele skulderen rammes.",
  },
  {
    name: "Upright row",
    category: "Skuldre",
    description: "Træk stangen op langs kroppen til brysthøjde med albuerne højt.",
  },
  {
    name: "Shrugs",
    category: "Skuldre",
    description: "Træk skuldrene lige op mod ørerne — isoleret arbejde for trapezius.",
  },
  {
    name: "Cable lateral raise",
    category: "Skuldre",
    description: "Sidehævning i kabel, hvor trækket er konstant hele vejen op.",
  },
  {
    name: "Landmine press",
    category: "Skuldre",
    description: "Pres den forankrede stang skråt opad; skulder-venligt pressearbejde.",
  },
  // Biceps
  {
    name: "Biceps curl med vægtstang",
    category: "Biceps",
    description: "Krøl stangen op mod brystet — den tungeste basisøvelse for biceps.",
  },
  {
    name: "Biceps curl med håndvægte",
    category: "Biceps",
    description: "Curl med én håndvægt i hver hånd, så armene arbejder uafhængigt.",
  },
  {
    name: "Hammer curl",
    category: "Biceps",
    description: "Curl med neutralt greb, tommelen opad; rammer også underarmen.",
  },
  {
    name: "Koncentreret curl",
    category: "Biceps",
    description: "Albuen støttet mod inderlåret — maksimal isolation af biceps.",
  },
  {
    name: "Preacher curl",
    category: "Biceps",
    description: "Overarmen hviler på skråpuden, så du ikke kan svinge vægten op.",
  },
  {
    name: "Cable curl",
    category: "Biceps",
    description: "Curl i kabel med jævnt træk fra start til slut.",
  },
  {
    name: "Incline dumbbell curl",
    category: "Biceps",
    description: "Curl liggende tilbagelænet, hvilket giver ekstra stræk i biceps.",
  },
  {
    name: "EZ-bar curl",
    category: "Biceps",
    description: "Curl med bølget stang — nemmere ved håndled og albuer end en lige stang.",
  },
  {
    name: "Spider curl",
    category: "Biceps",
    description: "Hæng armene lodret ned over en skråbænk og curl; ingen snyd muligt.",
  },
  {
    name: "21's biceps curl",
    category: "Biceps",
    description: "Syv halve nedefra, syv halve foroven og syv hele — intens afslutning.",
  },
  // Triceps
  {
    name: "Triceps pushdown",
    category: "Triceps",
    description: "Pres stangen ned i kablet med albuerne låst ind til siden.",
  },
  {
    name: "Fransk pres",
    category: "Triceps",
    description: "Sænk stangen bag hovedet og stræk ud; rammer det lange triceps-hoved.",
  },
  {
    name: "Dips (triceps-fokus)",
    category: "Triceps",
    description: "Dips med rank overkrop, så triceps tager arbejdet frem for brystet.",
  },
  {
    name: "Close-grip bænkpres",
    category: "Triceps",
    description: "Bænkpres med smalt greb — tung triceps-øvelse med brystet som hjælper.",
  },
  {
    name: "Overhead triceps extension",
    category: "Triceps",
    description: "Stræk vægten op over hovedet fra bøjet albue.",
  },
  {
    name: "Triceps kickback",
    category: "Triceps",
    description: "Foroverbøjet med overarmen vandret; stræk underarmen bagud.",
  },
  {
    name: "Diamond push-ups",
    category: "Triceps",
    description: "Armstrækninger med hænderne tæt sammen, så triceps bærer læsset.",
  },
  {
    name: "Rope pushdown",
    category: "Triceps",
    description: "Pushdown med reb, hvor du spreder enderne til sidst for ekstra sammentrækning.",
  },
  {
    name: "Bænk dips",
    category: "Triceps",
    description: "Hænderne på en bænk bag dig; sænk og pres op med triceps.",
  },
  {
    name: "Ensidig triceps extension",
    category: "Triceps",
    description: "Én arm ad gangen i kabel eller med håndvægt — retter skævheder op.",
  },
  // Mave
  {
    name: "Situps",
    category: "Mave",
    description: "Rul hele overkroppen op fra gulvet — klassisk mavearbejde.",
  },
  {
    name: "Crunches",
    category: "Mave",
    description: "Kort, kontrolleret opkrølning; isolerer de øvre mavemuskler.",
  },
  {
    name: "Plank",
    category: "Mave",
    description: "Hold kroppen som en lige planke på underarmene — statisk styrke i kernen.",
  },
  {
    name: "Hængende benløft",
    category: "Mave",
    description: "Hæng i stangen og løft benene; nedre mave og hoftebøjere.",
  },
  {
    name: "Russian twist",
    category: "Mave",
    description: "Sid tilbagelænet og drej fra side til side — de skrå mavemuskler.",
  },
  {
    name: "Cable crunch",
    category: "Mave",
    description: "Knælende crunch i kabel, så du kan lægge rigtig vægt på maven.",
  },
  {
    name: "Mountain climbers",
    category: "Mave",
    description: "Løb knæene ind mod brystet i planke-stilling; puls og kerne på én gang.",
  },
  {
    name: "Ab wheel rollout",
    category: "Mave",
    description: "Rul hjulet frem med rank ryg og træk dig tilbage — hård kerneøvelse.",
  },
  {
    name: "Sideplank",
    category: "Mave",
    description: "Planke på siden; rammer de skrå mavemuskler og stabiliteten.",
  },
  {
    name: "Bicycle crunches",
    category: "Mave",
    description: "Skiftevis albue mod modsat knæ i en cyklende bevægelse.",
  },
  // Baller
  {
    name: "Hip thrust",
    category: "Baller",
    description: "Skuldrene på en bænk, stød hoften op mod loftet — ballernes tungeste øvelse.",
  },
  {
    name: "Glute bridge",
    category: "Baller",
    description: "Løft hoften fra gulvet og klem ballerne sammen i toppen.",
  },
  {
    name: "Cable kickback",
    category: "Baller",
    description: "Spark benet bagud i kabel med kontrol; isolerer ballen.",
  },
  {
    name: "Sumo dødløft",
    category: "Baller",
    description: "Dødløft med bred stand, hvilket trækker baller og inderlår mere med.",
  },
  {
    name: "Cable pull-through",
    category: "Baller",
    description: "Træk kablet frem mellem benene ved at støde hoften frem.",
  },
  {
    name: "Frog pumps",
    category: "Baller",
    description: "Fodsåler mod hinanden, knæ ud til siden; korte stød op for ballerne.",
  },
  {
    name: "Step-ups",
    category: "Baller",
    description: "Træd op på en kasse med ét ben ad gangen — baller, lår og balance.",
  },
  {
    name: "Curtsy lunge",
    category: "Baller",
    description: "Udfald skråt bagud som en nejning; rammer den ydre balle.",
  },
  {
    name: "Donkey kicks",
    category: "Baller",
    description: "På alle fire, spark hælen mod loftet med bøjet knæ.",
  },
  {
    name: "Enbenet hip thrust",
    category: "Baller",
    description: "Hip thrust på ét ben ad gangen — dobbelt belastning og bedre balance.",
  },
  // Underarme
  {
    name: "Wrist curl",
    category: "Underarme",
    description: "Krøl håndleddet opad med underarmene støttet; bøjemusklerne i underarmen.",
  },
  {
    name: "Reverse wrist curl",
    category: "Underarme",
    description: "Samme bevægelse med håndryggen opad — strækkerne på oversiden.",
  },
  {
    name: "Farmer's walk",
    category: "Underarme",
    description: "Gå med tunge vægte i hænderne; greb, underarme og hele kroppens stabilitet.",
  },
  {
    name: "Reverse curl",
    category: "Underarme",
    description: "Curl med håndryggen opad, hvilket flytter arbejdet ud i underarmen.",
  },
  {
    name: "Plate pinch hold",
    category: "Underarme",
    description: "Hold to vægtskiver klemt sammen mellem fingrene så længe du kan.",
  },
  {
    name: "Wrist roller",
    category: "Underarme",
    description: "Rul vægten op på en snor med håndleddene — brænder i underarmene.",
  },
  {
    name: "Zottman curl",
    category: "Underarme",
    description: "Curl op med håndfladen opad og sænk med håndryggen opad.",
  },
  {
    name: "Bag-ryggen wrist curl",
    category: "Underarme",
    description: "Stangen bag ryggen; krøl håndleddene op uden at bruge armene.",
  },
  {
    name: "Grebstræning",
    category: "Underarme",
    description: "Klem, hæng eller hold — alt der gør grebet stærkere.",
  },
  {
    name: "Omvendt greb curl med vægtstang",
    category: "Underarme",
    description: "Stangcurl med overhåndsgreb; både biceps og underarmens overside.",
  },
  // Helkrop
  {
    name: "Burpees",
    category: "Helkrop",
    description: "Ned i planke, armstrækning og hop op — konditionen og hele kroppen.",
  },
  {
    name: "Kettlebell swing",
    category: "Helkrop",
    description: "Sving kuglen op til brysthøjde med hoften som motor.",
  },
  {
    name: "Clean and press",
    category: "Helkrop",
    description: "Riv vægten op til skuldrene og pres den over hovedet i én serie.",
  },
  {
    name: "Thrusters",
    category: "Helkrop",
    description: "Front squat, der går direkte over i et pres over hovedet.",
  },
  {
    name: "Snatch",
    category: "Helkrop",
    description: "Løft stangen fra gulvet til strakte arme over hovedet i én bevægelse.",
  },
  {
    name: "Turkish get-up",
    category: "Helkrop",
    description: "Rejs dig fra liggende til stående med vægten holdt over hovedet.",
  },
  {
    name: "Man makers",
    category: "Helkrop",
    description: "Armstrækning, roning i hver arm og et pres over hovedet — alt i én.",
  },
  {
    name: "Battle ropes",
    category: "Helkrop",
    description: "Slå bølger i de tunge reb; puls, skuldre og greb.",
  },
  {
    name: "Box jumps",
    category: "Helkrop",
    description: "Hop op på en kasse med begge ben — eksplosiv benstyrke.",
  },
  {
    name: "Slædeskub",
    category: "Helkrop",
    description: "Skub den vægtede slæde frem; ben, kerne og kondition uden slag i kroppen.",
  },
];

const SEED_FLAG_KEY = "traeningsapp:default-exercises-seeded";
/*
 * Beskrivelserne kom til efter at de 100 standardøvelser var seedet hos eksisterende
 * brugere. Eget flag, så teksterne fyldes ind én gang i en allerede seedet database.
 */
const DESCRIPTION_FLAG_KEY = "traeningsapp:default-descriptions-filled";

/**
 * Seeder de 100 mest almindelige træningsøvelser én gang, første gang
 * appen åbnes med et tomt øvelsesbibliotek. Bruger et flag i localStorage
 * (ikke kun "er biblioteket tomt") så vi ikke ved et uheld gen-seeder,
 * hvis brugeren selv har slettet alle sine øvelser igen senere.
 */
/**
 * Fylder standardbeskrivelsen ind på øvelser, der blev seedet før teksterne fandtes.
 * Rører kun øvelser uden beskrivelse, så en tekst brugeren selv har skrevet aldrig
 * overskrives — og kun én gang, så en bevidst tømt beskrivelse ikke kommer igen.
 */
async function fillMissingDescriptions(): Promise<void> {
  if (typeof localStorage !== "undefined" && localStorage.getItem(DESCRIPTION_FLAG_KEY)) return;

  const db = await getDb();
  const existing = await db.getAll("exercises");
  const defaultByName = new Map(DEFAULT_EXERCISES.map((e) => [e.name, e.description]));
  const needsText = existing.filter(
    (e) => !e.description?.trim() && defaultByName.has(e.name),
  );

  if (needsText.length > 0) {
    const tx = db.transaction("exercises", "readwrite");
    await Promise.all([
      ...needsText.map((e) =>
        tx.store.put({ ...e, description: defaultByName.get(e.name) }),
      ),
      tx.done,
    ]);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(DESCRIPTION_FLAG_KEY, "1");
  }
}

export async function seedDefaultExercisesIfNeeded(): Promise<void> {
  const alreadySeeded =
    typeof localStorage !== "undefined" && Boolean(localStorage.getItem(SEED_FLAG_KEY));

  // Udfyldningen skal køre for databaser der ER seedet — derfor ikke bag seed-flagets return.
  if (alreadySeeded) {
    await fillMissingDescriptions();
    return;
  }

  const db = await getDb();
  const count = await db.count("exercises");
  if (count === 0) {
    const tx = db.transaction("exercises", "readwrite");
    const now = new Date().toISOString();
    await Promise.all([
      ...DEFAULT_EXERCISES.map((item) => {
        const exercise: Exercise = {
          id: generateId(),
          name: item.name,
          category: item.category,
          description: item.description,
          createdAt: now,
        };
        return tx.store.add(exercise);
      }),
      tx.done,
    ]);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SEED_FLAG_KEY, "1");
  }

  await fillMissingDescriptions();
}
