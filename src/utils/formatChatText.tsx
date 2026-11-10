import React from 'react';

/**
 * Renders lightweight inline bold (**text**) and italic (*text*) safely in React
 * without dangerouslySetInnerHTML.
 */
export function renderFormattedChatText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Parse **bold** and *italic* segments
    const tokens = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <React.Fragment key={lineIdx}>
        {tokens.map((token, idx) => {
          if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
            return (
              <strong key={idx} className="font-semibold text-neutral-950 dark:text-white">
                {token.slice(2, -2)}
              </strong>
            );
          }
          if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
            return (
              <em key={idx} className="italic text-neutral-700 dark:text-[#d4d4d4]">
                {token.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={idx}>{token}</React.Fragment>;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
