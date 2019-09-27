const codecov = require('./utils/codecov');

const about = () => {
  console.log("codecov-stats, easily retrieve codecov data.");
}


const getStats = async (options = {}) => {
  let data = {};
  try {
    data = await codecov.start(options);
  } catch (error) {
    data.error = error;
  }

  return data;
}

module.exports = {
  about,
  getStats
}