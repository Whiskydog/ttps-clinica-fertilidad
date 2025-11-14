  import * as argon2 from 'argon2';
  
async function generateHash() {
  const hash = await argon2.hash('Test123456');
  console.log(hash);
}

generateHash();