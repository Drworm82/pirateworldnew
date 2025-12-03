import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerRoutes(app) {
  app.get('/files', (req, res) => {
    const directoryPath = __dirname;
    fs.readdir(directoryPath, (err, files) => {
      if (err) return res.status(500).json({ error: 'No se pudo leer el directorio' });
      res.json({ files });
    });
  });

  app.get('/read', (req, res) => {
    const { path: filePath } = req.query;
    if (!filePath) return res.status(400).json({ error: 'Falta parámetro ?path=' });
    const absolutePath = path.join(__dirname, filePath);
    fs.readFile(absolutePath, 'utf-8', (err, data) => {
      if (err) return res.status(500).json({ error: 'No se pudo leer el archivo' });
      res.send(data);
    });
  });

  app.post('/write', (req, res) => {
    const { file, content } = req.body;
    if (!file || !content) return res.status(400).json({ error: 'Faltan parámetros file y content' });
    const absolutePath = path.join(__dirname, file);
    fs.writeFile(absolutePath, content, 'utf-8', (err) => {
      if (err) return res.status(500).json({ error: 'No se pudo escribir el archivo' });
      res.json({ ok: true, file });
    });
  });
}
