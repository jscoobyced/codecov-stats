const http = require('./http');

let _config = {
  from: new Date(),
  owner: '',
  repo: '',
  codecov: {
    domain: '',
    isEnterprise: false,
    authorization: false,
    token: false
  },
  github: {
    domain: '',
    isEnterprise: true,
    authorization: false,
    token: false
  },
  debug: false
};

let pullRequests;
let lastPullRequest;
let page = 0;
let authorStats;

const start = async (config) => {
  pullRequests = [];
  lastPullRequest = false;
  const options = { ..._config, ...config };
  if (config.debug) {
    console.log(config);
  }
  await getCodecovPullRequests(options);
  return {
    authorStats,
    pullRequests
  };
}

const getCodecovPullRequests = async (config) => {
  page++;
  console.log('Fetching page', page);
  let data = {};
  try {
    const url = `https://${config.codecov.domain}/api/ghe/${config.owner}/${config.repo}/pulls?state=closed&sort=pullid&order=desc`;
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
  }
}

const processCoverage = async (response, config) => {
  if (config.debug) {
    console.log(response);
  }
  if (!response) {
    console.log('No more data.');
    return;
  }

  const pulls = response.pulls;
  if (!Array.isArray(pulls) || pulls.length === 0) {
    console.log('Fetched all relevant PRs. Getting stats...');
    return;
  }

  pulls.forEach(pr => {
    const date = new Date(pr.updatestamp);
    if (date.getTime() < config.from.getTime()) {
      lastPullRequest = true;
      return;
    }
    const author = pr.head.author ? pr.head.author.username : pr.author ? pr.author.username : 'unknown';
    const pullRequestNumber = pr.issueid;
    const diff = pr.head.totals.c - pr.base.totals.c;
    pullRequests.push({ author, pullRequestNumber, diff });
  });

  if (!lastPullRequest) {
    await getCodecovPullRequests(config);
  } else {
    computeStatsPerAuthor();
  }
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

module.exports = {
  start: start
}