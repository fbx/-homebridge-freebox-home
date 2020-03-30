let request = require('request')

module.exports = function() {
    this.init = function(freeboxRequest, callback) {
        this.freeboxRequest = freeboxRequest
        this.listCamera((cameras) => {
            this.list = cameras
            this.activateNext((done) => {
                callback(done)
            })
        })
    }

    this.list = []
    this.i = 0

    this.activateNext = function(callback) {
        if (this.i != 0) {
            this.i ++
        }
        if (this.i <= this.list.length) {
            this.activateRTSP(this.list[this.i], (success) => {
                this.activateNext(callback)
            })
        } else {
            callback(true, this.list)
            this.i = 0
        }
    }

    this.listCamera = function(callback) {
        let url = 'http://mafreebox.freebox.fr/api/v6/home/nodes'
        this.freeboxRequest.request('GET', url, null, (statusCode, body) => {
            if (body != null) {
                if (body.success == true) {
                    var camList = []
                    for(node of body.result) {
                        if (node.category == 'camera') {
                            let cam = {
                                id: node.id,
                                password: node.props.Pass,
                                login: node.props.Login,
                                ip: node.props.Ip,
                                node_data: node
                            }
                            camList.push(cam)
                        }
                    }
                    callback(camList)
                } else {
                    console.log('[!] Got a '+statusCode+', unable to request : '+url)
                    console.log(body)
                    callback(null)
                }
            } else {
                console.log('[!] Got a '+statusCode+', unable to request : '+url)
                callback(null)
            }
        }, true)
    }

    this.activateRTSP = function(camera, callback) {
        let url = 'http://'+camera.login+':'+camera.password+'@'+camera.ip+'/adm/set_group.cgi?group=H264&sp_uri=live'
        request(url, function (error, response, body) {
            console.log(body)
            if(body == 'OK') {
                callback(true)
            } else {
                callback(false)
            }
        })
    }
}