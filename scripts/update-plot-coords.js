const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

async function updatePlotCoords() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const updates = [
    { num: '12', x: 460, y: 340 },
    { num: '45', x: 580, y: 260 },
    { num: '88', x: 1160, y: 310 },
    { num: '120', x: 1290, y: 340 },
    { num: '205', x: 840, y: 530 },
    { num: '250', x: 960, y: 610 },
    { num: '310', x: 1240, y: 720 },
    { num: '415', x: 1620, y: 750 },
  ];

  for (const u of updates) {
    await client.query(`UPDATE public.plots SET coord_x = $1, coord_y = $2 WHERE plot_number = $3`, [u.x, u.y, u.num]);
  }

  console.log('Updated plot coordinates for real master plan!');
  await client.end();
}

updatePlotCoords().catch(console.error);
