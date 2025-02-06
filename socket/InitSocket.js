import SupportChatMessage from '../server/database/models/SupportChatMessage.js';
import {
    errorResponse,
    successResponse,
} from '../server/utilities/Responses.js';
export default (io) => {
    io.on('connection', (socket) => {
        // User connect listener
        socket.on('userConnect', (data, acknowledge) => {
            try {
                if (!data?.userId) {
                    return acknowledge(
                        errorResponse({
                            message: 'userId is required',
                        }),
                    );
                }

                socket.join(data?.userId); // Use socket.join to join the room

                return acknowledge(
                    successResponse({
                        message: 'User connected successfully',
                    }),
                );
            } catch (error) {
                const errorObj = errorResponse({
                    message: 'Server error',
                    errorInfo: error,
                });
                return acknowledge ? acknowledge(errorObj) : errorObj;
            }
        });

        // Admin connect listener
        socket.on('adminConnect', (data, acknowledge) => {
            try {
                if (!data?.adminId) {
                    return acknowledge(
                        errorResponse({
                            message: 'adminId is required',
                        }),
                    );
                }

                socket.join(data?.adminId); // Use socket.join to join the room

                return acknowledge(
                    successResponse({
                        message: 'Admin connected successfully',
                    }),
                );
            } catch (error) {
                const errorObj = errorResponse({
                    message: 'Server error',
                    errorInfo: error,
                });
                return acknowledge ? acknowledge(errorObj) : errorObj;
            }
        });

        // Send message listener
        socket.on('sendMessage', async (data, acknowledge) => {
            try {
                if (!data?.msg) {
                    return acknowledge(
                        errorResponse({ message: 'msg is required' }),
                    );
                }

                if (!data?.sender || !data?.reciever) {
                    return acknowledge(
                        errorResponse({
                            message: 'Please send sender and reciever',
                        }),
                    );
                }

                if (!['senderAdmin', 'senderUser'].includes(data?.senderType)) {
                    return acknowledge(
                        errorResponse({
                            message: 'Please send valid senderType',
                        }),
                    );
                }

                const messageBody = {
                    sender: data?.sender,
                    reciever: data?.reciever,
                    msg: data?.msg,
                    messageType: 'text',
                };

                if (data?.senderType === 'senderAdmin') {
                    messageBody.senderAdminId = data?.sender;
                    messageBody.recieverUserId = data?.reciever;
                } else {
                    messageBody.senderUserId = data?.sender;
                    messageBody.recieverAdminId = data?.reciever;
                }

                const newMessageObj =
                    await SupportChatMessage.create(messageBody);

                const newMessageRes = await SupportChatMessage.findById(
                    newMessageObj?._id,
                )
                    .populate('senderAdminId')
                    .populate('recieverUserId')
                    .populate('senderUserId')
                    .populate('recieverAdminId');

                // Emit to the specific receiver
                io.to(data?.reciever).emit(
                    'newMessage',
                    successResponse({
                        message: 'New message',
                        data: newMessageRes,
                    }),
                );

                return acknowledge(
                    successResponse({
                        message: 'Message sent successfully',
                        data: newMessageRes,
                    }),
                );
            } catch (error) {
                const errorObj = errorResponse({
                    message: 'Server error',
                    errorInfo: error,
                });
                return acknowledge ? acknowledge(errorObj) : errorObj;
            }
        });

        // Disconnect admin
        socket.on('disconnectAdmin', (data) => {
            // console.log('Admin disconnected:', data?.adminId);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            // console.log('Client disconnected:', socket.id);
        });
    });
};
