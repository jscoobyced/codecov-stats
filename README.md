## Codecov-stats

This package helps for easy retrieval of codecov statistics.

# How to use

Create a [token](https://docs.codecov.io/reference#authorization) in codecov.

You need to have at least one report in codecov associated to a pull request. Currently only `merged` PRs will contribute to the data.

The `from` date is used to limit the PRs that contribute to the statistics. Only PRs after this date will be included.

Sample code:

```
const codecov = require('./index');

const options = {
  from: new Date('2019-07-01 00:00:00'),
  owner: 'your_username_or_org_id',
  repo: 'your_repository',
  codecov: {
    domain: 'codecov.io',
    isEnterprise: false,
    authorization: 'token',
    token: 'your_token'
  },
  debug: false
};

const run = async () => {
  const data = await codecov.getStats(options);
  console.log(data);
}

run();
```

This will print into the console a JSON object with 3 properties:
- authorStats: diff of code coverage per author
- repoStats: overall code coverage diff
- pullRequests: detail per pull request

# If you have codecov Enterprise

Beta version: It is not fully tested.

Change the property `config.codecov.isEnterprise` to `true`.

