"use strict";

const process = require("process");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const ctrlOracle = require("./oracle");

const CONST__SECTION__SENSORS_NUM = process.env.SECTION__SENSORS_NUM || 9;
const CONST__DML_INSERT__INTERVAL = process.env.DML_INSERT__INTERVAL || 3000;

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

    throw new Error(
      `Error: No arduino found\n${__filename}.ctrlSerial.fnFindSerialPort`
    );
  },
  fnHandleSerialPort: async function () {
    await this.fnFindSerialPort();
    if (!this.spPath) {
      process.exit(0);
    }
    const spPath = this.spPath;
    console.log(spPath);
    const spOpts = { baudRate: 115200 };
    const sp = new SerialPort(spPath, spOpts);

    sp.on("error", (err) => fnHandleError(err));
    sp.on("open", () => fnHandleStream());

    function fnHandleError(err) {
      console.error(
        `Error: Serialport open error\n${__filename}.fnHandleSerialPort:\n${err}`
      );
      process.exit(1);
    }

    function fnHandleStream() {
      const spParser = sp.pipe(new Readline({ delimiter: "\r\n" }));

      // 데이터의 형태가 문자열로 '80 90 100 89 79 38 47 86 62'와 같은 형태로 한 줄씩 들어온다고 가정.
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
      let nArrStream = [
        [
          /* s1 */
        ],
        [
          /* s2 */
        ],
        [
          /* s3 */
        ],
        [
          /* s4 */
        ],
        [
          /* s5 */
        ],
        [
          /* s6 */
        ],
        [
          /* s7 */
        ],
        [
          /* s8 */
        ],
        [
          /* s9 */
        ],
      ];

      spParser.on("data", (str) => {
        let arrStream = str.split(" ");
        if (arrStream.length !== CONST__SECTION__SENSORS_NUM) return;
        for (let i = 0; i < CONST__SECTION__SENSORS_NUM; ++i) {
          nArrStream[i].push(arrStream[i] * 1);
        }
      });

      setInterval(fnDMLInsertAtIntervals, CONST__DML_INSERT__INTERVAL);

      async function fnDMLInsertAtIntervals() {
        if (nArrStream[0] === 0) return;

        const objValueTable = () => {
          let arrOutput = [];
          for (let i = 0; i < CONST__SECTION__SENSORS_NUM; ++i) {
            arrOutput = [
              ...arrOutput,
              {
                min: Math.min(...nArrStream[i]),
                max: Math.max(...nArrStream[i]),
                avg:
                  nArrStream[i].reduce((x, y) => x + y) / nArrStream[i].length,
                len: nArrStream[i].length,
              },
            ];
            nArrStream[i] = [];
          }

          return arrOutput;
        };
        await ctrlOracle.fnDMLInsert(objValueTable());
      }
    }
  },
};

module.exports = ctrlSerial;
