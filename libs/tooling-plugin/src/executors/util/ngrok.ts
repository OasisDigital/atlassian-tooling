export async function setupNgrok(port = 3333) {
  try {
    const ngrok = await import('ngrok');
    return await ngrok.connect({ addr: port });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
