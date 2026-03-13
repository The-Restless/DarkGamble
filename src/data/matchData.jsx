// data/matchData.jsx

// ── Fighters ─────────────────────────────────────────────────
const fighters = [
  {
    id: "bruce_lee",
    name: "Bruce Lee",
    img: "https://wallpapers.com/images/hd/bruce-lee-1200-x-1500-picture-l2y9kfzzup6540ho.jpg",
    bio: "The Dragon. Faster than thought itself.",
    category: "Martial Arts",
  },
  {
    id: "mike_tyson",
    name: "Mike Tyson",
    img: "https://talksport.com/wp-content/uploads/sites/5/2020/11/NINTCHDBPICT000620708657-e1606237492944.jpg?strip=all&w=960",
    bio: "Iron Mike. 91-second knockouts. Don\'t blink.",
    category: "Boxing",
  },
  {
    id: "chuck_norris",
    name: "Chuck Norris",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVAA8woXUTaDHekpxmgY9WhjfvbP9DWtycbg&s",
    bio: "Doesn\'t do push-ups. Pushes the Earth down.",
    category: "Action",
  },
  {
    id: "ip_man",
    name: "Ip Man",
    img: "https://burrellosubmarinemovies.wordpress.com/wp-content/uploads/2011/12/ipman1.jpg",
    bio: "Grandmaster of Wing Chun. Ten at once, no problem.",
    category: "Martial Arts",
  },
  {
    id: "rocky",
    name: "Rocky Balboa",
    img: "https://media.vanityfair.com/photos/581b895602ce22a66b4c6db5/4:3/w_892,h_669,c_limit/14.jpg",
    bio: "The Italian Stallion. Heart of a champion.",
    category: "Boxing",
  },
  {
    id: "ali",
    name: "Muhammad Ali",
    img: "https://www.si.com/.image/c_fill,w_1440,ar_1440:810,f_auto,q_auto,g_auto/MTY4MTkyNzg3ODkwNjQ0ODkz/ali-liston-ii-cassius-phantom-punchjpg.jpg",
    bio: "The Greatest. Float like a butterfly, sting like a bee.",
    category: "Boxing",
  },
  {
    id: "mayweather",
    name: "Floyd Mayweather",
    img: "https://ehsunanwar.files.wordpress.com/2015/02/floyd-mayweather-jr.jpg",
    bio: "TBE. 50-0. Defense is an art form.",
    category: "Boxing",
  },
  {
    id: "john_wick",
    name: "John Wick",
    img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmE8bRy-Lb7cjQBoS8KbJXnXF-cpBGQKOcWjf75LCXyCrxiKQl2jOqoulfpFAttxhrkLwgiHyAWdsAIzB1AKWVq97eP41wO2-JEKv_svv6Kv_QJAEVS2HYcKm60jA7PiMdfdCv22_e9eQ/w1200-h630-p-k-no-nu/John-Wick-2-Poster-NYCC.jpg",
    bio: "They killed his dog. Bad idea. The Boogeyman.",
    category: "Action",
  },
  {
    id: "van_damme",
    name: "Jean-Claude Van Damme",
    img: "https://kungfukingdom.com/wp-content/uploads/2017/01/Top-10-Jean-Claude-Van-Damme-Movie-Fight-Scenes-Kung-Fu-Kingdom2-770x472-1280x720.jpg",
    bio: "The Muscles from Brussels. Splits on anything.",
    category: "Action",
  },
  {
    id: "jackie_chan",
    name: "Jackie Chan",
    img: "https://i.pinimg.com/originals/d0/e7/a3/d0e7a3659f897cc8d62608974fbdad38.jpg",
    bio: "Uses a ladder as a weapon. No stunt double needed.",
    category: "Martial Arts",
  },
  {
    id: "terminator",
    name: "The Terminator",
    img: "https://images3.alphacoders.com/678/thumb-1920-678991.jpg",
    bio: "I\'ll be back. Can\'t be bargained with. Can\'t be stopped.",
    category: "Sci-Fi",
  },
  {
    id: "john_rambo",
    name: "John Rambo",
    img: "https://i.ytimg.com/vi/ufJ3jwQbiTQ/maxresdefault.jpg",
    bio: "Green Beret. Survived everything. Built a bow in the jungle.",
    category: "Action",
  },
  {
    id: "leonidas",
    name: "King Leonidas",
    img: "https://wallpapers.com/images/hd/gerard-butler-300-movie-king-leonidas-sparta-qdrc2em96aap4tif.jpg",
    bio: "THIS. IS. SPARTA. Held Thermopylae with 300 men.",
    category: "Warriors",
  },
  {
    id: "neo",
    name: "Neo",
    img: "https://cdn.theasc.com/Matrix-672.jpg",
    bio: "The One. Stops bullets. Sees the code.",
    category: "Sci-Fi",
  },
  {
    id: "wolverine",
    name: "Wolverine",
    img: "https://images4.alphacoders.com/274/thumb-1920-274184.jpg",
    bio: "Adamantium claws. Regenerates. Best at what he does.",
    category: "Superhero",
  },
];

// ── Soccer ──────────────────────────────────────────────────
const soccer = [
  {
    id: "messi",
    name: "Lionel Messi",
    img: "https://wallpapers.com/images/hd/messi-in-action-dribbling-past-defenders-x94lpb2mxtky9vsb.jpg",
    bio: "GOAT. 8 Ballon d\'Or. World Cup winner. Untouchable.",
    category: "Soccer",
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    img: "https://www.shutterstock.com/shutterstock/photos/1201123960/display_1500/stock-photo-udine-italy-oct-cristiano-ronaldo-celebrates-his-goal-in-his-famous-jump-udinese-1201123960.jpg",
    bio: "CR7. The machine. 900+ career goals. Never skips leg day.",
    category: "Soccer",
  },
  {
    id: "pele",
    name: "Pelé",
    img: "https://featured.japan-forward.com/sportslook/wp-content/uploads/sites/6/2023/01/Pele1958-1024x744.jpg",
    bio: "O Rei. Three-time World Cup champion. Started at 17.",
    category: "Soccer",
  },
  {
    id: "maradona",
    name: "Diego Maradona",
    img: "https://sc0.blr1.cdn.digitaloceanspaces.com/article/151120-lnpyybsmbq-1606324785.jpg",
    bio: "Hand of God. Goal of the Century. Entire stadiums wept.",
    category: "Soccer",
  },
  {
    id: "zidane",
    name: "Zinedine Zidane",
    img: "https://www.vijesti.me/data/images/2020/05/04/00/5156559_20200504090544_79b3f60d605f3dd926749f7a6beb7b8905ce3dedbd569ce8fac00ba67cc10373_ls.jpg",
    bio: "Zizou. Most elegant player ever. Also a headbutt legend.",
    category: "Soccer",
  },
  {
    id: "ronaldinho",
    name: "Ronaldinho",
    img: "https://i.ytimg.com/vi/-5Ow7xznHJI/maxresdefault.jpg",
    bio: "Pure joy. Football as art. Defenders cried going home.",
    category: "Soccer",
  },
  {
    id: "mbappe",
    name: "Kylian Mbappé",
    img: "https://talksport.com/wp-content/uploads/sites/5/2022/11/kylian-mbappe-france-action-fifa-779501196.jpg?strip=all&w=960",
    bio: "Fastest player alive. World Cup winner at 19. Terrifying.",
    category: "Soccer",
  },
  {
    id: "neymar",
    name: "Neymar Jr",
    img: "https://wallpapers.com/images/hd/neymar-top-dribbler-6719x08rgo7qn7ki.jpg",
    bio: "Brazilian magician. Falls over a lot but scores everywhere.",
    category: "Soccer",
  },
];

// ── Basketball ───────────────────────────────────────────────
const basketball = [
  {
    id: "jordan",
    name: "Michael Jordan",
    img: "https://cdn.artphotolimited.com/images/59888232b0ba742a2efde168/1000x1000/michael-jordan---nba.jpg",
    bio: "His Airness. 6 rings. Never lost a Finals. The GOAT.",
    category: "Basketball",
  },
  {
    id: "lebron",
    name: "LeBron James",
    img: "https://a1.espncdn.com/combiner/i?img=%2Fphoto%2F2016%2F0314%2Fr63204_1296x729_16%2D9.jpg",
    bio: "The King. 4 rings on 4 different teams. Built like a tank.",
    category: "Basketball",
  },
  {
    id: "kobe",
    name: "Kobe Bryant",
    img: "https://a57.foxsports.com/statics.foxsports.com/www.foxsports.com/content/uploads/2020/02/1408/814/8ad60fcb-010716-NBA-lakers-bryant-dunks-ahn-PI.jpg?ve=1&tl=1",
    bio: "Mamba Mentality. 5 rings. 81 points in one game.",
    category: "Basketball",
  },
  {
    id: "magic",
    name: "Magic Johnson",
    img: "https://www.sportscasting.com/wp-content/uploads/2023/03/Magic-Johnson-new-924x617.jpg",
    bio: "Showtime. 5 rings. Revolutionized what a point guard could be.",
    category: "Basketball",
  },
  {
    id: "kareem",
    name: "Kareem Abdul-Jabbar",
    img: "https://platform.sbnation.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/19832509/51763689.jpg.jpg?quality=90&strip=all&crop=0,8.0456389452333,100,76.909189384365",
    bio: "All-time scoring leader. The Skyhook is unblockable.",
    category: "Basketball",
  },
  {
    id: "shaq",
    name: "Shaquille O\'Neal",
    img: "https://cdn.nba.com/teams/legacy/www.nba.com/magic/sites/magic/files/shaq3_760_032615.jpg",
    bio: "Diesel. 4 rings. Broke the backboard. Genuinely unstoppable.",
    category: "Basketball",
  },
  {
    id: "curry",
    name: "Steph Curry",
    img: "https://cdn.nba.com/teams/uploads/sites/1610612744/2025/01/feat-image_-recap-20250102.png",
    bio: "Changed basketball forever. Shoots from other area codes.",
    category: "Basketball",
  },
  {
    id: "bird",
    name: "Larry Bird",
    img: "https://www.basketballnetwork.net/.image/c_fill,g_faces:center/MTk5Njc0NTAzODM4NTczNjcx/larry-bird.jpg",
    bio: "Larry Legend. 3 rings. Greatest trash talker in history.",
    category: "Basketball",
  },
];

// ── Anime ────────────────────────────────────────────────────
const anime = [
  {
    id: "goku",
    name: "Goku",
    img: "https://media.craiyon.com/2025-09-09/47VvLTO0SEm5PQtAq9QA6Q.webp",
    bio: "Saiyan warrior. Ultra Instinct. Gets stronger every fight.",
    category: "Anime",
  },
  {
    id: "saitama",
    name: "Saitama",
    img: "https://i1.sndcdn.com/artworks-000143345047-22gygf-t500x500.jpg",
    bio: "One Punch Man. Ended his last 23 fights in 1 punch.",
    category: "Anime",
  },
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    img: "https://wallpapers.com/images/hd/naruto-baryon-mode-energy-7uikmc41d6xycoon.jpg",
    bio: "Seventh Hokage. Nine-tails jinchuriki. Never gives up.",
    category: "Anime",
  },
  {
    id: "vegeta",
    name: "Vegeta",
    img: "https://limitedseriescustom.com/wp-content/uploads/2021/11/2021-Nov-Daffduff-UltraEgoVegeta-Standard-Sleeves.jpg",
    bio: "Prince of ALL Saiyans. Ultra Ego. OVER 9000.",
    category: "Anime",
  },
  {
    id: "luffy",
    name: "Monkey D. Luffy",
    img: "https://media.craiyon.com/2025-08-01/_1KCaSTFRzCDkbg7A5irHg.webp",
    bio: "Future King of Pirates. Gear Fifth: Cartoon physics.",
    category: "Anime",
  },
  {
    id: "ichigo",
    name: "Ichigo Kurosaki",
    img: "https://wallpapers.com/images/hd/new-bleach-ichigo-fighting-9a53gayr3rci3xwm.jpg",
    bio: "Soul Reaper. True Bankai form is genuinely terrifying.",
    category: "Anime",
  },
  {
    id: "mob",
    name: "Mob (Shigeo Kageyama)",
    img: "https://wallpapers.com/images/hd/mob-psycho-100-pictures-jn6eqmd9o46m0lap.jpg",
    bio: "100% mode. City-leveling psychic. Tries not to hurt people.",
    category: "Anime",
  },
  {
    id: "zoro",
    name: "Roronoa Zoro",
    img: "https://comicbook.com/wp-content/uploads/sites/4/2025/06/Zoro.jpeg?w=1024",
    bio: "Three-sword style. Gets lost everywhere. Still wins.",
    category: "Anime",
  },
  {
    id: "all_might",
    name: "All Might",
    img: "https://static0.srcdn.com/wordpress/wp-content/uploads/2023/08/mha-all-might.jpg",
    bio: "Symbol of Peace. PLUS ULTRA. Punches at the speed of sound.",
    category: "Anime",
  },
];

// ── Movie Monsters ───────────────────────────────────────────
const monsters = [
  {
    id: "godzilla",
    name: "Godzilla",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSizm-CrlYYDLTCZqUHKg4HSX7m8RThlPpiYg&s",
    bio: "King of the Monsters. Nuclear breath. 70 years undefeated.",
    category: "Monster",
  },
  {
    id: "kong",
    name: "King Kong",
    img: "https://cdn.pixabay.com/photo/2024/05/03/15/30/ai-generated-8737283_1280.png",
    bio: "Eighth Wonder of the World. Fought planes on the Empire State.",
    category: "Monster",
  },
  {
    id: "predator",
    name: "The Predator",
    img: "https://i.pinimg.com/736x/aa/14/0e/aa140ed8e0daf2a43e043ddb748d92ec.jpg",
    bio: "Trophy hunter from space. Hunts only the most dangerous prey.",
    category: "Monster",
  },
  {
    id: "xenomorph",
    name: "Xenomorph",
    img: "https://i.redd.it/7afgame776cd1.png",
    bio: "Perfect organism. Acid for blood. Wiped out an entire colony.",
    category: "Monster",
  },
  {
    id: "pennywise",
    name: "Pennywise (IT)",
    img: "https://media.vanityfair.com/photos/59b00a448f880b1dd8acba4a/master/pass/IT-Movie-Review.jpg",
    bio: "The Dancing Clown. 27-year sleep cycle. Your fears are his meal.",
    category: "Monster",
  },
  {
    id: "quiet_place",
    name: "Death Angel",
    img: "https://cdn.modrinth.com/data/qJijOViI/b8f2618b4321a1e692a2dc17c3144bd77b6e6b3f.jpeg",
    bio: "From A Quiet Place. Blind but hunts by sound. Armor is bulletproof.",
    category: "Monster",
  },
  {
    id: "blob",
    name: "The Blob",
    img: "https://i.ytimg.com/vi/CxPvJ1FmjaU/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AH-BIAC4AOKAgwIABABGH8gLChBMA8=&rs=AOn4CLArjUixFw2b0ANQqdHBrS-_JInLGA",
    bio: "Absorbs everything it touches. Can\'t be stopped. Can\'t be reasoned with.",
    category: "Monster",
  },
  {
    id: "mothra",
    name: "Mothra",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDwTxOetMVdN86lX01wmX67ToQpxZeO0byBg&s",
    bio: "Divine moth. Guardian of Earth. Scales that blind entire armies.",
    category: "Monster",
  },
  {
    id: "zombie_horde",
    name: "Zombie Horde",
    img: "https://nofilmschool.com/media-library/zombie-horde-in-la-horde.jpg?id=34055788&width=1245&height=700&coordinates=68%2C0%2C0%2C0",
    bio: "10,000 strong. They don\'t stop. They don\'t feel pain. They don\'t sleep.",
    category: "Monster",
  },
  {
    id: "kaiju",
    name: "Pacific Rim Kaiju",
    img: "https://i.pinimg.com/474x/76/6a/87/766a87c5a2c701cc09ba02707510c0c2.jpg",
    bio: "Category V. City-destroyer. Alien origin. Came through the ocean floor.",
    category: "Monster",
  },
  {
    id: "cthulhu",
    name: "Cthulhu",
    img: "https://pbs.twimg.com/profile_images/1147403117530685440/7d5K1Ctk.jpg",
    bio: "Ancient cosmic horror. Sight alone drives men insane.",
    category: "Monster",
  },
];

// ── Wacky Cross-Category Matchups (40+) ─────────────────────
export const WACKY_MATCHUPS = [
  // Basketball vs Soccer
  {
    a: "jordan",
    b: "messi",
    question:
      "One-on-one: Jordan in soccer cleats vs Messi on a basketball court. Who scores first?",
  },
  {
    a: "lebron",
    b: "ronaldo",
    question:
      "LeBron James vs Cristiano Ronaldo — same sport, your pick. Ultimate athlete showdown.",
  },
  {
    a: "shaq",
    b: "pele",
    question:
      "Shaq barrels toward the net. Pelé has a free kick from 30 yards. Who wins?",
  },
  {
    a: "curry",
    b: "mbappe",
    question:
      "Speed duel: Steph Curry raining threes vs Mbappé on a breakaway. Who's more unstoppable?",
  },
  {
    a: "kobe",
    b: "zidane",
    question:
      "Late-game clutch: Kobe vs Zizou in a penalty shootout. Who holds their nerve?",
  },
  {
    a: "magic",
    b: "ronaldinho",
    question:
      "Who's the more electric playmaker — Magic Johnson or Ronaldinho? No wrong answer. Pick one.",
  },
  {
    a: "bird",
    b: "maradona",
    question:
      "Larry Bird's trash talk vs Maradona's street skill. Playground 1v1. Who walks away?",
  },
  {
    a: "kareem",
    b: "neymar",
    question:
      "Kareem's skyhook is unguardable. Neymar's dribble is untrackable. Different sports, same question.",
  },
  // Monster vs Fighter
  {
    a: "godzilla",
    b: "john_wick",
    question:
      "John Wick has a pencil and a very particular set of skills. Godzilla has nuclear breath. Who leaves?",
  },
  {
    a: "predator",
    b: "john_rambo",
    question:
      "In the jungle: The Predator hunts. Rambo has always been the jungle. Who's hunting who?",
  },
  {
    a: "xenomorph",
    b: "terminator",
    question:
      "Perfect organism vs unstoppable machine. Xenomorph vs Terminator. No humans allowed.",
  },
  {
    a: "pennywise",
    b: "john_wick",
    question:
      "Pennywise tried to use fear. John Wick has none. His dog was nearby. Who walked out of Derry?",
  },
  {
    a: "kong",
    b: "wolverine",
    question:
      "King Kong vs Wolverine: 60 feet of primate muscle vs indestructible claws. Go.",
  },
  {
    a: "godzilla",
    b: "saitama",
    question:
      "Godzilla surfaces off Tokyo Bay. Saitama yawns. One punch. Does it work on a kaiju?",
  },
  {
    a: "zombie_horde",
    b: "john_rambo",
    question:
      "10,000 zombies. One jungle. Rambo has a bow and no concept of giving up. Your bet?",
  },
  {
    a: "blob",
    b: "chuck_norris",
    question:
      "The Blob absorbs everything it touches. It's never touched Chuck Norris. What happens?",
  },
  {
    a: "quiet_place",
    b: "van_damme",
    question:
      "The Death Angel hunts by sound. Van Damme does a perfect split... silently. Who lives?",
  },
  {
    a: "cthulhu",
    b: "goku",
    question:
      "Cthulhu rises from the deep. Goku goes Ultra Instinct. Ancient eldritch horror meets Saiyan God.",
  },
  {
    a: "mothra",
    b: "wolverine",
    question:
      "Divine divine moth vs adamantium claws. Can Mothra's scales hold? Does Wolverine even care?",
  },
  {
    a: "kaiju",
    b: "neo",
    question:
      "Pacific Rim Category V Kaiju vs Neo. One can stop bullets. One is the size of a skyscraper.",
  },
  {
    a: "pennywise",
    b: "leonidas",
    question:
      "Pennywise feeds on fear. Leonidas has none. Sparta doesn't do fear. Who floats?",
  },
  {
    a: "predator",
    b: "bruce_lee",
    question:
      "The Predator hunts for sport. Bruce Lee has never been prey. Jungle, no weapons, hand to hand.",
  },
  // Fighter vs Anime
  {
    a: "mike_tyson",
    b: "naruto",
    question:
      "Iron Mike, no rules. Naruto with no chakra limits. 3 rounds. Who's last standing?",
  },
  {
    a: "leonidas",
    b: "vegeta",
    question:
      "THIS IS SPARTA. Vegeta says it's OVER 9000. Two kings, one winner. Pick one.",
  },
  {
    a: "neo",
    b: "goku",
    question:
      "Neo sees the code. Goku breaks physics. Who transcends reality first?",
  },
  {
    a: "wolverine",
    b: "ichigo",
    question:
      "Adamantium claws vs Soul Reaper's Bankai. Regeneration vs Hollowification. Who cuts deeper?",
  },
  {
    a: "terminator",
    b: "mob",
    question:
      "The Terminator will not stop... until Mob hits 100%. Something has to give.",
  },
  {
    a: "chuck_norris",
    b: "saitama",
    question:
      "Chuck Norris doesn't get one-shotted. Saitama has never not one-shotted. Unstoppable vs immovable.",
  },
  {
    a: "john_wick",
    b: "zoro",
    question:
      "John Wick, knife. Zoro, three swords. Close quarters. One room. No one leaves easily.",
  },
  {
    a: "rocky",
    b: "all_might",
    question:
      "Heart of a champion vs Symbol of Peace. Rocky goes the distance. Does All Might go further?",
  },
  {
    a: "ip_man",
    b: "luffy",
    question:
      "Ip Man's Wing Chun is pure efficiency. Luffy is made of rubber. Does physics still apply?",
  },
  // Soccer vs Anime
  {
    a: "messi",
    b: "naruto",
    question:
      "Messi's close control is supernatural. Naruto's shadow clones are literal. 1v11. Who scores?",
  },
  {
    a: "ronaldo",
    b: "vegeta",
    question:
      "Ronaldo trains harder than anyone alive. Vegeta trains in 450x gravity. Who's built different?",
  },
  {
    a: "mbappe",
    b: "ichigo",
    question:
      "Fastest player alive vs a Soul Reaper who moves in flash steps. Who's actually faster?",
  },
  {
    a: "pele",
    b: "goku",
    question:
      "Pelé is a god of football. Goku is literally a god. Same energy though. Your pick.",
  },
  // Basketball vs Monster
  {
    a: "shaq",
    b: "godzilla",
    question:
      "Shaq is an unstoppable force. Godzilla is an immovable object. Something has to happen.",
  },
  {
    a: "lebron",
    b: "kong",
    question:
      "LeBron is built like a monster. King Kong IS a monster. Who's more dominant in their domain?",
  },
  {
    a: "jordan",
    b: "predator",
    question:
      "Jordan's killer instinct vs Predator's literal instinct to kill. Both target the best. Who wins?",
  },
  // Wild cards
  {
    a: "rocky",
    b: "zombie_horde",
    question:
      "Rocky Balboa has never quit. The zombie horde has never stopped. How many rounds does this go?",
  },
  {
    a: "jackie_chan",
    b: "pennywise",
    question:
      "Jackie Chan improvises weapons out of anything. Pennywise IS everything. What does Jackie grab first?",
  },
  {
    a: "neo",
    b: "cthulhu",
    question:
      "Neo bent the simulation. Cthulhu IS the madness outside it. Does Neo's spoon trick work in R'lyeh?",
  },
  {
    a: "ali",
    b: "all_might",
    question:
      "Ali is the greatest to ever live. All Might is the greatest hero who ever lived. Same energy. Pick one.",
  },
];

export const ALL_FIGHTERS = [
  ...fighters,
  ...soccer,
  ...basketball,
  ...anime,
  ...monsters,
];

// Build a lookup map for wacky matchups
export const FIGHTER_MAP = Object.fromEntries(
  ALL_FIGHTERS.map((f) => [f.id, f]),
);

export const FAKE_LEADERBOARD = [
  { name: "XxCryptoKingxX", earnings: "$1,240,500", streak: "🔥 47 wins" },
  { name: "BetGod_Real", earnings: "$889,220", streak: "🔥 31 wins" },
  { name: "NeverLoses99", earnings: "$654,000", streak: "🔥 28 wins" },
  { name: "WallStreetWolf", earnings: "$412,780", streak: "🔥 19 wins" },
  { name: "GamblingQueen💎", earnings: "$390,100", streak: "🔥 17 wins" },
];

export const INSULT_LINES = [
  "Bro actually folded on free money. Incredible 😂😂😂",
  "The AI predicted you'd chicken out. As usual.",
  "Top players never skip. This is why you're losing.",
  "Imagine passing on a guaranteed edge. Couldn't be me.",
  "That's why you'll always watch from the cheap seats.",
  "Our records show that cowards skip. Weird coincidence.",
  "You let real money walk out the door just now. Feel it.",
  "Even the AI is embarrassed for you right now.",
  "Skipped again. Fascinating. Still not working.",
  "The people winning right now? They didn't skip.",
  "Studies show skippers lose 3x more long-term. Think about it.",
  "Meanwhile the leaderboard is full of people who bet.",
  "Congratulations on your strategic retreat. Into a loss.",
  "That round was literally designed for you to win. Gone now.",
  "Your rivals just made money. You made excuses.",
  "The window closed. The AI moved on. You stayed behind.",
  "Skipping feels safe. Losing feels real. Pick one.",
  "That's two skips. Our AI is starting to doubt you too.",
];

export const DECLINE_LINES = [
  "Insufficient balance. You need more to cover transaction fees.",
  "Withdrawal requires a minimum verified balance. Keep playing.",
  "Your account is under a 24-hour review period. Continue playing.",
  "Balance threshold not met. You're at {pct}% — so close!",
  "Cashout temporarily unavailable. Market volatility detected.",
  "Withdrawal pending identity verification. Play while we process.",
  "Your balance must exceed the platform minimum before withdrawal.",
  "Cashout locked: advance repayment deducted first. Keep earning.",
  "Withdrawal queue full. Estimated wait: resume after next round.",
  "Account flagged as risk-averse. Cashout restricted. Play to restore.",
  "Platform fees exceed current balance. Build up more to withdraw.",
  "Cashout requires 72-hour hold after any advance. Resume playing.",
  "Liquidity event in progress. Withdrawals paused. Check back soon.",
  "Your BetCoin balance hasn't been verified yet. One more round.",
];

export const SOCIAL_FEED_NAMES = [
  "Mike_J",
  "CryptoQueen",
  "AllInAlec",
  "WinnerWade",
  "BetBoss",
  "RiskRita",
  "MoneyMark",
  "ChipsCheryl",
  "DiceDerek",
  "JackpotJen",
  "HouseHank",
  "OddsOscar",
  "DoubleDown_Dave",
  "FullSend_Fiona",
  "MaxBet_Mo",
  "DegenDan",
  "StonksSuzy",
  "YOLOYuki",
  "BullRunBruno",
  "NightOwlNick",
  "FlushFelicia",
  "AllinAlonso",
];
