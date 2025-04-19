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
import EmojiPicker from 'emoji-picker-react';
import './App.css';

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [showEmojiSidebar, setShowEmojiSidebar] = useState(false);
  const [someoneTyping, setSomeoneTyping] = useState(null);

  const messagesEndRef = useRef(null);
  const emojiRef = useRef(null);
  const typingTimeout = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (currentMessage.trim() !== '') {
      const messageData = {
        room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
        timestamp: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, 'rooms', room, 'messages'), messageData);
      } catch (e) {
        console.error('Error adding document: ', e);
      }

      socket.emit('send_message', messageData);
      setCurrentMessage('');
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
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('typing', ({ username: typingUser }) => {
      if (typingUser !== username) {
        setSomeoneTyping(`${typingUser} is typing...`);

        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
          setSomeoneTyping(null);
        }, 2000);
      }
    });

    return () => {
      socket.off('typing');
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [socket, username]);

  const onEmojiClick = (emojiData) => {
    setCurrentMessage((prev) => prev + emojiData.emoji);
  };

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
                <div className='message-content'>
                  <p>{msg.message}</p>
                </div>
                <div className='message-meta'>
                  <p id='time'>{msg.time}</p>
                  <p id='author'>{msg.author}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {someoneTyping && (
            <div className='typing-notification'>
              <em>{someoneTyping}</em>
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

        <input
          type='text'
          placeholder='Type your message...'
          value={currentMessage}
          onChange={(e) => {
            setCurrentMessage(e.target.value);
            socket.emit('typing', { room, username });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
              setShowEmojiSidebar(false);
            }
          }}
        />

        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
