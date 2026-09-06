import fs from 'fs';
import path from 'path';
import https from 'https';
import { PRELOADED_REGIONS } from '../data/regions.js';

const dir = path.join(process.cwd(), 'public', 'assets', 'landmarks');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const HEADERS = { 'User-Agent': 'GeoExplorer/1.0 (ajr.jain7@gmail.com)' };

async function fetchImage(name: string, id: string) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500`;
        https.get(url, { headers: HEADERS }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const page = Object.values(pages)[0] as any;
                    if (page && page.thumbnail && page.thumbnail.source) {
                        const imgUrl = page.thumbnail.source;
                        const dest = path.join(dir, `${id}.jpg`);
                        https.get(imgUrl, { headers: HEADERS }, (imgRes) => {
                            if (imgRes.statusCode !== 200) {
                                resolve(false);
                                return;
                            }
                            const file = fs.createWriteStream(dest);
                            imgRes.pipe(file);
                            file.on('finish', () => { file.close(); resolve(true); });
                        });
                    } else {
                        resolve(false);
                    }
                } catch(e) { resolve(false); }
            });
        }).on('error', () => resolve(false));
    });
}

async function run() {
    console.log('Starting image downloads with correct User-Agent...');
    for (const [regionName, regionData] of Object.entries(PRELOADED_REGIONS)) {
        for (const lm of regionData.landmarks) {
            console.log(`Fetching ${lm.name} (${lm.id})...`);
            const success = await fetchImage(lm.name, lm.id);
            if (!success) {
                const fallbackUrl = `https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=500&auto=format&fit=crop`; // Generic Monument
                const dest = path.join(dir, `${lm.id}.jpg`);
                await new Promise((res) => {
                    https.get(fallbackUrl, (imgRes) => {
                        const file = fs.createWriteStream(dest);
                        imgRes.pipe(file);
                        file.on('finish', () => { file.close(); res(true); });
                    });
                });
                console.log(`-> Used generic fallback for ${lm.name}`);
            } else {
                console.log(`-> Success for ${lm.name}`);
            }
            await new Promise(r => setTimeout(r, 200)); 
        }
    }
    console.log('Finished downloading images!');
}
run();
