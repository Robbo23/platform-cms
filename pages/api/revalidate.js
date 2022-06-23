export default async function handler(req, res) {
  const { urlPath } = req.body;
  try {
    await res.unstable_revalidate(urlPath);
    res.status(200).json({
      message: 'OK'
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to revalidate "${urlPath}"`
    });
  }
}
