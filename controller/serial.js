"use strict";

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const oracleCtrl = require('./oracle');

const SECTION = process.env.DB_TABLE_SECTION;
const SENSOR = process.env.DB_TABLE_SENSOR;

if (!SECTION || !SENSOR) {
  process.exit(1);
}

const serialCtrl = {
  fnGetArduinoPort: async function()
  {
    if (process.argv[2]) {
      return process.argv[2];
    }

    const arrPorts = await SerialPort.list();
    for (const port of arrPorts) {
      if (/arduino/i.test(port.manufacturer)) {
        this.path = port.path;
        return;
      }
    }
    throw new Error('No arduino found.');
  },
  fnHandleStream: async function()
  {
    if (!this.path) {
      return;
    }

    const portOpts = {
      baudRate: 9600,
    };

    const currPort = new SerialPort(this.path, portOpts);

    currPort.on('error', fnHandleErrorInPort);
    currPort.on('open', fnControlStreamInPort);

    function fnHandleErrorInPort(err)
    {
      if (err) {
        console.error(`Error:\n${__filename}`);
        process.exit(1);
      }
    }

    function fnControlStreamInPort()
    {
      const parser = currPort.pipe(new Readline({ delimiter: '\r\n' }));
      const arrStreamData = [];
      parser.on('data', val => { arrStreamData = [...arrStreamData, val] });

      setInterval(() => {
        if (arrStreamData !== 0) {
          const objValueTable = arr => {
            return {
              min: Math.min(arr),
              max: Math.max(arr),
              avg: arr.reduce((a, b) => a + b) / arr.length,
              len: arr.length,
            };
          };
          await oracleCtrl.fnDMLInsert(SECTION, objValueTable(arrStreamData));
        }
      }, 3000);
    } 
  },
};

module.exports = serialCtrl;