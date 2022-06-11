function OnRadioReceivedHandler (name: string, value: number) {
    parsedName = name.split(":")
    sequenceNum = parseFloat(parsedName[0])
    radioID = parsedName[1]
    sensorID = parseFloat(parsedName[2]) - 1
    if (radioID != RADIO_ID) {
        return
    }
    if (parsedName.length == 3 && dataSeqNum[sensorID] != sequenceNum) {
        dataSeqNum[sensorID] = sequenceNum
        radioNameBuffer.shift()
        radioValueBuffer.shift()
    }
    if (parsedName.length == 4) {
        dataType = parsedName[3]
        radio.sendValue("" + (1 - sequenceNum) + ":" + radioID + ":" + sensorID, -1)
        serial.writeString("!" + sensorID + ":" + dataType + ":" + value + "#")
    }
}
function OnSerialReceivedHandler (cmd: string) {
    let list: string[] = []
    msg = "" + radioID
    if (list.indexOf(cmd) != -1) {
        msg = "" + msg + (":" + LED_SENSOR_ID + ":" + "LED")
    } else {
        return
    }
    radioNameBuffer.push(msg)
    radioValueBuffer.push(cmd)
}
serial.onDataReceived(serial.delimiters(Delimiters.Hash), function () {
    OnSerialReceivedHandler(serial.readUntil(serial.delimiters(Delimiters.Hash)))
})
radio.onReceivedValue(function (name, value) {
    OnRadioReceivedHandler(name, value)
})
let msg = ""
let dataType = ""
let sensorID = 0
let radioID = ""
let sequenceNum = 0
let parsedName: string[] = []
let LED_SENSOR_ID = 0
let RADIO_ID = ""
let dataSeqNum: number[] = []
let radioValueBuffer: string[] = []
let radioNameBuffer: string[] = []
radioNameBuffer = []
radioValueBuffer = []
dataSeqNum = [0, 0]
radio.setGroup(244)
RADIO_ID = "1813678"
LED_SENSOR_ID = 1
let LED_CMD = [
"0",
"1",
"2",
"3"
]
loops.everyInterval(100, function () {
    if (radioNameBuffer.length != 0) {
        radio.sendValue("" + dataSeqNum[LED_SENSOR_ID - 1] + ":" + radioNameBuffer[0], parseFloat(radioValueBuffer[0]))
    }
})
