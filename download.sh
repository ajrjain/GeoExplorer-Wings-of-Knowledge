#!/bin/bash
regions=("France" "Japan" "Brazil" "Egypt" "USA" "Australia" "Pacific_Ocean")
for region in "${regions[@]}"; do
  while true; do
    echo "Downloading $region..."
    curl -s -L -o "public/assets/maps/$region.jpg" "https://image.pollinations.ai/prompt/high_resolution_satellite_map_of_${region}_top_down_view_vibrant_distinct_mountains_oceans_geography_video_game_style?width=1024&height=1024&nologo=true"
    
    # Check if the file is a valid jpeg or at least > 10kb
    SIZE=$(stat -c%s "public/assets/maps/$region.jpg")
    if [ "$SIZE" -gt 10000 ]; then
      echo "$region downloaded successfully."
      break
    else
      echo "$region failed (size $SIZE). Retrying in 5 seconds..."
      sleep 5
    fi
  done
done
