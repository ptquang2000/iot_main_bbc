// name ex:
// 0:1813678:1:TEMP
function OnRadioReceivedHandler (name: string, value: number) {
    parsedName = name.split(":")
    seqNum = parseFloat(parsedName[0])
    radioID = parsedName[1]
    sensorID = parseFloat(parsedName[2]) - 1
    if (radioID != RADIO_ID) {
        RadioDebugger(3, seqNum)
        basic.showNumber(parseFloat(radioID))
        return
    }
    // ACK
    if (parsedName.length == 3 && dataSeqNums[sensorID] != seqNum) {
        RadioDebugger(2, seqNum)
        dataSeqNums[sensorID] = seqNum
        for (let index = 0; index <= TOTAL_SENSORS - 1; index++) {
            if (sensorID == index) {
                radioNameBuffers[index].shift()
                radioValueBuffers[index].shift()
            }
            // continue releasing if there are still frames left in buffers.
            if (radioNameBuffers[index].length != 0) {
                releaseBuffer(index)
            }
        }
    }
    // FRAME
    if (parsedName.length == 4) {
        dataType = parsedName[3]
        if (dataType == "0") {
            dataType = "TEMP"
        }
        if (dataType == "1") {
            dataType = "LIGHT"
        }
        // flip sequence number
        // SENSOR_ID
        radio.sendValue("" + (1 - seqNum) + ":" + RADIO_ID + ":" + parsedName[2], -1)
        RadioDebugger(1, 1 - seqNum)
        serial.writeString("!" + parsedName[2] + ":" + dataType + ":" + value + "#")
    }
}
// release first frame in buffer
function releaseBuffer (id: number) {
    radio.sendValue("" + dataSeqNums[id] + ":" + radioNameBuffers[id][0], parseFloat(radioValueBuffers[id][0]))
    lastReleaseTimes[id] = control.millis()
    RadioDebugger(0, dataSeqNums[id])
}
function OnSerialReceivedHandler (cmd: string) {
    if (SENSOR1_CMD.indexOf(cmd) != -1) {
        sensor1RadioNames.push("" + RADIO_ID + ":" + SENSOR1_ID + ":" + "LED")
        sensor1RadioValues.push(cmd)
    }
    if (SENSOR2_CMD.indexOf(cmd) != -1) {
        sensor2RadioNames.push("" + RADIO_ID + ":" + SENSOR2_ID + ":" + "LED")
        sensor2RadioValues.push(cmd)
    }
    // releasing immediately if buffer is empty
    for (let index2 = 0; index2 <= TOTAL_SENSORS - 1; index2++) {
        if (radioNameBuffers[index2].length == 1) {
            releaseBuffer(index2)
        }
    }
}
function RadioDebugger (_type: number, seg: number) {
    if (_type == 0) {
        basic.showLeds(`
            . . # . .
            . # . # .
            # . # . #
            . # . # .
            # . . . #
            `)
        basic.pause(50)
        basic.showLeds(`
            . . # . .
            . # . # .
            # . # . #
            . # . # .
            # . . . #
            `)
    } else if (_type == 1) {
        basic.showLeds(`
            # . . . #
            . # . # .
            # . # . #
            . # . # .
            . . # . .
            `)
        basic.pause(50)
        basic.showLeds(`
            # . . . #
            . # . # .
            # . # . #
            . # . # .
            . . # . .
            `)
    } else if (_type == 2) {
        basic.showLeds(`
            . # # . .
            # . . # .
            # . . # .
            # . . # .
            . # # . .
            `)
        basic.pause(50)
        basic.showLeds(`
            # . . # .
            # . # . .
            # # . . .
            # . # . .
            # . . # .
            `)
    } else {
        basic.showLeds(`
            # . . . #
            . # . # .
            . . # . .
            . # . # .
            # . . . #
            `)
        basic.pause(50)
        basic.showLeds(`
            # . . . #
            . # . # .
            . . # . .
            . # . # .
            # . . . #
            `)
    }
    basic.pause(50)
    basic.showNumber(seg)
    basic.pause(50)
    basic.clearScreen()
}
serial.onDataReceived(serial.delimiters(Delimiters.Hash), function () {
    OnSerialReceivedHandler(serial.readUntil(serial.delimiters(Delimiters.Hash)))
})
radio.onReceivedValue(function (name, value) {
    OnRadioReceivedHandler(name, value)
})
let dataType = ""
let sensorID = 0
let radioID = ""
let seqNum = 0
let parsedName: string[] = []
let RADIO_ID = ""
let TOTAL_SENSORS = 0
let radioValueBuffers: string[][] = []
let radioNameBuffers: string[][] = []
let lastReleaseTimes: number[] = []
let dataSeqNums: number[] = []
let SENSOR2_CMD: string[] = []
let SENSOR2_ID = 0
let sensor2RadioValues: string[] = []
let sensor2RadioNames: string[] = []
let SENSOR1_CMD: string[] = []
let SENSOR1_ID = 0
let sensor1RadioValues: string[] = []
let sensor1RadioNames: string[] = []
serial.setBaudRate(BaudRate.BaudRate115200)
serial.redirectToUSB()
sensor1RadioNames = []
sensor1RadioValues = []
SENSOR1_ID = 1
SENSOR1_CMD = [
"0",
"1",
"2",
"3"
]
sensor2RadioNames = []
sensor2RadioValues = []
SENSOR2_ID = 2
SENSOR2_CMD = [
"4",
"5",
"6",
"7"
]
dataSeqNums = [0, 0]
lastReleaseTimes = [0, 0]
radioNameBuffers = [sensor1RadioNames, sensor2RadioNames]
radioValueBuffers = [sensor1RadioValues, sensor2RadioValues]
let sensorCommands = [SENSOR1_CMD, SENSOR2_CMD]
let TIMEOUT = 5000
TOTAL_SENSORS = 2
radio.setGroup(244)
RADIO_ID = "55"
basic.forever(function () {
    for (let index3 = 0; index3 <= TOTAL_SENSORS - 1; index3++) {
        if (radioNameBuffers[index3].length != 0 && control.millis() - lastReleaseTimes[index3] >= TIMEOUT) {
            releaseBuffer(index3)
        }
    }
})
