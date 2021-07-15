const sharp = require('sharp');

const SIZE = 32;

async function createSprites() {
  console.log('- Loading original');
  const iconSetBuf = await sharp('../tmp/Iconset.png').toBuffer();

  const images = [];
  let rows = 0;

  async function copySprite(sx, sy, tx, ty, width, height) {
    width |= SIZE;
    height |= SIZE;

    const left = sx * SIZE;
    const top = sy * SIZE;

    if (ty + 1 > rows) {
      rows = ty + 1;
    }

    let dim = '';
    if (width != SIZE || height != SIZE) {
      dim = `(${width} x ${height})`;
    }

    console.log(`- Copying from ${sx},${sy} to ${tx},${ty} ${dim}`);
    const input = await sharp(iconSetBuf)
      .extract({ width, height, left, top })
      .toBuffer();
    const image = {
      input,
      left: tx * SIZE,
      top: ty * SIZE,
    };
    images.push(image);
  }

  // Plain weapons, two nearly full rows become first cell of 28 rows
  for (let i = 0; i < 16; i++) {
    await copySprite(i, 6, 0, i);
  }
  for (let i = 0; i < 12; i++) {
    await copySprite(i, 7, 0, i + 16);
  }

  // Special weapons, shifting right
  await copySprite(0, 69, 1, 0, 16 * SIZE - 1, 28 * SIZE - 1);

  // Plain armor, two nearly full rows become first cell of 27 rows
  for (let i = 0; i < 16; i++) {
    await copySprite(i, 8, 0, i + 28);
  }
  for (let i = 0; i < 11; i++) {
    await copySprite(i, 9, 0, i + 44);
  }

  // Special armor, shifting right
  await copySprite(0, 98, 1, 28, 16 * SIZE - 1, 27 * SIZE - 26);

  console.log('- Compositing');

  return sharp({
    create: {
      width: 17 * SIZE,
      height: rows * SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(images)
    .toFile('../images/sprites.png');
}

console.log('Creating sprites');
createSprites()
  .then((info) => {
    console.log('Done', info);
  })
  .catch((e) => {
    console.error('Failed', e);
  });
