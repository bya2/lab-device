"use strict";

const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const ctrlOracle = require("./oracle");

const CONST_NUM_OF_SENSORS = 6;

const ctrlSerial = {
  fnFindSerialPort: async function () {
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

    throw new Error("No arduino found.");
  },
  fnHandleSerialPort: async function (secId, sensorId) {
    const spPath = this.spPath;

    if (!spPath) {
      process.exit(0);
    }

    const spOpts = {
      baudRate: 9600,
    };

    const sp = new SerialPort(spPath, spOpts);

    sp.on("error", (err) => fnHandleError(err));
    sp.on("open", () => fnHandleStream());

    function fnHandleError(err) {
      console.error(`error:\n${__filename}:\n${err}`);
      process.exit(1);
    }

    function fnHandleStream() {
      const spParser = sp.pipe(new Readline({ delimiter: "\r\n" }));

      const nArrStreamSet = [];
      for (let i = 0; i < CONST_NUM_OF_SENSORS; ++i) {
        nArrStreamSet = [...nArrStreamSet, []];
      }

      // 데이터의 형태가 문자열로 '80 90 100 89 79 38 47'와 같은 형태로 한 줄씩 들어온다고 가정.
      // 데이터를 배열의 형태로 만들고, 2차원의 형태로 추가.
      // 추가하기 전, 배열의 개수가 센서의 수와 동일한 지 확인.
      // 2차원 배열을 데이터 테이블로 정의한다면, 하나의 COLUMN의 평균값을 계산.

      // 만약 데이터가 발생하지 않은 센서가 있을 경우, 평균값으로 처리해야할 지, 해당 ROW를 NaN으로 처리해야할 지에 대해서 팀원들과 상의 필요.
      /*
       * 아두이노 IDE 실행 결과 데이터가 발생하지 않는 센서가 발생하는 경우가 있음.
       * 기차와 가까운 특정 센서만 소리를 감지하고 데이터를 발생시키는 것으로 보임.
       * 데이터가 발생하지 않으면 0을 출력하는 것으로 코드 작성.
       * 현재 코드는 NaN으로 처리하고 해당 ROW를 삭제.
       */
      spParser.on("data", (strData) => {
        const arrData = strData.split(" ");
        if (!arrData || arrData.length !== CONST_NUM_OF_SENSORS) {
          return;
        }

        for (let i = 0; i < CONST_NUM_OF_SENSORS; ++i) {
          nArrStreamSet[i] = [...nArrStreamSet[i], arrData[i]];
        }
      });

      setInterval(fnDMLInsertAtIntervals, 3000);

      async function fnDMLInsertAtIntervals() {
        if (arrStream !== 0) {
          const objValueTable = (nArr) => {
            const arr = [];

            for (let i = 0; i < CONST_NUM_OF_SENSORS; ++i) {
              arr = [
                ...arr,
                {
                  min: Math.min(nArr[i]),
                  max: Math.max(nArr[i]),
                  avg: nArr[i].reduce((a, b) => a + b) / nArr[i].length,
                  len: nArr[i].length,
                },
              ];
            }

            /* Return: Array */ /* Object in Array */
            return arr;
          };
          await ctrlOracle.fnDMLInsert(secId, objValueTable(nArrStreamSet));
        }
      }
    }
  },
};

module.exports = ctrlSerial;
