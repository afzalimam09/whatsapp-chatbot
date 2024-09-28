import { io } from '../app.js';
import { Whatsapp } from '../controller/webhookController.js';
import { getOnlineAgents, updateAgentById, updateAgentBySocketId } from '../service/agentService.js';
import { getChatSession, updateChatSession } from '../service/chatSessionService.js';
import { createMessage } from '../service/messageService.js';
import { ACTIONS } from './actions.js';

export const chatSocket = () => {
    io.on('connection', (socket) => {
        console.log("Connected with socket", socket.id);

        socket.on(ACTIONS.JOIN, async(data) => {
            await updateAgentById(data.user._id, {status: 'Online', socketId: socket.id})
        });

        socket.on(ACTIONS.CHANGE_AGENT_STATUS, async (status) => {
            await updateAgentBySocketId(socket.id, { status: status })
        });

        socket.on(ACTIONS.CHAT_SESSION_ACCEPTED, async ({ chatSessionId, agentId }) => {
            console.log(chatSessionId, agentId)
            const chatSession = await getChatSession({ _id: chatSessionId });
            if(chatSession.status === 'Active') return console.log("already accepted");
            const updatedSession = await updateChatSession({ _id: chatSessionId }, { agentId, status: 'Active' });
            //emit event to remove this 
            const onlineAgents = await getOnlineAgents();
            for (const agent of onlineAgents) {
                io.to(agent.socketId).emit(ACTIONS.REMOVE_ACCEPTED_CHAT_SESSION, chatSessionId);
            
                if (agent._id.toString() === agentId.toString()) {
                    const message = `Hi ${updatedSession.customerName}, I am ${agent.fullName}. How may I assist you!`;
            
                    await createMessage({ chatId: chatSessionId, sender: 'Agent', message });
                    await updateChatSession({ _id: chatSessionId }, { lastMessage: message });
                    console.log("inside here")
                    await Whatsapp.sendText({
                        recipientPhone: `${updatedSession.customerContact}`,
                        message
                    });
                    
                    io.to(agent.socketId).emit(ACTIONS.UPDATE_CONTACT_LIST, chatSessionId);
                }
            }
        });

        socket.on(ACTIONS.SEND_CHAT_CLOSE_REQUEST, async ({ chatSessionId }) => {
            const chatSession = await getChatSession({ _id: chatSessionId });
            if(chatSession && chatSession.status === 'Active') {
                const message = `If you would like to close this request, please click the button below to end the session. If you still have any doubts or questions, feel free to write your query in the chat!`
                await Whatsapp.sendSimpleButtons({
                    message: message,
                    recipientPhone: chatSession.customerContact, 
                    listOfButtons: [
                        {
                            title: 'Close this Chat',
                            id: 'close_chat_session_request',
                        }
                    ],
                });
            }
        });
        
        // Handle disconnect event
        socket.on('disconnect', async () => {
            console.log("Socket disconnected", socket.id);
            await updateAgentBySocketId(socket.id, { status: 'Offline', socketId: null })
        });
    });
};

