export const PRELOADED_REGIONS: Record<string, { introText: string, landmarks: { id: string, name: string, description: string, fact: string }[] }> = {
    "France": {
        introText: "Welcome to France! Get ready to fly over beautiful rivers and towering iron monuments.",
        landmarks: [
            { id: "fr-1", name: "Eiffel Tower", description: "A tall iron lattice tower in Paris.", fact: "It was originally built as a temporary exhibit for the 1889 World's Fair!" },
            { id: "fr-2", name: "Seine River", description: "A beautiful long river winding through the country.", fact: "The Seine flows right through the middle of Paris." },
            { id: "fr-3", name: "Mont Blanc", description: "A massive snow-capped mountain peak.", fact: "It's the highest mountain in the Alps and Western Europe." },
            { id: "fr-4", name: "Mont Saint-Michel", description: "An island commune with a towering abbey.", fact: "When the tide comes in, it gets completely surrounded by water!" },
            { id: "fr-5", name: "Loire Valley Castles", description: "Lush green valleys dotted with ancient castles.", fact: "Kings and queens used to live in these magnificent châteaux." }
        ]
    },
    "Germany": {
        introText: "Guten Tag from Germany! We're soaring over dark forests and fairytale castles.",
        landmarks: [
            { id: "de-1", name: "Neuschwanstein Castle", description: "A white fairytale castle on a rugged hill.", fact: "This real castle inspired the famous sleeping beauty castle!" },
            { id: "de-2", name: "Rhine River", description: "A wide blue river twisting through green valleys.", fact: "The Rhine is one of the longest and most important rivers in Europe." },
            { id: "de-3", name: "Black Forest", description: "A dense, dark green mountain range.", fact: "Many famous fairy tales by the Brothers Grimm are set in this forest." },
            { id: "de-4", name: "Brandenburg Gate", description: "A grand classical stone archway.", fact: "It used to be a city gate and is now a symbol of peace." },
            { id: "de-5", name: "Zugspitze", description: "A rocky mountain peak piercing the clouds.", fact: "It's the highest mountain in Germany!" }
        ]
    },
    "Japan": {
        introText: "Welcome to Japan! Let's explore majestic volcanoes and serene lakes from the sky.",
        landmarks: [
            { id: "jp-1", name: "Mount Fuji", description: "A perfectly shaped volcano with a snow-capped peak.", fact: "Mount Fuji is actually an active volcano, though it hasn't erupted since 1707!" },
            { id: "jp-2", name: "Lake Biwa", description: "A massive, sparkling blue freshwater lake.", fact: "It is the largest freshwater lake in Japan and one of the oldest in the world." },
            { id: "jp-3", name: "Tokyo Skytree", description: "A towering futuristic broadcasting tower.", fact: "It's one of the tallest structures in the entire world!" },
            { id: "jp-4", name: "Fushimi Inari Shrine", description: "Thousands of bright red gates winding up a mountain.", fact: "There are over 10,000 orange-red 'torii' gates lining the paths." },
            { id: "jp-5", name: "Himeji Castle", description: "A brilliant white traditional wooden castle.", fact: "It's known as the 'White Heron Castle' because it looks like a bird taking flight." }
        ]
    },
    "China": {
        introText: "Ni hao from China! Prepare to discover winding walls and giant rivers.",
        landmarks: [
            { id: "cn-1", name: "Great Wall of China", description: "A massive stone wall snaking across mountain ridges.", fact: "The wall is thousands of miles long and was built to protect the empire." },
            { id: "cn-2", name: "Yangtze River", description: "A mighty, wide river flowing through deep gorges.", fact: "The Yangtze is the longest river in Asia and the third longest in the world." },
            { id: "cn-3", name: "Mount Everest (North Face)", description: "The gigantic, freezing peak of the world's tallest mountain.", fact: "The border between China and Nepal runs right across the top of this mountain!" },
            { id: "cn-4", name: "Yellow Mountain (Huangshan)", description: "Jagged granite peaks surrounded by sea of clouds.", fact: "The bizarrely shaped pine trees here can grow straight out of the rocks." },
            { id: "cn-5", name: "West Lake", description: "A tranquil lake with ancient pagodas and bridges.", fact: "This beautiful lake has inspired famous poets and painters for centuries." }
        ]
    },
    "India": {
        introText: "Namaste! Welcome to India. We are flying over colorful cities and sacred rivers.",
        landmarks: [
            { id: "in-1", name: "Taj Mahal", description: "A brilliant white marble mausoleum with a giant dome.", fact: "It took 20,000 workers over 20 years to build this beautiful monument!" },
            { id: "in-2", name: "Ganges River", description: "A massive, wide river flowing across the plains.", fact: "The Ganges is considered the most sacred river in India." },
            { id: "in-3", name: "Himalayas", description: "A massive wall of snow-covered mountain peaks.", fact: "The name Himalaya means 'abode of snow' in Sanskrit." },
            { id: "in-4", name: "Thar Desert", description: "A vast expanse of golden rolling sand dunes.", fact: "Despite being a desert, it is the most widely populated desert in the world." },
            { id: "in-5", name: "Dal Lake", description: "A serene lake filled with colorful wooden houseboats.", fact: "You can find floating markets here where people sell vegetables from their boats!" }
        ]
    },
    "Russia": {
        introText: "Welcome to Russia, the largest country in the world! Let's spot the deepest lakes and highest peaks.",
        landmarks: [
            { id: "ru-1", name: "Lake Baikal", description: "A massive, deep, crescent-shaped lake.", fact: "Lake Baikal is the deepest and oldest freshwater lake in the world!" },
            { id: "ru-2", name: "Mount Elbrus", description: "A massive twin-peaked dormant volcano covered in ice.", fact: "It's the highest mountain in Europe." },
            { id: "ru-3", name: "Volga River", description: "A massive twisting river flowing through forests.", fact: "The Volga is the longest river in Europe." },
            { id: "ru-4", name: "St. Basil's Cathedral", description: "A church with colorful, patterned, onion-shaped domes.", fact: "Legend says the architect was blinded so he could never build anything as beautiful again." },
            { id: "ru-5", name: "Kamchatka Volcanoes", description: "A peninsula dotted with smoking volcanic peaks.", fact: "There are around 160 volcanoes here, and 29 of them are still active!" }
        ]
    },
    "Brazil": {
        introText: "Welcome to Brazil! We'll be soaring over massive rainforests and mighty rivers.",
        landmarks: [
            { id: "br-1", name: "Amazon River", description: "An incredibly wide river winding through dense green jungle.", fact: "The Amazon carries more water than the next seven largest rivers combined!" },
            { id: "br-2", name: "Christ the Redeemer", description: "A giant statue with outstretched arms on top of a mountain.", fact: "The statue is 98 feet tall and was named one of the New Seven Wonders of the World." },
            { id: "br-3", name: "Iguazu Falls", description: "A massive, thundering chain of hundreds of waterfalls.", fact: "It is made up of 275 individual waterfalls crashing down together!" },
            { id: "br-4", name: "Sugarloaf Mountain", description: "A strange, rounded rock peak rising out of the ocean.", fact: "You have to take two glass cable cars just to reach the top." },
            { id: "br-5", name: "Lençóis Maranhenses", description: "White sand dunes filled with crystal clear blue lagoons.", fact: "It looks like a desert, but gets so much rain that fresh water pools between the dunes." }
        ]
    },
    "Egypt": {
        introText: "Welcome to Egypt! Let's fly along the great river and spot the ancient pyramids.",
        landmarks: [
            { id: "eg-1", name: "The Great Pyramid of Giza", description: "A massive, ancient geometric stone pyramid.", fact: "It was the tallest man-made structure in the world for over 3,800 years!" },
            { id: "eg-2", name: "Nile River", description: "A long blue river cutting straight through the golden desert.", fact: "The Nile is famous for being the longest river in the world." },
            { id: "eg-3", name: "The Great Sphinx", description: "A giant limestone statue with a lion's body and a human head.", fact: "The Sphinx's nose is missing, and nobody knows for sure how it was lost." },
            { id: "eg-4", name: "Valley of the Kings", description: "A hidden, rocky valley filled with ancient tombs.", fact: "This is where the famous boy-king Tutankhamun was buried." },
            { id: "eg-5", name: "Lake Nasser", description: "A massive, sparkling blue artificial lake in the desert.", fact: "It's one of the largest man-made lakes in the world, created by the Aswan Dam." }
        ]
    },
    "USA": {
        introText: "Welcome to the USA! Get ready to fly over grand canyons and massive lakes.",
        landmarks: [
            { id: "us-1", name: "Grand Canyon", description: "A massive, deep, colorful rocky canyon.", fact: "The canyon is so big that you can see it from space!" },
            { id: "us-2", name: "Mississippi River", description: "A wide, muddy river dividing the country in half.", fact: "A drop of water takes about 90 days to travel the entire length of the river." },
            { id: "us-3", name: "Statue of Liberty", description: "A giant green copper statue holding a torch.", fact: "She was actually a gift of friendship from the people of France." },
            { id: "us-4", name: "Mount Rushmore", description: "Four giant president faces carved into a mountain.", fact: "Each president's face is about as tall as a six-story building." },
            { id: "us-5", name: "Great Lakes", description: "A series of interconnected massive blue freshwater lakes.", fact: "Together, they hold over 20% of the world's fresh surface water!" }
        ]
    },
    "Canada": {
        introText: "Welcome to Canada! We are flying over endless forests and frozen lakes.",
        landmarks: [
            { id: "ca-1", name: "Niagara Falls", description: "A massive, powerful horseshoe-shaped waterfall.", fact: "More than 6 million cubic feet of water goes over the crest every minute!" },
            { id: "ca-2", name: "CN Tower", description: "A towering, needle-like structure reaching into the sky.", fact: "It has a glass floor where you can look straight down 1,122 feet!" },
            { id: "ca-3", name: "Lake Louise", description: "A bright turquoise lake surrounded by snowy mountains.", fact: "The lake gets its crazy color from 'rock flour' carried by melting glaciers." },
            { id: "ca-4", name: "Rocky Mountains", description: "A long chain of jagged, snow-covered mountain peaks.", fact: "These majestic mountains stretch for 3,000 miles from Canada down to the US." },
            { id: "ca-5", name: "Mackenzie River", description: "A massive, cold river winding through the northern wilderness.", fact: "It is the longest river system in Canada." }
        ]
    },
    "Australia": {
        introText: "G'day! Welcome to Australia. Look out for red deserts and massive reefs.",
        landmarks: [
            { id: "au-1", name: "Sydney Opera House", description: "A building with a roof that looks like white ship sails.", fact: "It contains over 1 million roof tiles!" },
            { id: "au-2", name: "Uluru (Ayers Rock)", description: "A massive, flat-topped red sandstone rock in the desert.", fact: "It appears to change color at different times of the day, glowing deep red at sunset." },
            { id: "au-3", name: "Great Barrier Reef", description: "A massive underwater world of colorful coral.", fact: "It is the largest living structure on Earth and can be seen from outer space." },
            { id: "au-4", name: "Murray River", description: "A long, twisting river flowing through dry landscapes.", fact: "It is Australia's longest single river." },
            { id: "au-5", name: "Lake Eyre", description: "A massive, shimmering white salt lake.", fact: "Most of the time, this lake is completely dry and covered in sparkling salt!" }
        ]
    },
    "Pacific Ocean": {
        introText: "Welcome to the Pacific Ocean! The largest and deepest ocean on Earth.",
        landmarks: [
            { id: "po-1", name: "Mariana Trench", description: "A dark, incredibly deep underwater canyon.", fact: "It's the deepest part of the world's oceans, deeper than Mount Everest is tall!" },
            { id: "po-2", name: "Mauna Kea", description: "A massive underwater volcano with its peak above the clouds.", fact: "If measured from its underwater base, it's actually taller than Mount Everest." },
            { id: "po-3", name: "Ring of Fire", description: "A long horseshoe chain of underwater volcanoes.", fact: "About 90% of the world's earthquakes happen along this path." },
            { id: "po-4", name: "Galápagos Islands", description: "A cluster of volcanic islands filled with strange animals.", fact: "Giant tortoises that can live for over 100 years roam these islands." },
            { id: "po-5", name: "Great Pacific Garbage Patch", description: "A swirling vortex of floating ocean plastics.", fact: "A reminder that we need to protect our oceans by recycling!" }
        ]
    },
    "Atlantic Ocean": {
        introText: "Welcome to the Atlantic Ocean! Let's explore underwater ridges and legendary triangles.",
        landmarks: [
            { id: "ao-1", name: "Mid-Atlantic Ridge", description: "A massive underwater mountain range splitting the ocean.", fact: "It's the longest mountain range on Earth, but mostly underwater!" },
            { id: "ao-2", name: "Bermuda Triangle", description: "A mysterious expanse of deep blue open water.", fact: "Many legends talk about ships disappearing here, but it's actually a heavily traveled route." },
            { id: "ao-3", name: "Sargasso Sea", description: "A calm area of the ocean covered in floating golden seaweed.", fact: "It is the only sea in the world that has no land boundaries!" },
            { id: "ao-4", name: "Gulf Stream", description: "A fast, warm ocean current cutting through the colder water.", fact: "It acts like a giant river flowing right through the middle of the ocean." },
            { id: "ao-5", name: "Titanic Wreck", description: "The sunken remains of a massive historic passenger ship.", fact: "It rests in total darkness more than 12,000 feet below the surface." }
        ]
    },
    "Indian Ocean": {
        introText: "Welcome to the Indian Ocean! We're flying over warm, tropical turquoise waters.",
        landmarks: [
            { id: "io-1", name: "Maldives Atolls", description: "Rings of bright coral islands sitting in crystal clear water.", fact: "It's the lowest and flattest country in the entire world!" },
            { id: "io-2", name: "Madagascar", description: "A massive green island off the coast of Africa.", fact: "Most of the animals that live here, like lemurs, can't be found anywhere else on Earth." },
            { id: "io-3", name: "Java Trench", description: "A deep, dark subduction zone in the ocean floor.", fact: "It is the deepest point in the Indian Ocean." },
            { id: "io-4", name: "Seychelles Islands", description: "Lush tropical islands with giant smooth granite boulders.", fact: "Some of the giant tortoises here are over 150 years old!" },
            { id: "io-5", name: "Kerguelen Islands", description: "Desolate, rocky islands in the freezing southern waters.", fact: "They are known as the 'Desolation Islands' because they are so far from anywhere else!" }
        ]
    } ,
    "Dubai": {
        introText: "Welcome to Dubai! We're flying over towering skyscrapers and man-made islands.",
        landmarks: [
            { id: "ae-1", name: "Burj Khalifa", description: "The tallest needle-like skyscraper in the world piercing the clouds.", fact: "It is over 828 meters tall and has 163 floors!" },
            { id: "ae-2", name: "Palm Jumeirah", description: "A massive man-made island shaped like a palm tree.", fact: "You can clearly see its palm tree shape from space." },
            { id: "ae-3", name: "Burj Al Arab", description: "A luxury hotel shaped like the sail of a ship.", fact: "It stands on its own artificial island." },
            { id: "ae-4", name: "Dubai Creek", description: "A natural seawater inlet cutting through the city.", fact: "It historically divided the city into two main sections: Deira and Bur Dubai." },
            { id: "ae-5", name: "The World Islands", description: "A collection of small artificial islands shaped like a world map.", fact: "There are exactly 300 islands constructed from sand dredged from the sea." }
        ]
    },
    "Singapore": {
        introText: "Welcome to Singapore! Get ready to explore this beautiful island city-state and its futuristic gardens.",
        landmarks: [
            { id: "sg-1", name: "Marina Bay Sands", description: "Three giant towers connected by a massive boat-shaped roof.", fact: "The roof has a gigantic infinity pool that looks like it drops off the edge of the world!" },
            { id: "sg-2", name: "Gardens by the Bay", description: "A park filled with glowing, massive artificial Supertrees.", fact: "These Supertrees collect rainwater and generate solar power." },
            { id: "sg-3", name: "The Merlion", description: "A statue with the head of a lion and the body of a fish.", fact: "It spouts water from its mouth and is the official mascot of Singapore." },
            { id: "sg-4", name: "Singapore River", description: "A historic river winding through the heart of the modern city.", fact: "It was once the bustling center of trade and commerce for the whole country." },
            { id: "sg-5", name: "Sentosa Island", description: "A sunny resort island with sandy beaches and theme parks.", fact: "It translates to 'peace and tranquility' in Malay." }
        ]
    },
    "UK": {
        introText: "Welcome to the UK! We'll be soaring over historic clock towers and ancient stone circles.",
        landmarks: [
            { id: "uk-1", name: "Big Ben", description: "A massive gothic clock tower rising above the city.", fact: "Big Ben is actually the name of the giant bell inside, not the tower itself!" },
            { id: "uk-2", name: "Stonehenge", description: "A mysterious circle of giant standing stones in a green field.", fact: "They were put there over 4,000 years ago, and no one knows exactly how they moved the heavy stones!" },
            { id: "uk-3", name: "River Thames", description: "A dark, twisting river flowing right through London.", fact: "The river is home to over 120 different species of fish." },
            { id: "uk-4", name: "Tower Bridge", description: "A grand Victorian bridge with two castle-like towers.", fact: "The middle of the bridge actually lifts up to let tall ships pass through." },
            { id: "uk-5", name: "Loch Ness", description: "A long, deep, dark freshwater lake surrounded by hills.", fact: "It holds more water than all the lakes in England and Wales combined, and might hide a monster!" }
        ]
    }
};
