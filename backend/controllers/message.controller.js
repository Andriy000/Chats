import { ERROR } from "../constants/constant.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: ERROR.MISSING_FIELDS });
    }

    let chat;

    // Шукаємо всі чати між відправником і отримувачем
    const existingChats = await Chat.find({
      participants: { $all: [senderId, receiverId] },
    });

    if (existingChats.length > 1) {
      // Якщо існує більше одного чату, перевіряємо, чи надано chatId
      if (!chatId) {
        return res.status(400).json({ error: ERROR.CHAT_ID_REQUIRED });
      }

      // Перевіряємо, чи наданий chatId існує в базі
      chat = existingChats.find(chat => chat._id.toString() === chatId);
      if (!chat) {
        return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
      }
    } else if (existingChats.length === 1) {
      // Якщо є тільки один чат, використовуємо його
      chat = existingChats[0];
    } else {
      // Якщо чатів не існує, створюємо новий
      chat = new Chat({
        participants: [senderId, receiverId],
        owner: senderId, // або інша логіка визначення власника чату
      });
      await chat.save();
    }

    // Створюємо нове повідомлення
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    chat.messages.push(newMessage._id);

    await Promise.all([chat.save(), newMessage.save()]);

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params; 
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: ERROR.MESSAGE_NOT_FOUND });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ error: ERROR.FORBIDDEN });
    }

    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });

  } catch (error) {
    console.log("Error in deleteMessage controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
}

export const resendMessage = async (req, res) => {
  try {
    const { messageId }  = req.params;
    const { chatId } = req.body;
    const participantId = req.user._id;

    const message = await Message.findById(messageId);
    const chat = await Chat.findById(chatId);

    if (!message) {
      return res.status(404).json({ error: ERROR.MESSAGE_NOT_FOUND });
    }

    if(!chat) {
      return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
    }

    if (!chat.participants.includes(participantId)) {
      return res.status(403).json({ error: ERROR.FORBIDDEN });
    }

        const newMessage = new Message({
          senderId: participantId,
          receiverId: message.receiverId,
          message: message.message,
        });
    
        await newMessage.save();

        chat.messages.push(newMessage._id);
        await chat.save();
        res.status(200).json({ message: "Message resent successfully" , newMessage});
    
  } catch (error) {
    console.log("Error in resendMessage controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
}

export const rewriteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message: newMessage } = req.body; 
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: ERROR.MESSAGE_NOT_FOUND });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ error: ERROR.FORBIDDEN });
    }

    message.message = newMessage;
    await message.save();

    res.status(200).json({ message: "Message updated successfully", updatedMessage: message });
  } catch (error) {
    console.log("Error in rewriteMessage controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

