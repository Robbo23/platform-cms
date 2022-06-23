export async function fetcher(input, init) {
  const response = await fetch(input, init);
  return response.json();
}

export default fetcher;
