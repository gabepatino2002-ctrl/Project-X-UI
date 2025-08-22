// server.js (ui-creator)
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors()); app.use(express.json());
const port = process.env.PORT || 3100;
const THEMES_DIR = process.env.THEMES_DIR || path.join(__dirname, 'themes');

// ensure themes dir exists
fs.mkdir(THEMES_DIR, { recursive: true }).catch(()=>{});

app.get('/', (req,res) => res.json({ok:true,service:'ui-creator',version:'1.0.0'}));

app.get('/themes', async (req,res) => {
  const files = await fs.readdir(THEMES_DIR);
  const themes = [];
  for (const f of files) {
    if (f.endsWith('.json')) {
      const raw = await fs.readFile(path.join(THEMES_DIR,f),'utf8');
      const obj = JSON.parse(raw);
      themes.push({ id: obj.id || f.replace('.json',''), displayName: obj.displayName || obj.id });
    }
  }
  res.json({ themes });
});

app.get('/themes/:id', async (req,res) => {
  const file = path.join(THEMES_DIR, `${req.params.id}.json`);
  try {
    const raw = await fs.readFile(file,'utf8');
    res.type('json').send(raw);
  } catch(e) {
    res.status(404).json({ error: 'not found' });
  }
});

app.post('/themes', async (req,res) => {
  const t = req.body;
  if (!t || !t.id) return res.status(400).json({error:'missing id'});
  const file = path.join(THEMES_DIR, `${t.id}.json`);
  await fs.writeFile(file, JSON.stringify(t, null, 2), 'utf8');
  res.json({ ok:true, id: t.id });
});

app.listen(port, ()=>console.log(`UI Creator listening on ${port}`));
