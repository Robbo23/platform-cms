import { getPlaiceholder } from 'plaiceholder';

export default async function blurhash(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { url } = req.query;
  if (Array.isArray(url))
    return res.status(400).end('Bad request. URL parameter cannot be an array of urls.');
  try {
    const { blurhash } = await getPlaiceholder(url);
    res.status(200).json(blurhash);
  } catch (error) {
    console.error(error);
    res.status(500).end(error);
  }
}
