import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button, Textarea, tokens, makeStyles } from "@fluentui/react-components";
import { Send24Regular } from "@fluentui/react-icons";
import HeroList, { HeroListItem } from "./HeroList";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular } from "@fluentui/react-icons";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button as FluentButton } from "@fluentui/react-components"; // Import Fluent UI Button
import { Add24Regular } from "@fluentui/react-icons";
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
  heroListContainer: {
    padding: "20px 20px 10px 20px",
    flexShrink: 0, // Prevent hero list from shrinking
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
     // Add markdown-specific styles
  markdown: {
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: '16px',
      marginBottom: '8px',
      fontWeight: tokens.fontWeightSemibold,
    },
    '& h1': { fontSize: tokens.fontSizeBase600 },
    '& h2': { fontSize: tokens.fontSizeBase500 },
    '& h3': { fontSize: tokens.fontSizeBase400 },
    '& p': {
      margin: '8px 0',
      lineHeight: '1.5',
    },
    '& ul, & ol': {
      paddingLeft: '20px',
      margin: '8px 0',
    },
    '& li': {
      margin: '4px 0',
    },
    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& blockquote': {
      borderLeft: `4px solid ${tokens.colorNeutralStroke2}`,
      paddingLeft: '16px',
      margin: '16px 0',
      color: tokens.colorNeutralForeground2,
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '16px 0',
    },
    '& th, & td': {
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      padding: '8px',
      textAlign: 'left',
    },
    '& code': {
      fontFamily: 'monospace',
      backgroundColor: tokens.colorNeutralBackground3,
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '0.9em',
    },
    '& pre': {
      margin: '16px 0',
      borderRadius: '8px',
      overflow: 'auto',
    },
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
  },
  messageWrapper: {
    position: "relative",
  },
  insertButton: {
    position: "absolute",
    bottom: "-8px",
    right: "-8px",
    backgroundColor: "transparent",
    color: tokens.colorBrandBackground,
    border: "none",
    borderRadius: "50%",
    padding: "0",
    cursor: "pointer",
    fontSize: "16px",
    height: "24px",
    width: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1,
      borderRadius: "4px",
    },
    "&:active": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  markdown: {
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: '16px',
      marginBottom: '8px',
      fontWeight: tokens.fontWeightSemibold,
    },
    '& h1': { fontSize: tokens.fontSizeBase600 },
    '& h2': { fontSize: tokens.fontSizeBase500 },
    '& h3': { fontSize: tokens.fontSizeBase400 },
    '& p': {
      margin: '8px 0',
      lineHeight: '1.5',
    },
    '& ul, & ol': {
      paddingLeft: '20px',
      margin: '8px 0',
    },
    '& li': {
      margin: '4px 0',
    },
    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& blockquote': {
      borderLeft: `4px solid ${tokens.colorNeutralStroke2}`,
      paddingLeft: '16px',
      margin: '16px 0',
      color: tokens.colorNeutralForeground2,
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '16px 0',
    },
    '& th, & td': {
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      padding: '8px',
      textAlign: 'left',
    },
    '& code': {
      fontFamily: 'monospace',
      backgroundColor: tokens.colorNeutralBackground3,
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '0.9em',
    },
    '& pre': {
      margin: '16px 0',
      borderRadius: '8px',
      overflow: 'auto',
    },
  },
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

  const listItems: HeroListItem[] = [
    {
      icon: <Ribbon24Regular primaryFill={tokens.colorBrandForeground1} />,
      primaryText: "Achieve more with Office integration",
    },
    {
      icon: <LockOpen24Regular primaryFill={tokens.colorBrandForeground1} />,
      primaryText: "Unlock features with Local LLMs",
    },
    {
      icon: <DesignIdeas24Regular primaryFill={tokens.colorBrandForeground1} />,
      primaryText: "Build AI Feature with Local LLM faster",
    }
  ];

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

  const handleInsertText = async (text: string) => {
    await props.insertText(text);
  };

  const components = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer}>
        <div className={styles.heroListContainer}>
          <HeroList
            message="Discover what Local Pilot can do for you today!"
            items={listItems}
          />
        </div>
        {messages.map((message, index) => (
          <div key={index} className={styles.messageWrapper}>
            <div
              className={`${styles.message} ${message.isUser ? styles.userMessage : styles.systemMessage} ${styles.markdown}`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {message.text}
              </ReactMarkdown>
            </div>
            {!message.isUser && (
              <FluentButton
                onClick={() => handleInsertText(message.text)}
                className={styles.insertButton}
              >
                <Add24Regular />
              </FluentButton>
            )}
          </div>
        ))}

        {isStreaming && (
          <div className={`${styles.message} ${styles.systemMessage} ${styles.markdown}`}>
            {streamedText ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {streamedText}
              </ReactMarkdown>
            ) : (
              <span>Thinking<span className={styles.streamingDot}/><span className={styles.streamingDot}/><span className={styles.streamingDot}/></span>
            )}
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