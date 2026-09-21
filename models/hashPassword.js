const bcrypt = require('bcryptjs');

async function main() {
  const adminHash = await bcrypt.hash('adminpass123', 10);
  const devHash = await bcrypt.hash('devpass123', 10);

  console.log('ADMIN hash:', adminHash);
  console.log('DEV hash:', devHash);
}

main();