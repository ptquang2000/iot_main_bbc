// name ex:
// 0:1813678:1:TEMP
function OnRadioReceivedHandler (name: string, value: number) {
    parsedName = name.split(":")
    seqNum = parseFloat(parsedName[0])
    radioID = parsedName[1]
    sensorID = parseFloat(parsedName[2]) - 1
    if (radioID != RADIO_ID) {
        return
    }
    // ACK
    if (parsedName.length == 3 && dataSeqNums[sensorID] != seqNum) {
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
        // flip sequence number
        // SENSOR_ID
        radio.sendValue("" + (1 - seqNum) + ":" + RADIO_ID + ":" + parsedName[2], -1)
        serial.writeString("!" + parsedName[2] + ":" + parsedName[3] + ":" + value + "#")
    }
}
// release first frame in buffer
function releaseBuffer (id: number) {
    radio.sendValue("" + dataSeqNums[id] + ":" + radioNameBuffers[id][0], parseFloat(radioValueBuffers[id][0]))
    lastReleaseTimes[id] = control.millis()
}
function OnSerialReceivedHandler (cmd: string) {
    if (SENSOR1_CMD.indexOf(cmd) != -1) {
        sensor1RadioNames.push("" + radioID + ":" + SENSOR1_ID + ":" + "LED")
        sensor1RadioValues.push(cmd)
    }
    if (SENSOR2_CMD.indexOf(cmd) != -1) {
        sensor2RadioNames.push("" + radioID + ":" + SENSOR2_ID + ":" + "LED")
        sensor2RadioValues.push(cmd)
    }
    // releasing immediately if buffer is empty
    for (let index = 0; index <= TOTAL_SENSORS - 1; index++) {
        if (radioNameBuffers[index].length == 1) {
            releaseBuffer(index)
        }
    }
}
serial.onDataReceived(serial.delimiters(Delimiters.Hash), function () {
    OnSerialReceivedHandler(serial.readUntil(serial.delimiters(Delimiters.Hash)))
})
radio.onReceivedValue(function (name, value) {
    OnRadioReceivedHandler(name, value)
})
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
let TIMEOUT = 500
TOTAL_SENSORS = 2
radio.setGroup(244)
RADIO_ID = "1813678"
control.inBackground(function () {
    while (true) {
        for (let index = 0; index <= TOTAL_SENSORS - 1; index++) {
            if (radioNameBuffers[index].length != 0 && lastReleaseTimes[index] - control.millis() >= TIMEOUT) {
                releaseBuffer(index)
            }
        }
    }
})
