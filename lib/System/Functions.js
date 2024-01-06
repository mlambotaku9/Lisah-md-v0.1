const { proto, getContentType } = require('@queenanya/baileys');
const { botname } = require('../../config');

/**
 * Serialize Message
 * @param {WAconnection} anyaV2 
 * @param {Object} m 
 * @param {store} store 
 */
exports.smsg = async (anyaV2, pika, store) => {
    if (!pika) return pika
    let M = proto.WebMessageInfo
    if (pika.key) {
        pika.id = pika.key.id
        pika.isBot = pika.id.startsWith('BAES') && pika.id.length === 16
    	pika.isBaileys = pika.id.startsWith('BAE5') && pika.id.length === 16
        pika.chat = pika.key.remoteJid
        pika.fromMe = pika.key.fromMe
        pika.isGroup = pika.chat.endsWith('@g.us')
        pika.sender = anyaV2.decodeJid(pika.fromMe && anyaV2.user.id || pika.participant || pika.key.participant || pika.chat || '')
        if (pika.isGroup) pika.participant = anyaV2.decodeJid(pika.key.participant) || ''
    }
    if (pika.message) {
        pika.mtype = getContentType(pika.message)
        pika.msg = (pika.mtype == 'viewOnceMessage' ? pika.message[pika.mtype].message[getContentType(pika.message[pika.mtype].message)] : pika.message[pika.mtype])
        try{
	pika.body = (pika.mtype === 'conversation') ? pika.message.conversation : (pika.mtype == 'imageMessage') && pika.message.imageMessage.caption!=undefined ? pika.message.imageMessage.caption : (pika.mtype == 'videoMessage') && pika.message.videoMessage.caption!=undefined ? pika.message.videoMessage.caption : (pika.mtype == 'extendedTextMessage') && pika.message.extendedTextMessage.text!=undefined ? pika.message.extendedTextMessage.text : (pika.mtype == 'buttonsResponseMessage') ? pika.message.buttonsResponseMessage.selectedButtonId : (pika.mtype == 'listResponseMessage') ? pika.message.listResponseMessage.singleSelectReply.selectedRowId : (pika.mtype == 'templateButtonReplyMessage') ? pika.message.templateButtonReplyMessage.selectedId : (pika.mtype === 'messageContextInfo') ? (pika.message.buttonsResponseMessage?.selectedButtonId || pika.message.listResponseMessage?.singleSelectReply.selectedRowId || pika.text) : '';
	} catch {
	pika.body = false	
	}
  let quoted = (pika.quoted = pika.msg.contextInfo
    ? pika.msg.contextInfo.quotedMessage
    : null);
        pika.mentionedJid = pika.msg.contextInfo ? pika.msg.contextInfo.mentionedJid : []       
	    if (pika.quoted) {
            let type = getContentType(quoted)
			pika.quoted = pika.quoted[type]
            if (['productMessage'].includes(type)) {
				type = getContentType(pika.quoted)
				pika.quoted = pika.quoted[type]
			}
            if (typeof pika.quoted === 'string') pika.quoted = { text: pika.quoted	}
          if(quoted.viewOnceMessageV2)
          { 
            console.log("entered ==================================== ")
          } else {	   		    
            pika.quoted.mtype = type
            pika.quoted.id = pika.msg.contextInfo.stanzaId
			pika.quoted.chat = pika.msg.contextInfo.remoteJid || pika.chat
            pika.quoted.isBot = pika.quoted.id ? pika.quoted.id.startsWith('BAES') && pika.quoted.id.length === 16 : false
    	    pika.quoted.isBaileys = pika.quoted.id ? pika.quoted.id.startsWith('BAE5') && pika.quoted.id.length === 16 : false
			pika.quoted.sender = anyaV2.decodeJid(pika.msg.contextInfo.participant)
			pika.quoted.fromMe = pika.quoted.sender === (anyaV2.user && anyaV2.user.id)
            pika.quoted.text = pika.quoted.text || pika.quoted.caption || pika.quoted.conversation || pika.quoted.contentText || pika.quoted.selectedDisplayText || pika.quoted.title || ''
			pika.quoted.mentionedJid = pika.msg.contextInfo ? pika.msg.contextInfo.mentionedJid : []
            pika.getQuotedObj = pika.getQuotedMessage = async () => {
			if (!pika.quoted.id) return false
			let q = await store.loadMessage(pika.chat, pika.quoted.id, anyaV2)
 			return exports.smsg(anyaV2, q, store)
            }
            let vM = pika.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: pika.quoted.chat,
                    fromMe: pika.quoted.fromMe,
                    id: pika.quoted.id
                },
                message: quoted,
                ...(pika.isGroup ? { participant: pika.quoted.sender } : {})
            })
            /**
             * 
             * @returns 
             */
             let { chat, fromMe, id } = pika.quoted;
			const key = {
				remoteJid: pika.chat,
				fromMe: false,
				id: pika.quoted.id,
				participant: pika.quoted.sender
			}
            pika.quoted.delete = async() => await anyaV2.sendMessage(pika.chat, { delete: key })

	   /**
		* 
		* @param {*} jid 
		* @param {*} forceForward 
		* @param {*} options 
		* @returns 
	   */
       pika.forwardMessage = (jid, forceForward = true, options = {}) => anyaV2.copyNForward(jid, vM, forceForward,{contextInfo: {isForwarded: false}}, options)

            /**
              *
              * @returns
            */
            pika.quoted.download = () => anyaV2.downloadMediaMessage(pika.quoted)
	  }
        }
    }
    pika.text = pika.msg.text || pika.msg.caption || pika.message.conversation || pika.msg.contentText || pika.msg.selectedDisplayText || pika.msg.title || ''

   /**
	* Copy this message
	*/
	pika.copy = () => exports.smsg(anyaV2, M.fromObject(M.toObject(m)))
	/**
	 * 
	 * @param {*} jid 
	 * @param {*} forceForward 
	 * @param {*} options 
	 * @returns 
	 */
	pika.copyNForward = (jid = pika.chat, forceForward = false, options = {}) => anyaV2.copyNForward(jid, pika, forceForward, options)
	    /**
     * .reply
     * @param text to send as message
     * @object return additional param like mention:
     **/
    pika.reply = (text, options = {}) => anyaV2.sendMessage(pika.chat, { text: text, mentions: options.mentions }, { quoted:pika })

    /**
     * .react
     * @param emoji return as react
     * @{@PikaBotz}
     **/
    pika.react = (emoji) => anyaV2.sendMessage(pika.chat, { react: { text: emoji, key: pika.key } });

    /**
     * .edit
     * @param text to replace original message
     * @param key of the message to edit
     * @object return additional param like mention:
     * @{@PikaBotz}
     **/
    pika.edit = (text, key, options = {}) => anyaV2.sendMessage(pika.chat, { text: text, mentions: options.mentions, edit: key })

    /**
    * .deleteMsg
    * @param key of the message to delete
    * @{@PikaBotz}
    **/
    pika.deleteMsg = (key) => anyaV2.sendMessage(pika.chat, { delete: key })

  	pika.sendcontact = (name, info, number) => {
		var vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:' + info + ';\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD'
		anyaV2.sendMessage(pika.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: pika })
	}
    return pika
	    }
