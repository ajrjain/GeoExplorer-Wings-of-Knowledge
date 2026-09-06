import fs from 'fs';
import https from 'https';

const regions = ['France', 'Japan', 'Brazil', 'Egypt', 'USA', 'Australia', 'Pacific Ocean'];
fs.mkdirSync('public/assets/maps', { recursive: true });

regions.forEach(region => {
  const mapName = region.replace(' ', '_');
  const url = `https://image.pollinations.ai/prompt/high_resolution_satellite_map_of_${mapName}_top_down_view_vibrant_distinct_mountains_oceans_geography_video_game_style?width=1024&height=1024&nologo=true`;
  const file = fs.createWriteStream(`public/assets/maps/${mapName}.jpg`);
  
  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${mapName}`);
    });
  }).on('error', err => {
    console.error(`Error downloading ${mapName}:`, err.message);
  });
});
