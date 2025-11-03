import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Message as MessageType } from '../../types';
import { Card } from '../UI/Card';

export interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  className?: string;
}

export const Message: React.FC<MessageProps> = ({
  message,
  isStreaming = false,
  className
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div
        className={clsx(
          'flex max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        <div
          className={clsx(
            'flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium',
            isUser
              ? 'bg-blue-500 text-white ml-3'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mr-3',
            isStreaming && isAssistant && 'animate-pulse'
          )}
        >
          {isUser ? '👤' : '🤖'}
        </div>

        {/* Message Content */}
        <Card
          className={clsx(
            'flex-1 p-3 sm:p-4',
            isUser
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700'
          )}
        >
          <div className="space-y-2">
            {/* Message Text */}
            <div className="prose prose-sm sm:prose-base max-w-none">
              {typeof message.content === 'string' ? (
                <MessageContent 
                  content={message.content} 
                  isStreaming={isStreaming && isAssistant}
                />
              ) : (
                <div className="space-y-2">
                  {message.content.map((item, index) => (
                    <div key={index}>
                      {item.type === 'text' && item.text && (
                        <MessageContent 
                          content={item.text} 
                          isStreaming={isStreaming && isAssistant && index === message.content.length - 1}
                        />
                      )}
                      {item.type === 'image_url' && item.image_url && (
                        <img
                          src={item.image_url.url}
                          alt="Message attachment"
                          className="max-w-full h-auto rounded-lg"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Metadata */}
            <div className="flex items-center justify-between text-xs opacity-70">
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {message.creditsUsed && (
                <span className="flex items-center">
                  💰 {message.creditsUsed} credits
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, isStreaming }) => {
  return (
    <div className="whitespace-pre-wrap break-words">
      {content}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-current ml-1"
        />
      )}
    </div>
  );
};