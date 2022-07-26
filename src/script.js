const DATA = LoadFromLocalStorage("LotteryData")

RenderMemberLines(DATA)

function SavetoLocalStorage(key, Data) {
    const jsonString = JSON.stringify(Data);
    window.localStorage.setItem(key, jsonString)
}

function LoadFromLocalStorage(key) {
    const jsonString = window.localStorage.getItem(key)
    if (jsonString == null) return []    
    return JSON.parse(jsonString)
}

function GiveTicket() {
    const SelectorContainer = document.querySelector(".ticket-holder")
    const member = SelectorContainer.value
    if (member == "") return
    const found = DATA.filter(data => data.name == member)
    if (found.length > 0) {
        found[0].tickets++

    } else {
        const newRec = { name: member, tickets: 1 }
        DATA.push(newRec)
    }
    RenderMemberLines(DATA)
    SelectorContainer.value = ""
}

function TakeTicket() {
    const SelectorContainer = document.querySelector(".ticket-holder")
    const member = SelectorContainer.value
    if (member == "") {
        alert()
        return
    }
    const found = DATA.filter(data => data.name == member)
    if (found.length > 0) {
        if (found[0].tickets > 1) {
            found[0].tickets--
        } else {
            const index = DATA.map(e => e.name).indexOf(member);
            DATA.splice(index, 1)
        }
    }
    RenderMemberLines(DATA)
    SelectorContainer.value = ""
}

function GetNumberofTickets(data) {
    return data.map(e => e.tickets).reduce((partialSum, a) => partialSum + a, 0)
}

function ClearTickets() {
    if (confirm("Are you sure you want to reset data?")) {
        while (DATA.length > 0) DATA.pop()
        RenderMemberLines(DATA)
    }
}

function DrawTicket() {
    if (DATA.length == 0) return
    const numberofTickets = GetNumberofTickets(DATA)
    let draw = Math.floor(Math.random() * numberofTickets) + 1
    for (let i = 0; i < DATA.length; i++) {
        if (draw > DATA[i].tickets) {
            draw -= DATA[i].tickets
        } else {
            alert("Winner is " + DATA[i].name)
            return
        }
    }
}

function RenderMemberLines(data) {

    const memberContainer = document.querySelector(".member-rows")

    while (memberContainer.firstChild) {
        memberContainer.removeChild(memberContainer.lastChild)
    }
    if (data.length > 0) {
        data.sort((a, b) => a.name.localeCompare(b.name)).forEach(value => {
            const name = document.createElement('div')
            name.textContent = value.name
            name.classList.add("member-name")
            memberContainer.append(name);
            const tickets = document.createElement('div')
            tickets.textContent = value.tickets
            tickets.classList.add("member-ticket")
            memberContainer.append(tickets)

        })
    }
    
    const totalSpan = document.getElementById("total-tickets")
    totalSpan.innerText = GetNumberofTickets(data)
    SetSelector(data)
    SavetoLocalStorage("LotteryData", data)
}

function SetSelector(members) {
    const SelectorContainer = document.querySelector(".ticket-holders")

    while (SelectorContainer.firstChild) {
        SelectorContainer.removeChild(SelectorContainer.lastChild)
    }

    members.sort().forEach(value => {
        const option = document.createElement("option")
        //memberName.value = value
        option.text = value.name
        SelectorContainer.append(option)
    })

}
