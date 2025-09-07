import React, { useRef, useEffect } from 'react';

const toolbarButtonClass = "p-2 rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark active:bg-border-light dark:active:bg-border-dark transition-colors text-text-secondary-light dark:text-text-secondary-dark w-9 h-9 flex items-center justify-center";

const RichTextEditor: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        handleInput();
    };

    return (
        <div className="border border-border-light dark:border-border-dark rounded-lg flex flex-col bg-transparent">
            <div className="flex items-center gap-1 p-2 border-b border-border-light dark:border-border-dark bg-surface-muted-light dark:bg-surface-muted-dark rounded-t-lg flex-shrink-0 flex-wrap">
                <button type="button" onClick={() => execCmd('bold')} className={toolbarButtonClass} title="Bold"><b className="text-base">B</b></button>
                <button type="button" onClick={() => execCmd('italic')} className={toolbarButtonClass} title="Italic"><i className="text-base">I</i></button>
                <button type="button" onClick={() => execCmd('underline')} className={toolbarButtonClass} title="Underline"><u className="text-base">U</u></button>
                <div className={`${toolbarButtonClass} relative`} title="Text Color">
                    <span className="font-bold text-lg">A</span>
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-current"></div>
                    <input
                        type="color"
                        onChange={(e) => execCmd('foreColor', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1"></div>
                <button type="button" onClick={() => execCmd('insertUnorderedList')} className={toolbarButtonClass} title="Unordered List">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
                <button type="button" onClick={() => execCmd('insertOrderedList')} className={toolbarButtonClass} title="Ordered List">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4l2-2h-2v-2"></path></svg>
                </button>
            </div>
            <div
                ref={editorRef}
                onInput={handleInput}
                contentEditable={true}
                className="p-4 bg-transparent focus:outline-none rounded-b-lg prose dark:prose-invert max-w-none prose-sm"
            />
        </div>
    );
};

export default RichTextEditor;