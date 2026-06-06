import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

const SUGGESTIONS = ['Cilantro', 'Blue cheese', 'Liver', 'Anchovies', 'Durian', 'Oysters'];

interface Step3DislikesProps {
  dislikes: string[];
  onChange: (values: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step3Dislikes: React.FC<Step3DislikesProps> = ({ dislikes, onChange, onNext, onBack }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !dislikes.includes(trimmed)) {
      onChange([...dislikes, trimmed]);
    }
  };

  const removeTag = (tag: string) => {
    onChange(dislikes.filter((d) => d !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
      setInput('');
    } else if (e.key === 'Backspace' && input === '' && dislikes.length > 0) {
      removeTag(dislikes[dislikes.length - 1]);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '480px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          What don't you enjoy eating?
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-6)',
          }}
        >
          Add ingredients or dishes you'd rather avoid.
        </p>

        {/* Input area */}
        <div
          style={{
            border: '1px solid var(--color-accent-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-surface)',
            minHeight: '56px',
            cursor: 'text',
            marginBottom: 'var(--space-4)',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
            <AnimatePresence>
              {dislikes.map((tag) => (
                <motion.span
                  key={tag}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-border)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '13px',
                    color: 'var(--color-accent-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {tag}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                      padding: 0,
                      fontSize: '14px',
                      lineHeight: 1,
                      minWidth: '16px',
                      minHeight: '16px',
                    }}
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={dislikes.length === 0 ? 'Type an ingredient or dish...' : ''}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                minWidth: '160px',
                flex: 1,
              }}
            />
          </div>
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-label)',
              marginBottom: 'var(--space-2)',
            }}
          >
            COMMON DISLIKES
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button
              onClick={onNext}
              style={{
                background: 'none',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              I like everything
            </button>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => addTag(s)}
                disabled={dislikes.includes(s)}
                style={{
                  background: dislikes.includes(s) ? 'var(--color-accent-glow)' : 'none',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  color: dislikes.includes(s) ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                  cursor: dislikes.includes(s) ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" size="md" onClick={onBack} style={{ flex: 1 }}>
            Back
          </Button>
          <Button variant="primary" size="md" onClick={onNext} style={{ flex: 2 }}>
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Step3Dislikes;
