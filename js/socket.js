const API = 'https://chatappnajottalim.herokuapp.com'

let server = io(API, { transports: ['websocket', 'polling']})


server.on('send message', data =>{
        if(data.type == 'text'){
            renderTextTemplate(data)
        }
        else if(data.type == 'file'){
            renderFileTemplate(data)
        }

        chatMain.scrollTo({
            top: chatMain.scrollHeight,
            behavior: 'smooth'
        })
})
