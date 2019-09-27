const http = require('./http');

const _config = {
  from: new Date(),
  owner: '',
  repo: '',
  codecov: {
    domain: '',
    isEnterprise: false,
    authorization: false,
    token: false
  },
  debug: false
};

let pullRequests;
let page = 0;
let authorStats;
let repoStats;

const start = async (config) => {
  pullRequests = [];
  lastPullRequest = false;
  const options = { ..._config, ...config };
  if (config.debug) {
    console.log('Fetching PRs...');
  }
  await getCodecovPullRequests(options);
  return {
    authorStats,
    repoStats,
    pullRequests
  };
}

const getCodecovPullRequests = async (config) => {
  page++;
  if (config.debug) {
    console.log('Fetching page', page);
  }
  let data = {};
  try {
    const gh = config.codecov.isEnterprise ? 'ghe' : 'gh';
    const url = `https://${config.codecov.domain}/api/${gh}/${config.owner}/${config.repo}/pulls?state=merged&sort=pullid&order=desc`;
    const options = {
      authorization: config.codecov.authorization,
      token: config.codecov.token,
      debug: config.debug,
      withPage: true,
      page
    };
    data = await http.openAndRequest(url, options);
  } catch (error) {
    data.error = error;
  }

  if (data.error) {
    console.log('codecov.js', 'try:', data.error);
  } else {
    await processCoverage(data, config);
    computeStatsPerAuthor();
    computeStatsPerRepository(config);
  }
}

const processCoverage = async (response, config) => {
  if (!response) {
    console.log('No more data.');
    return;
  }

  const pulls = response.pulls;
  if (!Array.isArray(pulls) || pulls.length === 0) {
    if (config.debug) {
      console.log('Fetched all relevant PRs.');
    }
    return;
  }

  if (config.debug) {
    console.log('PR found:', pulls.length);
  }

  pulls.forEach(pr => {
    const date = new Date(pr.updatestamp);
    if (config.debug) {
      console.log('PR date:', date);
    }

    if (pr.head && date.getTime() >= config.from.getTime()) {
      const author = pr.head && pr.head.author ? pr.head.author.username : pr.author ? pr.author.username : 'unknown';
      const pullRequestNumber = pr.issueid;
      const diff = pr.head.totals.c - pr.base.totals.c;
      pullRequests.push({ author, pullRequestNumber, diff });
    }
  });

  await getCodecovPullRequests(config);
}

const computeStatsPerAuthor = () => {
  authorStats = {};
  pullRequests.forEach(pr => {
    if (authorStats[pr.author]) {
      authorStats[pr.author] += pr.diff;
    } else {
      authorStats[pr.author] = pr.diff;
    }
  });
}

const computeStatsPerRepository = (config) => {
  let diff = 0;
  pullRequests.forEach(pr => {
    diff += pr.diff;
  });
  repoStats = {
    owner: config.owner,
    repo: config.repo,
    diff
  };
}

module.exports = {
  start: start
}