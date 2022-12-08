var soap = require('soap');

module.exports = function(RED) {
    function SimplestSoap(config) {

        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.url = config.url;
        const node = this;

        function sendError(err, node, done, msg) {
            // node.warn(err.message);
    
            if (err) {
                if (done) {
                    // Node-RED 1.0 compatible
                    done(err);
                } else {
                    // Node-RED 0.x compatible
                    node.error(err, msg);
                }
            }
        }

        function createClient() {
            node.status({fill:"blue",shape:"dot",text:'connecting...'});

            soap.createClient(node.url, function (err, client) {
                if(!err) {
                    node.status({fill:"green",shape:"dot",text:'connected'});
                    node.client = client;
                } else {
                    node.status({fill:"red",shape:"dot",text:"error"});
                }
            });
        }

        

        if(!this.url || this.url == '') {
            this.status({fill:"red",shape:"dot",text:"missing wsdl url"});
            return;
        } else {
           createClient();
        }

        node.on('input', function(msg, send, done) {

            if (!msg.payload) {
                sendError(new Error("Did you forget to set the payload?"),node,done, msg);
                this.status({fill:"red",shape:"dot",text:"invalid payload"});
                return;
            }

            this.status({fill:"blue",shape:"dot",text:"calling webservice..."});

            send = send || function() { node.send.apply(node,arguments) }

            node.client[msg.action](msg.payload, function(err, result) {
                if(err) {
                node.status({fill:"red",shape:"dot",text: "error"});
                sendError(`SOAP Error: ${err}`,node,done, msg);
                } else {
                    msg.payload = result;
                    if(node.client) {
                        node.status({fill:"green",shape:"dot",text:'connected'});
                    }
                    send(msg);
                }
            });

            
            
            
            
        });

        
    }
    RED.nodes.registerType("SOAP Client",SimplestSoap, {
    });
}