import { createDomain, deleteDomain } from 'lib/api';
import { unstable_getServerSession } from 'next-auth/next';
import authOptions from '../auth/[...nextauth]';

export default async function domain(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) return res.status(401).end();

  switch (req.method) {
    case 'POST':
      return createDomain(req, res);
    case 'DELETE':
      return deleteDomain(req, res);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
