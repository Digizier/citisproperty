const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.jyfxflqsqlngwpfjleiy:85zWZDE%2F4p9%40W4P@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to PG');

  await client.query(`
    ALTER TABLE public.societies ADD COLUMN IF NOT EXISTS master_plan_image_url TEXT;
  `);
  console.log('Added master_plan_image_url column');

  await client.query(`
    UPDATE public.societies 
    SET master_plan_image_url = '/maps/citi-housing-master-plan-hd.webp', 
        master_plan_pdf_url = '/maps/property-bank-master-plan.pdf'
    WHERE slug = 'citi-housing-samundri-road';
  `);
  console.log('Updated Citi Housing society with HD map image and property bank PDF');

  // Let's also check if other societies can be seeded or existing blocks
  const socs = await client.query(`SELECT id, name, master_plan_image_url, master_plan_pdf_url FROM public.societies`);
  console.log('Societies:', socs.rows);

  await client.end();
}

migrate().catch(console.error);
