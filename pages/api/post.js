import { createPost, deletePost, getPost, updatePost } from 'lib/api';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function post(req, res) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).end();
  }

  switch (req.method) {
    case 'GET':
      return getPost(req, res, session);
    case 'POST':
      return createPost(req, res);
    case 'DELETE':
      return deletePost(req, res);
    case 'PUT':
      return updatePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);

      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
