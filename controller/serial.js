"use strict";

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const oracleCtrl = require('./oracle');

const serialCtrl = {
  fnFindSerialPort: async function()
  {
    if (process.argv[2]) {
      this.spPath = process.argv[2];
      return;
    }

    const arrPorts = await SerialPort.list();

    for (const port of arrPorts) {
      if (/arduino/i.test(port.manufacturer)) {
        this.spPath = port.path;
        return;
      }
    }

    throw new Error('No arduino found.');
  },
  fnHandleSerialPort: async function(secId, sensorId)
  {
    const spPath = this.spPath;

    if (!spPath) {
      process.exit(0);
    }

    const spOpts = {
      baudRate: 9600
    };

    const sp = new SerialPort(spPath, spOpts);

    sp.on('error', fnHandleError);
    sp.on('open', fnHandleStream);

    function fnHandleError()
    {
      console.error(`error:\n${__filename}`);
      process.exit(1);
    }

    function fnHandleStream()
    {
      const spParser = sp.pipe(new Readline({ delimiter: '\r\n' }));

      const arrStream = [];

      // 데이터의 형태가 문자열로 '80 90 100 89 79 38 47'와 같은 형태로 한 줄씩 들어온다고 가정.
      // 데이터를 배열의 형태로 만들고, 2차원의 형태로 추가.
      // 2차원 배열을 수직으로 연산하여 필요한 값을 추출.
      spParser.on('data', strData => {
        arrStream = [...arrStream, strData.split(' ')];
      });

      setInterval(fnDMLInsertAtIntervals, 3000);

      async function fnDMLInsertAtIntervals()
      {
        if (arrStream !== 0) {
          const objValueTable = nArr => { /* Return: Array */ /* Object in Array */
            for (let i=0; i<nArr.length; ++i) {
              for (let j=0; j<nArr.length; ++j) {
                
              }
            }

            return {
              min: Math.min(arr),
              max: Math.max(arr),
              avg: arr.reduce((a, b) => a + b) / arr.length,
              len: arr.length,
            };
          };
          await oracleCtrl.fnDMLInsert(secId, objValueTable(arrStreamData));
        }
      }
    }
  },
}

module.exports = serialCtrl;