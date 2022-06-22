let chatItemTemplate = document.getElementById('chats-item-template').content
let textMsgTemplate = document.getElementById('msg-text').content
let fileMsgTemplate = document.getElementById('msg-file').content
let uploadedFileItem = document.getElementById('uploaded-file-item').content
let chatsList = document.getElementById('chats-list')
let chatMain = document.getElementById('chat-main')
let uploadedFiles = document.getElementById('uploaded-files')

let profileName = document.getElementById('profile-name')
let profileImg = document.getElementById('profile-img')

let chatForm = document.getElementById('chat-form')
let textInput = document.getElementById('textInput')
let uploads = document.getElementById('uploads')


let token = localStorage.getItem('token')
if(!token) window.location.replace('login.html')
let {userId} = JSON.parse(localStorage.getItem('user'))


let users = []
let messages = []




function renderTextTemplate(msg){
    let template = textMsgTemplate.cloneNode(true)
    let wrapper = template.getElementById('text-wrapper')
    let img = template.getElementById('msg-img')
    let author = template.getElementById('msg-name')
    let message = template.getElementById('msg-text')
    let time = template.getElementById('msg-time')

    let user = users.find(user => user.userId == msg.userId)

    wrapper.className = msg.userId == userId ? "msg-wrapper msg-from" : "msg-wrapper"
    img.setAttribute('src', user.avatar)
    author.textContent = user.username
    message.textContent = msg.message
    time.textContent = msg.time

    chatMain.append(template)
}


function renderFileTemplate(msg) {
    let user = users.find(user => user.userId == msg.userId)
    
    let template = fileMsgTemplate.cloneNode(true)
    let wrapper = template.getElementById('file-wrapper')
    let img = template.getElementById('msg-img')
    let author = template.getElementById('msg-name')
    let obj = template.getElementById('msg-obj')
    let link = template.getElementById('msg-link')
    let time = template.getElementById('msg-time')


    wrapper.className = msg.userId == userId ? "msg-wrapper msg-from" : "msg-wrapper"
    img.setAttribute('src', user.avatar)
    author.textContent = user.username
    obj.setAttribute('data', msg.file.view)
    link.setAttribute('href', msg.file.download)
    time.textContent = msg.time
    chatMain.append(template)


    let uploadedItem = uploadedFileItem.cloneNode(true)
    let uploadedLink = uploadedItem.getElementById('uploaded-link')
    let uploadedName = uploadedItem.getElementById('uploaded-name')

    uploadedLink.setAttribute('href', msg.file.view)
    uploadedName.textContent = msg.file.name
    uploadedFiles.append(uploadedItem)
}



async function getData(data){
    try {    
        let users = await fetch(`${API}/${data}`, {headers: { token }})
        users = await users.json()
        return users
    } catch (error) {
        console.log(error.message);
    }
}



function renderUsers(users) {
    chatsList.innerHTML = null

    users.forEach(user => {

        if(!(user.userId == userId)){
            let template = chatItemTemplate.cloneNode(true)
            let img = template.getElementById('item-img')
            let name = template.getElementById('item-name')
    
            img.setAttribute('src', user.avatar)
            name.textContent = user.username
    
            chatsList.append(template)
        } else {
            profileImg.setAttribute('src', user.avatar)
            profileName.textContent = user.username
        }

    })
}



function renderMessage(msg){
    chatMain.innerHTML = null
    uploadedFiles.innerHTML = null

    msg.forEach(msg => {
        if(msg.type == 'text'){
            renderTextTemplate(msg)
        }
        else if(msg.type == 'file'){
            renderFileTemplate(msg)
        }
    })
    chatMain.scrollTo({
        top: chatMain.scrollHeight,
        behavior: 'auto'
    })
}



chatForm.onsubmit = async(event) => {
    event.preventDefault()

    // if(!textInput.value.trim() && !uploadedFiles.files[0]) return

    let fd = new FormData(chatForm)
    fd.append('userId', userId)
    fd.append('message', textInput.value)
    fd.append('file', uploads.files[0])

    let options = {
        method: 'POST',
        headers: { token },
        body: fd
    }

    try {
        let res = await fetch(`${API}/message`, options)
        res = await res.json()
        
        if (res.status == 201) {
            res.data.type == 'text' ? renderTextTemplate(res.data) : renderFileTemplate(res.data)

            chatMain.scrollTo({
                top: chatMain.scrollHeight,
                behavior: 'smooth'
            })

            server.emit('new', {
                userId,
                message: textInput.value,
                file: uploads.files[0]
            })

        } else {
            alert(res.message)
        }

    } catch (error) {
        console.log(error.message);
    }

    textInput.value = ''
}



async function render() {
    users = await getData('users')
    messages = await getData('messages')

    renderUsers(users)
    renderMessage(messages)
}


render()