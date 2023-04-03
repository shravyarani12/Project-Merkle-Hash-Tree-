const crypto = require('crypto');
const fs = require('fs');

function hashFile(filename) {
  const data = fs.readFileSync(filename);
  const hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
}

function buildTree(filenames) {
  const leaves = filenames.map(hashFile);
  const tree = [leaves];

  while (tree[0].length > 1) {
    const level = [];

    for (let i = 0; i < tree[0].length; i += 2) {
      const left = tree[0][i];
      const right = i + 1 < tree[0].length ? tree[0][i + 1] : '';
      const hash = crypto.createHash('sha1');
      hash.update(left + right);
      level.push(hash.digest('hex'));
    }

    tree.unshift(level);
  }

  return tree;
}

function computeTopHash(tree) {
  if (tree.length === 0) {
    return '';
  }

  if (tree.length === 1) {
    return tree[0][0];
  }

  const hash = crypto.createHash('sha1');

  for (let i = 0; i < tree[1].length; i++) {
    hash.update(tree[1][i]);
  }

  hash.update(computeTopHash(tree.slice(2)));

  return hash.digest('hex');
}

// Example usage
const filenames = ['L1.txt', 'L2.txt', 'L3.txt', 'L4.txt'];
const tree = buildTree(filenames);
const topHash = computeTopHash(tree);
console.log('Top hash:', topHash);

// Demonstrate that top hash changes when a file is modified
fs.appendFileSync('L1.txt', ' extra content');
const modifiedTree = buildTree(filenames);
const modifiedTopHash = computeTopHash(modifiedTree);
console.log('Modified top hash:', modifiedTopHash);