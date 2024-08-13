import { ERROR } from "../constants/constant.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { userId: receiverId } = req.params;
    const senderId = req.user._id; 
    if (!message) {
      return res.status(400).json({ error: ERROR.MISSING_FIELDS });
    }
    
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    
    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        owner: senderId, 
      });
      await chat.save();
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    chat.messages.push(newMessage._id);
    await chat.save();

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in message controller", error.message);
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