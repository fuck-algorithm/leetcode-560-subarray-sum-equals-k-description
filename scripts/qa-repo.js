const { execFileSync } = require('node:child_process');

const repo = 'fuck-algorithm/leetcode-560-subarray-sum-equals-k-description';
const token = process.env.GH_TOKEN;
const args = ['api', `repos/${repo}`, '--jq', '{description, homepage}'];
const topicsArgs = ['api', `repos/${repo}/topics`, '--jq', '.names'];
const env = { ...process.env, ...(token ? { GH_TOKEN: token } : {}) };

try {
  const metadata = JSON.parse(execFileSync('gh', args, { encoding: 'utf8', env }));
  const topics = JSON.parse(execFileSync('gh', topicsArgs, { encoding: 'utf8', env }));
  const required = ['leetcode', 'algorithm', 'visualization', 'typescript', 'react', 'd3'];
  const validDescription = typeof metadata.description === 'string' && metadata.description.length >= 20 && !/[㐀-鿿]/.test(metadata.description);
  if (!validDescription) throw new Error('Repository description must be English and at least 20 characters.');
  if (!metadata.homepage?.startsWith('https://')) throw new Error('Repository homepage must contain the HTTPS Pages URL.');
  const missing = required.filter((topic) => !topics.includes(topic));
  if (missing.length) throw new Error(`Missing repository topics: ${missing.join(', ')}`);
  console.log('Repository metadata PASS');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
