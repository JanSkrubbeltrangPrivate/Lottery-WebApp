const KEY = "LotteryData"
let DATA = LoadFromLocalStorage(KEY)

RenderparticipantLines(DATA)

function SavetoLocalStorage(key, Data) {
    const telegram = { Version: "1.0", Data: Data }

    const jsonString = JSON.stringify(telegram);
    window.localStorage.setItem(key, jsonString)
}

function LoadFromLocalStorage(key) {
    const jsonString = window.localStorage.getItem(key)
    const data = parseJsonString(jsonString)
    validateContent(data)
    return data
}

function parseJsonString(input) {
    if (input == null) return []
    const storedData = JSON.parse(input)
    if (storedData == null) return []
    if (!Array.isArray(storedData)) {
        if (storedData.Data !== null) {
            return storedData.Data;
        }
    }
    return []


}

function GiveTicket() {
    const SelectorContainer = document.querySelector(".ticket-holder")
    const participant = SelectorContainer.value
    const quantity = document.querySelector(".ticket-quantity")
    if (participant == "") return
    if (quantity == null) return
    const found = DATA.filter(data => data.name == participant)
    if (found.length > 0) {
        found[0].tickets += parseInt(quantity.value, 10)
    } else {
        const newRec = { name: participant, tickets: parseInt(quantity.value, 10) }
        DATA.push(newRec)
    }
    RenderparticipantLines(DATA)
    SelectorContainer.value = ""
}

function TakeTicket() {
    const SelectorContainer = document.querySelector(".ticket-holder")
    const participant = SelectorContainer.value
    const quantity = document.querySelector(".ticket-quantity")
    if (participant == "") return
    if (quantity == null) return
    const found = DATA.filter(data => data.name == participant)
    if (found.length > 0) {
        if (found[0].tickets > parseInt(quantity.value, 10)) {
            found[0].tickets -= parseInt(quantity.value, 10)
        } else {
            const index = DATA.map(e => e.name).indexOf(participant);
            DATA.splice(index, 1)
        }
    }
    RenderparticipantLines(DATA)
    SelectorContainer.value = ""
}

function GetNumberofTickets(data) {
    return data.map(e => e.tickets).reduce((partialSum, a) => partialSum + a, 0)
}

function ClearTickets() {
    if (confirm("Are you sure you want to clear all tickets?")) {
        while (DATA.length > 0) DATA.pop()
        RenderparticipantLines(DATA)
    }
}

function DrawTicket() {
    if (confirm("Are you sure you want to draw a winner?")) {
        if (DATA.length == 0) return

        const sortedData = DATA.sort((a, b) => a.name.localeCompare(b.name))

        const numberofTickets = GetNumberofTickets(sortedData)
        let draw = Math.floor(Math.random() * numberofTickets) + 1
        const total = document.getElementById("winner-tickets")
        const drawn = document.getElementById("winner-ticket")
        const window = document.querySelector(".winner-plaque")
        const background = document.querySelector(".winner-banner")
        const winnerfound = document.querySelector(".winner-name")
        if (winnerfound) window.removeChild(winnerfound)
        background.hidden = false
        SetButtonState(true)
        total.innerText = numberofTickets
        drawn.innerText = draw
        const players = document.querySelector(".winner-list")
        while (players.firstChild) {
            players.removeChild(players.lastChild)
        }
        let index = 0
        let winner
        for (let i = 0; i < sortedData.length; i++) {
            const playerDiv = document.createElement("div")
            const player = sortedData[i]
            const start = index + 1
            const end = player.tickets + index
            playerDiv.innerText = `${player.name} (${start} - ${end})`
            players.append(playerDiv)
            index += player.tickets
            if (start <= draw && draw <= end) winner = player;
        }
        const playerDiv = document.createElement("div")
        playerDiv.innerText = `Winner is ${winner.name}`
        playerDiv.classList.add('winner-name')
        window.append(playerDiv)
    }
}

function SetButtonState(state) {
    const buttons = document.querySelectorAll(".button")
    for (let i = 0; i < buttons.length; i++) buttons[i].disabled = state
}

function HideWinner() {
    const window = document.querySelector(".winner-banner")
    window.hidden = true;
    SetButtonState(false)
}

function RenderparticipantLines(data) {

    const participantContainer = document.querySelector(".participant-rows")

    while (participantContainer.firstChild) {
        participantContainer.removeChild(participantContainer.lastChild)
    }
    if (data.length > 0) {
        data.sort((a, b) => a.name.localeCompare(b.name)).forEach(value => {
            const name = document.createElement('div')
            name.textContent = value.name
            name.classList.add("participant-name")
            participantContainer.append(name);
            const tickets = document.createElement('div')
            tickets.textContent = value.tickets
            tickets.classList.add("participant-ticket")
            participantContainer.append(tickets)

        })
    }

    const totalSpan = document.getElementById("total-tickets")
    if (totalSpan != null) totalSpan.innerText = GetNumberofTickets(data)
    const quantity = document.querySelector(".ticket-quantity")
    if (quantity != null) quantity.value = 1
    SetSelector(data)
    SavetoLocalStorage(KEY, data)
}

function SetSelector(participants) {
    const SelectorContainer = document.querySelector(".ticket-holders")

    while (SelectorContainer.firstChild) {
        SelectorContainer.removeChild(SelectorContainer.lastChild)
    }

    participants.sort().forEach(value => {
        const option = document.createElement("option")
        option.text = value.name
        SelectorContainer.append(option)
    })
}

function ExportTickets() {
    if (confirm("Are you sure you want to import datafile?")) {
        const jsonString = window.localStorage.getItem(KEY)
        download(jsonString, 'Tickets.txt', 'text/plain')
    }
}

function ImportTickets() {
    if (confirm("Are you sure you want to import datafile?")) getContent()
}

async function getContentAsync() {
    let [fh] = await window.showOpenFilePicker()
    const file = await fh.getFile()
    const contents = await file.text()
    return contents
}

function getContent() {
    let filelist
    let input = document.createElement('input')
    input.type = "file"
    input.onchange = async item => {
        let files = Array.from(input.files);
        if (files.length == 1) {
            const contents = await files[0].text()
            const data = parseJsonString(contents)
            try {
                validateContent(data)    
            }
            catch (err) {
                await alert(err)
                return
            }
            DATA = data
            RenderparticipantLines(DATA)
        }
        return "[]"
    }
    input.click()

}

function validateContent(contents) {
    if (!Array.isArray(contents)) throw "Unknown FileFormat"
    contents.forEach(item => {
        if (!item.hasOwnProperty("tickets") || !item.hasOwnProperty("name")) throw "Unknown FileFormat"
        if (Object.keys(item).length != 2) throw "Unknown FileFormat"
    })
}

function download(content, fileName, contentType) {
    var a = document.createElement("a")
    var file = new Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
}