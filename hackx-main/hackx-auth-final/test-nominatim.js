const lat = 19.0760;
const lng = 72.8777;
const url = \`https://nominatim.openstreetmap.org/search.php?q=pharmacy&format=jsonv2&extratags=1&limit=10&viewbox=\${lng-0.05},\${lat+0.05},\${lng+0.05},\${lat-0.05}&bounded=1\`;

fetch(url, { headers: { 'User-Agent': 'AarogyaAI/1.0' } })
  .then(r => r.json())
  .then(d => {
    console.log('Nominatim success:', d.length);
    if(d.length > 0) console.log(d[0].display_name, d[0].extratags);
  })
  .catch(e => console.error('Nominatim error:', e.message));
