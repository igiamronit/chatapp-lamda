import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { FaPaperPlane, FaUpload } from 'react-icons/fa';


function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const messagesEndRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (currentMessage.trim() !== '' || imageUrl) {
      const messageData = {
        room,
        author: username,
        message: imageUrl ? null : currentMessage,
        image: imageUrl || null, // Use the image URL if it's an image message
        time: new Date().toLocaleTimeString(),
        timestamp: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, 'rooms', room, 'messages'), messageData);
        socket.emit('send_message', messageData);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      console.log("Sending message:", {
        message: imageUrl ? null : currentMessage,
        image: imageUrl || null,
      });
      setCurrentMessage('');
      setImageUrl(null); // Reset image URL after sending the message
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=4f494fa3be2a8c7ee8c1d6850ed8b345', {
        method: 'POST',
        body: formData,
      });
  
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

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

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

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  return (
    <div className='chat-window'>
      <div className='chat-header'>
        <p>💬 Live Chat</p>
      </div>

      <div className='chat-body'>
        <div className='message-container'>
          {messageList.map((msg, index) => (
            <div
              className='message'
              id={username === msg.author ? 'you' : 'other'}
              key={index}
            >
              <div>
                <div className='message-content' id= {msg.image?'image' : ''}>

                  {/* Display image if imageUrl exists, otherwise show text */}
                  {msg.image ? (
                    <img src={msg.image} alt="sent-img" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
                <div className='message-meta'>
                  <p id='time'>{msg.time}</p>
                  <p id='author'>{msg.author}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* This is the scroll target */}
        </div>
      </div>

      <div className='chat-footer'>
        <label htmlFor="image-upload">
          <FaUpload />
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        {/* Image Preview */}
        {imageUrl && (
          <div className="image-preview">
            <img src={imageUrl} alt="preview" style={{ maxWidth: '100px', borderRadius: '8px' }} />
            <button className="cancel-preview" onClick={() => setImageUrl(null)}>✖</button>
          </div>
        )}

        <input
          type='text'
          placeholder='Type your message...'
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={uploading}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default Chat;