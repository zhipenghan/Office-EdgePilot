import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button, Textarea, tokens, makeStyles } from "@fluentui/react-components";
import { Send24Regular } from "@fluentui/react-icons";
import { Message, streamChatResponse } from "../llamaApiService";

/* global HTMLTextAreaElement */

interface TextInsertionProps {
  insertText: (text: string) => void;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "0",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "8px",
    boxShadow: tokens.shadow4,
    overflow: "hidden", // Hide all scrollbars on the container
    height: "100%",
    width: "100%",
    position: "relative",
  },
  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "16px",
    overflowY: "auto", // Show scrollbar only when needed
    paddingBottom: "76px", // Space for input container
    height: "100%",
    "&::-webkit-scrollbar": {
      width: "8px", // Narrower scrollbar
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: tokens.colorNeutralStroke3, // Subtle color
      borderRadius: "4px",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      backgroundColor: tokens.colorNeutralStroke2, // Slightly darker on hover
    },
  },
  inputContainer: {
    display: "flex",
    padding: "12px 16px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    alignItems: "flex-end",
    gap: "8px",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  chatHeader: {
    padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    zIndex: 10,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    margin: 0,
    color: tokens.colorNeutralForeground1,
  },
  message: {
    display: "flex",
    flexDirection: "column",
    padding: "12px 16px",
    borderRadius: "8px",
    maxWidth: "85%",
    wordBreak: "break-word",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  systemMessage: {
    alignSelf: "flex-start",
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
  },
  streamingDot: {
    display: "inline-block",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
    marginLeft: "4px",
    animation: "pulse 1.5s infinite",
    "@keyframes pulse": {
      "0%": { opacity: 0.2 },
      "20%": { opacity: 1 },
      "100%": { opacity: 0.2 },
    },
  },
  textarea: {
    flex: "1 1 auto",
    resize: "none",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: "8px",
    padding: "8px 12px",
    backgroundColor: tokens.colorNeutralBackground1,
    maxHeight: "80px",
    overflowY: "hidden", // Hide scrollbars when not needed
    "&:focus": {
      overflowY: "auto", // Show scrollbars only when focused and needed
    },
    "&::-webkit-scrollbar": {
      width: "6px", // Even narrower scrollbar for textarea
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent", // Initially transparent
    },
    "&:hover::-webkit-scrollbar-thumb": {
      backgroundColor: tokens.colorNeutralStroke3, // Show on hover
    },
  },
  sendButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "40px",
    width: "40px",
    minWidth: "40px",
    padding: "0",
    borderRadius: "20px",
  }
});

const TextInsertion: React.FC<TextInsertionProps> = (props: TextInsertionProps) => {
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm Local Pilot powered by Your Local LLM. How can I help you today?", isUser: false, timestamp: new Date() }
  ]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamedText, setStreamedText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const styles = useStyles();

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isStreaming) return;

    // Add user message to chat
    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText("");

    try {
      // Start streaming indicator
      setIsStreaming(true);
      setStreamedText("");

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Start streaming the response
      const fullResponse = await streamChatResponse(
        [...messages, userMessage],
        (text) => setStreamedText(text),
        abortControllerRef.current
      );

      // After streaming completes, add the full message
      const responseMessage: Message = {
        text: fullResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prevMessages => [...prevMessages, responseMessage]);

      // Check if we should insert text into the document
      if (fullResponse.includes("[INSERT]")) {
        // Extract text between [INSERT] and [/INSERT] tags
        const match = fullResponse.match(/\[INSERT\]([\s\S]*?)\[\/INSERT\]/);
        const textToInsert = match ? match[1].trim() : userMessage.text;
        await props.insertText(textToInsert);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsStreaming(false);
      setStreamedText("");
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${message.isUser ? styles.userMessage : styles.systemMessage}`}
          >
            {message.text}
          </div>
        ))}

        {isStreaming && (
          <div className={styles.message + ' ' + styles.systemMessage}>
            {streamedText || <span>Thinking<span className={styles.streamingDot}/><span className={styles.streamingDot}/><span className={styles.streamingDot}/></span>}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputContainer}>
        <Textarea
          value={inputText}
          onChange={handleTextChange}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          resize="none"
          className={styles.textarea}
          rows={1}
          disabled={isStreaming}
        />
        <Button
          appearance="primary"
          icon={isStreaming ? undefined : <Send24Regular />}
          onClick={isStreaming ? handleStopGeneration : handleSendMessage}
          className={styles.sendButton}
          disabled={isStreaming ? false : !inputText.trim()}
        >
          {isStreaming ? "Stop" : ""}
        </Button>
      </div>
    </div>
  );
};

export default TextInsertion;