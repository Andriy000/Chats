import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { ERROR } from "../constants/constant.js";
import mongoose from "mongoose";

export const addUser = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { username, email } = req.body;

    if (!chatId || (!username && !email)) {
      return res.status(400).json({ error: ERROR.MISSING_FIELDS });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID format" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
    }

    let user;
    if (username) {
      user = await User.findOne({ username });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ error: ERROR.USER_NOT_FOUND });
    }

    if (chat.participants.includes(user._id)) {
      return res.status(400).json({ error: ERROR.USER_ALREADY_IN_CHAT });
    }

    chat.participants.push(user._id);

    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.log("Error in AddUser controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};
export const removeUser = async (req, res) => {
  try {
    const { chatId } = req.params; 
    const { userId, username, email } = req.body;
    const currentUserId = req.user._id;
  
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
    }

    if (!chat.owner.equals(currentUserId)) {
      return res.status(403).json({ error: ERROR.FORBIDDEN });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(404).json({ error: ERROR.USER_NOT_FOUND });
    }

    let participant;
    if (username) {
      participant = await User.findOne({ username });
    } else if (email) {
      participant = await User.findOne({ email });
    } 
    chat.participants = chat.participants.filter(participant => !participant.equals(userId));
    await chat.save();
    res.status(200).json({ message: "User removed from chat successfully" });

  } catch (error) {
    console.log("Error in removeUser controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};
export const createChat = async (req, res) => {
  try {
    const { participants } = req.body;
    const ownerId = req.user._id; 

    if (!participants || !Array.isArray(participants) || !participants.length) {
      return res.status(400).json({ error: ERROR.MISSING_FIELDS });
    }
    const newChat = new Chat({
      owner: ownerId,
      participants: [ownerId, ...participants]
    });

    await newChat.save();

    res.status(201).json(newChat);
  } catch (error) {
    console.log("Error in createChat controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
    }

    if (!chat.owner || !userId || !chat.owner.equals(userId)) {
      return res.status(400).json({ error: ERROR.FORBIDDEN });
    }
    
    await Message.deleteMany({ _id: { $in: chat.messages } });
    await Chat.deleteMany({ _id: { $in: chat.participants } });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat was deleted successfully" });

  } catch (error) {
    console.log("Error in deleteChat controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate({
        path: 'messages',
        select: 'message', 
      });

    if (!chat) {
      return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
    }
    const allMessages = chat.messages.map(msg => msg.message);

    res.status(200).json({ allMessages });
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export const getUsersChat = async (req, res) => {
  try {
    const { participantId } = req.params;

    if (!participantId) {
      return res.status(400).json({ error: ERROR.MISSING_FIELDS });
    }

    const chats = await Chat.find({
      participants: participantId
    }).populate('participants', 'username'); 

    if (chats.length === 0) {
      return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
    }

    const result = chats.map(chat => ({
      chatId: chat._id,
      participants: chat.participants.map(participant => ({
        _id: participant._id,
        username: participant.username
      }))
    }));

    res.status(200).json(result);
  } catch (error) {
    console.log("Error in getUsersChat controller", error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};

export const leaveChat = async (req, res) => {
  try {

    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: ERROR.CHAT_NOT_FOUND });
    }
    if (!chat.participants.some((participant) => participant.equals(userId))) {
      return res.status(404).json({ error: ERROR.USER_NOT_FOUND });
    }

    chat.participants = chat.participants.filter(
      (participant) => !participant.equals(userId)
    );

    if (chat.participants.length === 0) {
      await Chat.findByIdAndDelete(chatId);
    } else {
      await chat.save();
    }

    res.status(200).json({ message: 'Left chat successfully' });
  } catch (error) {
    console.log('Error in leaveChat controller', error.message);
    res.status(500).json({ error: ERROR.INTERNAL_SERVER });
  }
};