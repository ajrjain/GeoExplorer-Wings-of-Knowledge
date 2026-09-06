const fs = require('fs');
const path = './data/regions.ts';

let content = fs.readFileSync(path, 'utf8');

// Find the last closing brace of the PRELOADED_REGIONS object
const lastBraceIndex = content.lastIndexOf('}');
if (lastBraceIndex !== -1) {
    const newRegions = `,
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
`;
    // We are replacing the final "};\nEOF" brace basically, but we need to be careful.
    // The file ends with "    }\n};\n". Let's do a simple regex replace for the end of the object.
    
    content = content.replace(/}\s*};\s*$/, '} ' + newRegions);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully appended new regions.");
}
