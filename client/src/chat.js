import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';
import './App.css';
import { FaPaperPlane, FaUpload } from 'react-icons/fa';

function Chat({ socket, username, room, userId }) {
  const [currentMessage, setCurrentMessage] = useState(''); //for real time mesage
  const [messageList, setMessageList] = useState([]); //message history
  const [showEmojiSidebar, setShowEmojiSidebar] = useState(false);
  const messagesEndRef = useRef(null); //autoscroll
  const emojiRef = useRef(null); 
  const [imageUrl, setImageUrl] = useState(null); //image support
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]); //for typing indicator
  const typingTimeoutRef = useRef(null);  //typingtimeout
  const getFirstName = (name) => name.split(' ')[0]; //to show only first name in typing indicator
  const [selectedPersona, setSelectedPersona] = useState('Friendly'); //default is Friendly(I am nice)
  const [aiThinking, setAiThinking] = useState(false); //for AI thinking indicator

  const handleInputStatusChange = (e) => {
    setCurrentMessage(e.target.value);

    const firstName = getFirstName(username);
    socket.emit('typing', {room, userId, username:firstName});

    //if didnt type anything for 2sec
    if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', {room, userId, username:firstName});
    }, 2000);
  }

  const deleteRoomMessages = async () => {
    if (!room) return; //return if not a valid room
  
    try {
      const roomMessagesRef = collection(db, 'rooms', room, 'messages');
      const querySnapshot = await getDocs(roomMessagesRef);
  
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
  
      //console.log(`All messages in room "${room}" have been deleted.`);
      setMessageList([]); // Clear the local message list
    } catch (error) {
      console.error('Error deleting room messages:', error);
    }
  };

  //typing indicator
  useEffect(() => {
    socket.on('typing', (data) => {
      if(data.userId !== userId){
        setTypingUsers((prev) => {
          if(!prev.includes(data.username)){
            return [...prev, data.username];
          }
          return prev;
        });
      }
    });
    socket.on('stop-typing', (data) => {
      if(data.userId !== userId){
        setTypingUsers((prev) => prev.filter((name) => name !== data.username));
      }
    });

    return () => {
      socket.off('typing');
      socket.off('stop-typing');
    };
  },[socket, userId]);

  //scroll for typing indicator
  useEffect(() => {
    scrollToBottom();
  }, [typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (currentMessage.trim() !== '' || imageUrl) {
      const messageData = {
        room,
        author: username,
        authorId: userId,
        message: imageUrl ? null : currentMessage,
        image: imageUrl || null,
        time: new Date().toLocaleTimeString(),
        timestamp: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, 'rooms', room, 'messages'), messageData);
        socket.emit('send_message', messageData);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
      setCurrentMessage('');
      setImageUrl(null);
    }
  };
  //handles image upload
  const handleImageUpload = async (file) => {
    if (!file) return; //if no file found

    setUploading(true); //loading indicator
    const formData = new FormData();
    formData.append('image', file); //append image to formdata

    try {
      const response = await fetch(
        'https://api.imgbb.com/1/upload?key=4f494fa3be2a8c7ee8c1d6850ed8b345', //imgbb api
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setImageUrl(result.data.url);
      } else {
        console.error('Image upload failed:', result);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setUploading(false);
  };

  //Ask AI
  const askAI = async () => {
    if (!currentMessage.trim()) return; //if no message found
    
    setAiThinking(true); //thinking indicator
    try {
      const res = await fetch('https://chatapp-lamda.onrender.com/api/ai/ask', { //link to response from AI
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          persona: selectedPersona,
        }),
      });
    
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`); //error
      }
      
      const data = await res.json();
      
      if (!data || !data.reply) {
        throw new Error('Invalid AI response received'); //error
      }
      
      const aiMessage = {
        room,
        author: `${selectedPersona}Bot`,
        authorId: 'ai_bot', //fixed id for AI(all personas)
        message: data.reply,
        image: null, //AI cant send images
        time: new Date().toLocaleTimeString(),
        timestamp: serverTimestamp(),
      };
    
      await addDoc(collection(db, 'rooms', room, 'messages'), aiMessage); //add AI message to firestore
      //emit AI message like normal message
      socket.emit('send_message', aiMessage);
      setCurrentMessage('');
    } catch (error) {
      console.error('AI request failed', error);
    } finally {
      setAiThinking(false);
    }
  };

  useEffect(() => {
    if (!room) return;

    const q = query(
      collection(db, 'rooms', room, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessageList(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      //to solve duplicate messages
      const messagewithId = {...data, id: Date.now() };

      setMessageList((list) => {
        const isDuplicate = list.some(msg =>
          msg.author === data.author &&
          msg.message === data.message &&
          msg.time === data.time
        );

        return isDuplicate ? list : [...list, messagewithId];
      });
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  const onEmojiClick = (emojiData) => {
    setCurrentMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className='chat-window'>
      <div className='chat-header'>
        <p>💬 Live Chat</p>
        <button className='delete-room' onClick={deleteRoomMessages}>
          Delete Room
        </button>
      </div>

      <div className='chat-body'>
        <div className='message-container'>
          {messageList.map((msg, index) => (
            <div
            className='message'
            id={
              msg.authorId === 'ai_bot'
                ? 'ai'
                : userId === msg.authorId
                ? 'you'
                : 'other'
            }
            key={index}
          >
                <div className='message-content' id={msg.image ? 'image' : ''}>
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt='sent-img'
                      style={{ maxWidth: '200px', borderRadius: '8px' }}
                    />
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
                <div className='message-meta'>
                  <p id='time'>{msg.time}</p>
                  <p id='author'>{msg.author}</p>
                </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {typingUsers.length > 0  && (
            <div className="typing-notification">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : "are"} typing...
            </div>
          )}
        </div>
      </div>
      <div className='chat-footer'>
  <div className='emoji-picker-wrapper' ref={emojiRef}>
    <button
      className='emoji-toggle-button'
      onClick={() => setShowEmojiSidebar((prev) => !prev)}
    >
      😊
    </button>

    {showEmojiSidebar && (
      <div className='emoji-picker-container'>
        <EmojiPicker onEmojiClick={onEmojiClick} />
      </div>
    )}
  </div>

  <label htmlFor='image-upload' className='upload-button'>
    <FaUpload />
  </label>
  <select
  className='ai-selector'
  value={selectedPersona}
  onChange={(e) => setSelectedPersona(e.target.value)}
  >
  <option value='Friendly'>Friendly</option>
  <option value='Roaster'>Roaster</option>
  <option value='Tech Support'>Tech Support</option>
  </select>

  <button
  className='ask-ai-button'
  onClick={askAI}
  disabled={aiThinking || !currentMessage.trim()}
  >
  {aiThinking ? 'Thinking...' : 'Ask AI'}
</button>
  <input
    id='image-upload'
    type='file'
    accept='image/*'
    onChange={(e) => handleImageUpload(e.target.files[0])}
  />

  {imageUrl && (
    <div className='image-preview'>
      <img
        src={imageUrl}
        alt='preview'
        style={{ maxWidth: '100px', borderRadius: '8px' }}
      />
      <button
        className='cancel-preview'
        onClick={() => setImageUrl(null)}
      >
        ✖
      </button>
    </div>
  )}

  <input
    type='text'
    className='message-input'
    placeholder='Type your message...'
    value={currentMessage}
    onChange={handleInputStatusChange}
    // onChange={(e) => setCurrentMessage(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        sendMessage();
        setShowEmojiSidebar(false);
      }
    }}
  />

  <button onClick={sendMessage} className='send-button' disabled={uploading}>
    <FaPaperPlane />
  </button>
</div>
 


    </div>
  );
}

export default Chat;
