import React from 'react'

const EmptyChat = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      <div className="m-auto max-w-sm text-center">
        <h2 className="mb-2 text-lg font-medium">Start a conversation</h2>

        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Ask questions, explore your documents, and get answers based on your
          sources.
        </p>
      </div>
    </div>
  );
}

export default EmptyChat