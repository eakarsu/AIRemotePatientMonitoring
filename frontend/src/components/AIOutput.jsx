import React from 'react';
import NativeAIReport from './NativeAIReport';
export default function AIOutput({content,title}) { return content === null || content === undefined ? null : <NativeAIReport response={content} title={title || 'AI analysis'} />; }
