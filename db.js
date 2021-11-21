const oracleCtrl = require('./controller/oracle');

module.exports = (async function()
{
  await oracleCtrl.fnOperInAdvance();
  process
    .once('SIGTERM', oracleCtrl.fnOperAtTerminatation)
    .once('SIGINT', oracleCtrl.fnOperAtTerminatation);
})();