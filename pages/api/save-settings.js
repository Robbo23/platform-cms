import prisma from 'lib/prisma';

export default async function SaveSiteSettings(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const data = JSON.parse(req.body);
  try {
    const response = await prisma.user.update({
      where: {
        id: data.id
      },
      data: {
        name: data.name,
        email: data.email,
        image: data.image
      }
    });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).end(error);
  }
}
