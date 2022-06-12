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
    if (parsedName.length == 3 && dataSeqNums[sensorID] != seqNum) {
        dataSeqNums[sensorID] = seqNum
        if (sensorID == SENSOR1_ID) {
            sensor1RadioNames.shift()
            sensor1RadioValues.shift()
        }
        if (sensorID == SENSOR2_ID) {
            sensor2RadioNames.shift()
            sensor2RadioValues.shift()
        }
    }
    if (parsedName.length == 4) {
        radio.sendValue("" + (1 - seqNum) + ":" + radioID + ":" + sensorID, -1)
        serial.writeString("!" + parsedName[2] + ":" + parsedName[3] + ":" + value + "#")
    }
}
function OnSerialReceivedHandler (cmd: string) {
    if (SENSOR1_CMD.indexOf(cmd) != -1) {
        sensor1RadioNames.push("" + radioID + ":" + (SENSOR1_ID + 1) + ":" + "LED")
        sensor1RadioValues.push(cmd)
        if (dataSeqNums[SENSOR1_ID] == -1) {
            dataSeqNums[SENSOR1_ID] = 0
            radio.sendValue("0" + ":" + sensor1RadioNames[0], parseFloat(cmd))
        }
    }
    if (SENSOR2_CMD.indexOf(cmd) != -1) {
        sensor2RadioNames.push("" + radioID + ":" + (SENSOR2_ID + 1) + ":" + "LED")
        sensor2RadioValues.push(cmd)
        if (dataSeqNums[SENSOR2_ID] == -1) {
            dataSeqNums[SENSOR2_ID] = 0
            radio.sendValue("0" + ":" + sensor2RadioNames[0], parseFloat(cmd))
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
let dataSeqNums: number[] = []
let SENSOR2_CMD: string[] = []
let SENSOR2_ID = 0
let sensor2RadioValues: string[] = []
let sensor2RadioNames: string[] = []
let SENSOR1_CMD: string[] = []
let SENSOR1_ID = 0
let sensor1RadioValues: string[] = []
let sensor1RadioNames: string[] = []
let radioValueBuffers: number[] = []
sensor1RadioNames = []
sensor1RadioValues = []
SENSOR1_ID = 0
SENSOR1_CMD = [
"0",
"1",
"2",
"3"
]
sensor2RadioNames = []
sensor2RadioValues = []
SENSOR2_ID = 0
SENSOR2_CMD = [
"4",
"5",
"6",
"7"
]
dataSeqNums = [-1, -1]
let lastReleaseTimes = [0, 0]
let TIMEOUT = 500
radio.setGroup(244)
RADIO_ID = "1813678"
loops.everyInterval(100, function () {
    if (sensor1RadioNames.length != 0) {
        radio.sendValue("" + dataSeqNums[SENSOR1_ID] + ":" + sensor1RadioNames[0], parseFloat(sensor1RadioValues[0]))
    }
    if (sensor2RadioNames.length != 0) {
        radio.sendValue("" + dataSeqNums[SENSOR2_ID] + ":" + sensor2RadioNames[0], parseFloat(sensor2RadioValues[0]))
    }
})
